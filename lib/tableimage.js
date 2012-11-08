
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

/**
 * 将图片转换成 html table
 * @param {Object} img 在浏览器中是图片的 dom 对象, 在 node.js 中是 Canvas.Image 的实例
 * @param {Object} [options]
 * @param {Boolean} options.ignoreOldIE 是否不需要支持老掉牙的 IE (< 9.0)?
 * @param {Array} options.background 指定背景的 rgb 值. 如: [255, 0, 0]
 * @param {Number} options.maxWidth 转换后 table 的最大宽度(px), 超出此值将缩放图片
 * @param {Number} options.maxHeight 最大高度
 * @return {String} 生成的 table html 代码
 */
var convert = function(img, options){
  var width = img.width
    , height = img.height
    , rate = width / height
    , canvas, ctx
    , imageData, table
    , scaleRate = 1
    , str = []
    , colorInfo = {rowColors: [], rowBg: []}
    ;
  
  options = options || {};
  
  if(options.maxWidth || options.maxHeight){
    if(options.maxWidth < width){
      scaleRate = options.maxWidth / width * scaleRate;
      height = Math.round(height * options.maxWidth / width);
      width = Math.round(options.maxWidth);
    }
    if(options.maxHeight < height){
      scaleRate = options.maxHeight / height * scaleRate;
      width = Math.round(width * options.maxHeight / height);
      height = Math.round(options.maxHeight);
    }
  }
  
  canvas = new Canvas(width, height);
  ctx = canvas.getContext('2d');
  ctx.scale(scaleRate, scaleRate);
  
  ctx.drawImage(img, 0, 0);
  imageData = ctx.getImageData(0, 0, width, height).data;
  
  table = colorTable(imageData, width, options);
  
  colorInfo = getColorInfo(table);
  
  var curRow, cur;
  for(var y = 0, h = table.length; y < h; y++){
    colorInfo.rowBg[y] && colorInfo.bg !==  colorInfo.rowBg[y] ? str.push('<tr bgcolor=', colorInfo.rowBg[y], '>') : str.push('<tr>');
    curRow = table[y];
    for(var x = 0, w = curRow.length; x < w; x++){
      cur = curRow[x];
      if(cur){
        str.push('<td');
        
        cur.colspan > 1 && str.push(' colspan=', cur.colspan);
        cur.rowspan > 1 && str.push(' rowspan=', cur.rowspan);
        
        y || str.push(' width=1');//for chrome
        
        if(cur.alpha !== 0){
          if(cur.alpha < 1){
            str.push(' style=opacity:', cur.alpha);
            options.ignoreOldIE || str.push(';filter:alpha(opacity=', Math.round(cur.alpha * 100), ')');// 0.07 * 100 === 7.000000000000001
          }
          
          cur.color && cur.color !== colorInfo.rowBg[y] && str.push(' bgcolor=', cur.color);
        }
        
        str.push('></td>');
      }
    }
    str.push('</tr>');
  }
  str = '<table width=' + width + ' height=' + height + 
    (colorInfo.bg ? (' bgcolor=' + colorInfo.bg) : '') +
    ' cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:0;line-height:0px;">' + str.join('') + '</table>'
  return str;
};

function rgbToHex(rgba, options){
  var r = rgba[0]
    , g = rgba[1]
    , b = rgba[2]
    , a, bg
    ;
  
  if(options && options.background){
    bg = options.background;
    a = rgba[3] / 255;
    r = Math.round((1 - a) * bg[0] + a * r);
    g = Math.round((1 - a) * bg[1] + a * g);
    b = Math.round((1 - a) * bg[2] + a * b);
  }
  
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);
  
  r = r.length === 1 ? ('0' + r) : r;
  g = g.length === 1 ? ('0' + g) : g;
  b = b.length === 1 ? ('0' + b) : b;
  
  // IE bgcolor 不支持 #000 格式的缩写..
  // if(options && options.ignoreOldIE && r.charAt(0) === r.charAt(1) && g.charAt(0) === g.charAt(1) && b.charAt(0) === b.charAt(1)){
    // r = r.charAt(0);
    // g = g.charAt(0);
    // b = b.charAt(0);
  // }
  
  return '#' + r + g + b;
}

