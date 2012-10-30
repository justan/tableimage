
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

var convert = function(img, bgRgb){
  var width = img.width
    , height = img.height
    , canvas = new Canvas(width, height)
    , ctx = canvas.getContext('2d')
    , imageData
    ;
  
  ctx.drawImage(img, 0, 0);
  imageData = ctx.getImageData(0, 0, width, height).data;
  
  var pos, color;
  for(var y = 0; y < height; y++){
    str.push('<tr height=1>');
    for(var x = 0; x < width; x++){
      pos = (width * y + x) * 4;
      color = rgbaToHex([
          imageData[pos]
        , imageData[pos + 1]
        , imageData[pos + 2]
        , imageData[pos + 3]
      ], bgRgb);
        
      str.push('<td bgcolor=');
      str.push(color);
      y === 0 && str.push(' width=1');
      str.push('></td>');
    }
    str.push('</tr>');
  }
  str = '<table width=' + width + ' height=' + height + ' cellspacing="0" cellpadding="0" border="0" style="font-size: 0;">' + str.join('') + '</table>'
  return str;
};

var rgbaToHex = function(rgba, bgRgb){
  var a = rgba[3] / 255
    , r = Math.round((1 - a) * bgRgb[0] + a * rgba[0]).toString(16)
    , g = Math.round((1 - a) * bgRgb[1] + a * rgba[1]).toString(16)
    , b = Math.round((1 - a) * bgRgb[2] + a * rgba[2]).toString(16)
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