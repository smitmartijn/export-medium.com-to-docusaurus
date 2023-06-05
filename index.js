const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
var utils = require('./node_modules/mediumexporter/utils');
const mediumExporter = require('medium-to-markdown');
const axios = require('axios');

const author = 'CHANGEME';

// Read the HTML file
const html = fs.readFileSync('list.html');

// Load the HTML into Cheerio
const $ = cheerio.load(html);

// Select all the H3 tags that have a class of "post-title"
const postTitles = $('h3.post-title');

// Loop through each post title and extract the link and title
postTitles.each(async (i, title) => {
  const link = $(title).find('a').attr('href').split('?')[0];
  const text = $(title).find('a').text();

  // Extract the slug from the link and remove the query string and parameters
  const slug = link.split('/').pop().split('?')[0];

  console.log(`Link: ${link}\nTitle: ${text}\nSlug: ${slug}\n`);

  // Use mediumexporter to get the Markdown content from the link. the below code is mostly from mediumexporter/index.js
  utils.loadMediumPost(link, function (err, json) {

    var s = json.payload.value;
    var story = {};

    story.title = s.title;
    story.date = new Date(s.firstPublishedAt);
    story.url = s.canonicalUrl;
    story.language = s.detectedLanguage;
    story.license = s.license;

    const year = story.date.getFullYear();
    const month = (story.date.getMonth() + 1).toString().padStart(2, '0');
    const date = story.date.getDate().toString().padStart(2, '0');

    story.formattedDate = `${year}-${month}-${date}`;
    story.sections = s.content.bodyModel.sections;
    story.paragraphs = s.content.bodyModel.paragraphs;

    var sections = [];
    for (var i = 0; i < story.sections.length; i++) {
      var s = story.sections[i];
      var section = utils.processSection(s);
      sections[s.startIndex] = section;
    }

    if (story.paragraphs.length > 1) {
      story.subtitle = story.paragraphs[1].text;
    }

    story.markdown = [];
    var promises = [];

    for (var i = 2; i < story.paragraphs.length; i++) {

      if (sections[i]) story.markdown.push(sections[i]);

      var promise = new Promise(function (resolve, reject) {
        var p = story.paragraphs[i];
        utils.processParagraph(p, function (err, text) {
          // Avoid double title/subtitle
          if (text != story.markdown[i])
            return resolve(text);
          else
            return resolve();
        });
      });
      promises.push(promise);
    }

    Promise.all(promises).then((results) => {
      results.map(text => {
        story.markdown.push(text);
      });

      const blog_dir = story.formattedDate + "-" + slug;
      fs.mkdir(path.join(__dirname, blog_dir), (err) => {
        if (err) {
          return console.error(err);
        }
        var markdownText = story.markdown.join('\n');
        // Write the Markdown content to a file with the same name as the slug
        var markdown = `---\n`;
        markdown += `slug: ${slug}\n`;
        markdown += `title: '${story.title}'\n`;
        markdown += `authors: [${author}]\n`;
        markdown += `---\n`;
        markdown += markdownText;
        const markdownFilePath = path.resolve(path.join(__dirname, blog_dir), `index.md`);
        fs.writeFileSync(markdownFilePath, markdown);
        console.log(`File ${slug}.md was created successfully!`);
      });
    });
  });
});