//转换 canvas imagedata 
function colorTable(imageData, width, options){
  var table = [], colorRow = []
    , alpha, color
    ;
  
  for(var i = 0, l = imageData.length; i < l; i += 4){
    if((i / 4) % width === 0){
      colorRow = [];
      table.push(colorRow);
    }
    
    
    if(options.background){
      color = rgbToHex([imageData[i], imageData[i + 1], imageData[i + 2], imageData[i + 3]], options);
      colorRow.push({color: color, colspan: 1, rowspan: 1});
    }else{
      alpha = Math.round(imageData[i + 3] * 100 / 255) / 100;//accuracy 1/100
      color = alpha ? rgbToHex([imageData[i], imageData[i + 1], imageData[i + 2]], options) : '';
      colorRow.push({alpha: alpha, color: color, colspan: 1, rowspan: 1});
    }
    
  }
  
  compressTable(table);
  return table;
}

//合并临近相同颜色的单元格
function compressTable(colorTable){
  var curRow
    , right, next
    , h = colorTable.length
    , w = colorTable[0].length
    ;
  
  for(var y = 1; y < h; y++){//第一行不参与合并, for chrome
    curRow = colorTable[y];
    for(var x = 0; x < w; x++){
      if(curRow[x]){
        col(x, x, y);//对每一个有效点进行检测
      }
    }
  }
  
  
  //x: 基点 x 值
  //x0: 要对比的 x 值
  function col(x, x0, y){
    var curRow = colorTable[y]
      ;
    
    if(x === x0){
      curRow[x + 1] ? col(x, x + 1, y) : row(x, x0, y + 1, curRow[x]);
    }else{
    
      if(x0 < w && curRow[x].color === curRow[x0].color && curRow[x].alpha === curRow[x0].alpha){
        curRow[x].colspan++;
        delete curRow[x0];
        curRow[x0 + 1] ? col(x, x0 + 1, y) : row(x, x0, y + 1, curRow[x]);
      }else{
        row(x, x0 - 1, y + 1, curRow[x]);
      }
      
    }
  }
  
  //按照一个基准 cur 纵向检查重复
  //x0: 横向起点
  //x1: 横向终点
  function row(x0, x1, y, cur){
    var nextRow;
    if(y + 1 < h){
      nextRow = colorTable[y];
      
      if(nextRow[x0 - 1] && nextRow[x1 + 1] && 
          nextRow[x0 - 1].color === cur.color && nextRow[x0 - 1].alpha === cur.alpha && 
          nextRow[x1 + 1].color === cur.color && nextRow[x1 + 1].alpha === cur.alpha){
          
        return;//碰到 ⊥ 形状, 不再纵向检查
      }
      
      for(var x = x0; x <= x1; x++){
        if(!nextRow[x] || nextRow[x].color !== cur.color || nextRow[x].alpha !== cur.alpha){
          return;
        }
      }
      
      cur.rowspan++;
      for(var x = x0; x <= x1; x++){
        delete nextRow[x];
      }
      
      row(x0, x1, y + 1, cur);
    }
  }
}

function getColorInfo(colorTable){
  var colors = {rowColors: [], rowBg:[], bg: '', all: {}, hasOpacity: false};
  var curRow, cur
    , rowColors
    ;
  for(var y = 0, h = colorTable.length; y < h; y++){
    rowColors = colors.rowColors[y] = {hasOpacity: false};
    curRow = colorTable[y];
    
    for(var x = 0, w = curRow.length; x < w; x++){
      cur = curRow[x];
      if(cur){
        if(cur.alpha < 1){
          colors.hasOpacity = true;
          rowColors.hasOpacity = true;
          break;
        }else{
          rowColors[cur.color] = rowColors[cur.color] || 0;
          colors.all[cur.color] = colors.all[cur.color] || 0;
          
          rowColors[cur.color]++;
          colors.all[cur.color]++;
        }
      }
    }
    
    if(!rowColors.hasOpacity){
      for(var rowColor in rowColors){
        colors.rowBg[y] = rowColors[colors.rowBg[y]] > rowColors[rowColor] ? colors.rowBg[y] : rowColor;
      }
    }
  }
  
  if(!colors.hasOpacity){
    for(var color in colors.all){
      colors.bg = colors.all[colors.bg] > colors.all[color] ? colors.bg : color;
    }
  }
  
  return colors;
}

tableImage.convert = convert;
exports.tableImage = tableImage;
return tableImage;
})(typeof module !== 'undefined' && this.module !== module ? module.exports : window);