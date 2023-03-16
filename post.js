#!/usr/bin/env node
const argumentate = require('argumentate');
const cohost = require('cohost');
const fs = require('fs');

const configFile = fs.readFileSync('cohost.json', 'utf-8');
const config = JSON.parse(configFile);

const { options, variables } = argumentate({
  args: process.argv.slice(2),
  mapping: {
    a: {
      key: 'adult-content',
      help: 'Is this post likely to offend someone?',
    },
    c: {
      key: 'content-warning',
      help: 'Advisories for the topics discussed or images shown',
    },
    h: {
      key: 'headline',
      help: 'Title for the post',
    },
    i: {
      key: 'image',
      help: 'A (local) image file to attach to the post',
    },
    s: {
      key: 'status',
      help: 'The main body of the post, in Markdown',
    },
    t: {
      key: 'tags',
      help: 'A comma-delimited list of tags for the post',
    },
  },
  config: {
    name: 'Cohost Post (Copost?)',
    command: 'post.js with some arguments',
  },
});

(async function () {
  let user = new cohost.User();
  await user.login(config.email, config.password);

  let [project] = await user.getProjects();
  let posts = await project.getPosts();

  console.log(posts);
  return;
})();
