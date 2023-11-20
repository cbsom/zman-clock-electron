var fs = require('fs')
var path = './dist/index.html';
fs.readFile(path, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  //REmove the leading backslash from the React-injected files.
  //This is because for the Electron project, the server root is the outer folder while
  //React thinks that the inner /dist/ folder is the root.
  var result = data.replace(/\/assets\//gi, 'assets/');

  fs.writeFile(path, result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
});