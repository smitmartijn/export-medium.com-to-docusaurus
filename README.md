# Exporting Medium.com articles to Docusaurus

Quick & dirty way to export articles from [Medium](https://medium.com) into markdown files that can be used in [Docusaurus](https://docusaurus.io/)

## Usage

First, browse to the Medium page that has your **Published** posts. For a publication, it's this url: https://medium.com/YOURPUBLICATION/stories/published

Inspect the page using your browser developer tools, and search for this starting tag:

```
<div class="container u-maxWidth1072 u-marginTop10 u-marginBottom40 js-collectionManagerStoriesStream">
```

Copy the contents of that entire div into a new file called `list.html` inside the directory of this repository. Lastly, change the author name in `index.js` to a handle that's available in your Docusaurus' `authors.yml`

```
const author = 'CHANGEME';
```

Then run the following commands:

```
npm install # for dependencies
node index.js
php download-images.php
```

Running `index.js` will create folders and fetch the article content in markdown. The PHP script `download-images.php` downloads any images inside the articles and puts them in the article directory. The images script is PHP because I don't have the patience for the weird async stuff in NodeJS. 😅

Once above commands are done, you can copy and paste the newly created directories into your Docusaurus blog dir.

