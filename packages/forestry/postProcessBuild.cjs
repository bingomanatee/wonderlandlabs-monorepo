// scripts/add-js-suffixes.js
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, 'build/src'); // Adjust to your output directory
const extRegex = /\.(js|json|mjs|ts|tsx|css|html|png|jpg|jpeg|gif)$/; // Match any valid extension

function processFiles(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);

    if (fs.statSync(filePath).isDirectory()) {
      processFiles(filePath); // Recursively process subdirectories
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Log the file being processed

      // Update the content by adding `.js` only when no valid extension exists
      content = content.replace(
        /((?:import|export).*?['"])(\.{1,2}\/.*?)(['"])/g,
        (match, prefix, importPath, suffix) => {
          // Only add .js if the path has no extension
          if (!extRegex.test(importPath)) {
            const newPath = `${importPath}.js`;
            return `${prefix}${newPath}${suffix}`;
          } else {
            return match;
          }
        },
      );

      fs.writeFileSync(filePath, content);
    }
  }
}

processFiles(dir);
