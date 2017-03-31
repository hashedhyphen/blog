'use strict';

const ejs = require('ejs');
const fm = require('front-matter');
const fs = require('fs');
const marked = require('marked');
const mkdirp = require('mkdirp');
const path = require('path');

function readFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  });
}

function writeFile(filepath, data) {
  return new Promise((resolve, reject) => {
    mkdirp.sync(path.dirname(filepath));
    fs.writeFile(filepath, data, 'utf8', err => {
      return err ? reject(err) : resolve(filepath);
    });
  });
}

function deduceOutputPath(input) {
  const basename = path.basename(input, '.md');
  const regexp = /^(\d+)-(\d+)-(\d+)-(.+)$/;
  const [, year, month, date, title] = regexp.exec(basename);

  return `__build/posts/${year}/${month}/${date}/${title}.html`;
}

function splitMetadata(data) {
  const { attributes: metadata, body: markdown } = fm(data);
  return { metadata, markdown };
}

function buildPosts(inputPaths) {
  return Promise.all(inputPaths.map(inputPath => buildPost(inputPath)));
}

function buildPost(inputPath) {
  const layoutPath = 'src/layout/post.ejs';
  const outputPath = deduceOutputPath(inputPath);

  let title = '';

  return Promise.all([readFile(layoutPath), readFile(inputPath)])
  .then(([layout, input]) => {
    const { metadata, markdown } = splitMetadata(input);
    title = metadata.title;

    const article = marked(markdown);
    const html = ejs.render(layout, { metadata, article });

    return Promise.resolve(html);
  })
  .then(html => writeFile(outputPath, html))
  .then(renderedPath => {
    const [year, month, day] = renderedPath.split(path.sep).slice(2, 5);
    const href = outputPath.replace('__build', '');
    return Promise.resolve({ year, month, day, href, title });
  })
  .catch(err => console.error(err));
}

function compareStats(a, b) {
  if (a.year < b.year) { return  1; }
  if (a.year > b.year) { return -1; }

  // a.year === b.year
  if (a.month < b.month) { return  1; }
  if (a.month > b.month) { return -1; }

  // a.year === b.year && a.month === b.month
  if (a.day < b.day) { return  1; }
  if (a.day > b.day) { return -1; }

  // exact same
  return 0;
}

function buildIndex(stats) {
  const sorted = stats.sort(compareStats);
  readFile('src/layout/index.ejs')
  .then(layout => Promise.resolve(ejs.render(layout, { stats: sorted })))
  .then(html => writeFile('__build/index.html', html));
}

const inputPaths = process.argv.slice(2);
buildPosts(inputPaths).then(buildIndex);
