var fs = require('fs')
  , Canvas = require('canvas')
  , Image = Canvas.Image
  , tableImage = require('../').tableImage
  , convert = tableImage.convert 
  ;

var img = new Image;
fs.readFile('./canvas.png', function(err, buffer){
  img.src = buffer;
  fs.writeFileSync('./out.html', convert(img, [255, 255, 255]), 'utf8');
});
