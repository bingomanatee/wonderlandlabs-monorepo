const fs = require('fs');
const uglify = require('uglify-js');

const files = fs.readdirSync('./dist');

files.forEach((file) => {
  if (/\.js$/.test(file)) {
    const path = 'dist/' + file;
    const code = fs.readFileSync(path).toString();

    const compressed = uglify.minify(code).code;
    fs.writeFileSync(path, compressed);
  }
});
