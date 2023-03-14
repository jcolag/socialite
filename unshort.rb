# frozen_string_literal: true

require 'cgi'
require 'http'
require 'net/http'
require 'optparse'
require 'uri'

# Parses command-line options
class Options
  def self.parse(args)
    options = OpenStruct.new
    options.file = nil
    options.list = nil

    opt_parser = OptionParser.new do |opts|
      opts.banner = 'Usage:  schedule.rb [options]'
      opts.separator ''
      opts.separator 'Specific options:'
      opts.on('-f', '--file FILE', 'The file to parse') do |i|
        options.file = i
      end
      opts.on('-l', '--list FILE', 'The list of URL shorteners') do |i|
        options.list = i
      end
    end

    opt_parser.parse!(args)
    options
  end
end

def make_http(uri)
  ssl = uri.scheme == 'https'
  http = Net::HTTP.new uri.host, uri.port
  http.use_ssl = ssl
  # http.set_debug_output $stdout
  http
end

def error(response)
  valid = [200, 206, 301, 302, 303, 307, 308]
  !valid.include? response.code.to_i
end

def locate(location, shorteners)
  url = CGI.escape location.tr(',)', '') unless location.nil?
  result = URI url
  result = unshort URI(location), shorteners if shortener? location, shorteners
  result = URI location if result.nil?
  result
end

def unshort(uri, shorteners)
  # p uri.to_s
  http = make_http uri
  request = Net::HTTP::Get.new uri
  response = http.request request

  return uri if error response

  result = locate response['Location'], shorteners
  result = URI response['Location'] unless result.scheme.nil?
  result
rescue Errno::ECONNREFUSED, EOFError, ArgumentError
  uri
end

def shortener?(url, list)
  if url.nil?
    return false
  end

  list.each do |s|
    return true if url.include? s
  end

  false
end

options = Options.parse ARGV

return if options.file.nil?

replace = {}
tweets = File.read options.file
list = File.read options.list
shorteners = list.split("\n")
urls = URI.extract tweets, %w[http https]

urls.each do |u|
  uri = URI u
  replace[u] = unshort uri, shorteners if replace[u].nil? && shortener?(u, shorteners)
end

replace.each_pair do |k, v|
  # puts "[#{k}] --> [#{v}]"
  tweets.gsub! k, CGI.unescape(v.to_s)
end

File.write 'tweets.js', tweets
