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
      return err ? reject(err) : resolve(true);
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

}

process.argv.slice(2).forEach(inputPath => {
  const layoutPath = 'src/layout/post.ejs';
  const outputPath = deduceOutputPath(inputPath);

  Promise.all([readFile(layoutPath), readFile(inputPath)])
  .then(([layout, input]) => {
    const { metadata, markdown } = splitMetadata(input);
    const article = marked(markdown);
    const html = ejs.render(layout, { metadata, article });
    return Promise.resolve(html);
  })
  .then(html => writeFile(outputPath, html))
  .catch(err => console.error(err));
});
