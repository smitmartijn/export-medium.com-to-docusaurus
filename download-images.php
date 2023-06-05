<?php

// Define the directory to search (relative to the current directory)
$dir = "./";

// Create a recursive iterator to find all the index.md files in directories starting with "20"
$iterator = new RecursiveIteratorIterator(
  new RecursiveDirectoryIterator(
    $dir,
    RecursiveDirectoryIterator::SKIP_DOTS | RecursiveDirectoryIterator::FOLLOW_SYMLINKS
  ),
  RecursiveIteratorIterator::CHILD_FIRST
);

// Loop through each file
foreach ($iterator as $file) {
  echo $file . "\n";
  // Only process markdown files that start with "20"
  if (preg_match('/index.md$/', $file)) {
    // Read the content of the file
    $content = file_get_contents($file);

    // Search for images using regex
    // This will match images in the following syntax: ![alt text](url)
    preg_match_all('/!\[.*?\]\((.*?)\)/', $content, $matches);

    if (empty($matches)) {
      continue;
    }

    // Loop through each match
    foreach ($matches[1] as $url) {
      // Only download remote images (i.e., images that start with "http" or "https")
      if (strpos($url, "http") === 0) {
        // Download the image to the same directory as the index.md file
        $filename = basename($url);
        $path = dirname($file->getPathname()) . "/{$filename}";
        file_put_contents($path, file_get_contents($url));

        // Replace the URL in the markdown syntax with the local path
        $content = str_replace($url, "./{$filename}", $content);

        echo "Downloaded " . $url . " to " . $path . "\n";
      }
    }

    // Write the updated content back to the file
    file_put_contents($file->getPathname(), $content);
  }
}
