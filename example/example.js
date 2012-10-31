var fs = require('fs')
  , Canvas = require('canvas')
  , Image = Canvas.Image
  , tableImage = require('../').tableImage
  , convert = tableImage.convert 
  ;

var img = new Image;
fs.readFile(__dirname + '/taiji.png', function(err, buffer){
  img.src = buffer;
  fs.writeFileSync(__dirname + '/out.html', convert(img), 'utf8');
});
