var fs = require('fs')
var path = './dist/index.html';
fs.readFile(path, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/\/assets\//gi, 'assets/');

  fs.writeFile(path, result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
});