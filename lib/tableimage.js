
(function(exports){
var tableImage = {}, Canvas;
if(typeof module !== "undefined" && this.module !== module){
  Canvas = require('canvas');//node.js
}else{
  Canvas = function(width, height){//browser
    var c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    return c;
  };
}

var str = [];

var convert = function(img, ignoreOldIE){
  var width = img.width
    , height = img.height
    , canvas = new Canvas(width, height)
    , ctx = canvas.getContext('2d')
    , imageData
    ;
  
  ctx.drawImage(img, 0, 0);
  imageData = ctx.getImageData(0, 0, width, height).data;
  
  var pos, color, alpha;
  for(var y = 0; y < height; y++){
    str.push('<tr>');
    for(var x = 0; x < width; x++){
      pos = (width * y + x) * 4;
        
      str.push('<td');
      
      y || str.push(' width=1');//for chrome
      
      if(imageData[pos + 3]){
        if(imageData[pos + 3] < 255){
          alpha = (imageData[pos + 3] / 255).toFixed(2);
          str.push(' style=opacity:', alpha);
          ignoreOldIE || str.push(';filter:alpha(opacity=', alpha * 100, ')');
        }
        
        color = rgbToHex([
            imageData[pos]
          , imageData[pos + 1]
          , imageData[pos + 2]
        ]);
        str.push(' bgcolor=', color);
      }
      
      str.push('></td>');
    }
    str.push('</tr>');
  }
  str = '<table width=' + width + ' height=' + height + ' cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:0;font-size: 0;">' + str.join('') + '</table>'
  return str;
};

var rgbToHex = function(rgb){
  var r = rgb[0].toString(16)
    , g = rgb[1].toString(16)
    , b = rgb[2].toString(16)
    ;
    
  return '#' + 
    (r.length === 1 ? ('0' + r) : r) + 
    (g.length === 1 ? ('0' + g) : g) + 
    (b.length === 1 ? ('0' + b) : b);
};

tableImage.convert = convert;
exports.tableImage = tableImage;
return tableImage;
})(typeof module !== 'undefined' && this.module !== module ? module.exports : window);