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

  const adult = Object.prototype.hasOwnProperty.call(options, 'adult_content');
  const cw = Object.prototype.hasOwnProperty.call(options, 'content_warning')
    ? [ options.content_warning ]
    : [];
  const headline = Object.prototype.hasOwnProperty.call(options, 'headline')
    ? options.headline
    : null;
  const markdown = {
    type: 'markdown',
    markdown: {
      content: options.status,
    },
  };
  const tags = Object.prototype.hasOwnProperty.call(options, 'tags')
    ? options.tags.split(',').map((t) => t.trim())
    : [];

  await cohost.Post.create(project, {
    postState: 1,
    headline: headline,
    adultContent: adult,
    blocks: [ markdown ],
    cws: cw,
    tags: tags,
  });

  // Create a draft with attachments

  // 1. Create a draft
  const draftId = await cohost.Post.create(myProject, basePost);

  // 2. Upload the attachment
  const attachmentData = await myProject.uploadAttachment(
    draftId,
    path.resolve(__dirname, './02-15_One_pr.png')
  );

  // 3. Add the attachment block to the draft and publish it
  await cohost.Post.update(myProject, draftId, {
    ...basePost,
    postState: 1,
    blocks: [
      ...basePost.blocks,
      { type: 'attachment', attachment: { ...attachmentData } }
    ]
  });
})();
