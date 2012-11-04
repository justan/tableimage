
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
    , imageData, table
    ;
  
  ctx.drawImage(img, 0, 0);
  imageData = ctx.getImageData(0, 0, width, height).data;
  
  table = colorTable(imageData, width);
  
  var curRow, cur;
  for(var y = 0, h = table.length; y < h; y++){
    str.push('<tr>');
    curRow = table[y];
    for(var x = 0, w = curRow.length; x < w; x++){
      cur = curRow[x];
      if(cur){
        str.push('<td');
        
        cur.colspan > 1 && str.push(' colspan=', cur.colspan);
        cur.rowspan > 1 && str.push(' rowspan=', cur.rowspan);
        
        y || str.push(' width=1');//for chrome
        
        if(cur.alpha){
          if(cur.alpha < 1){
            str.push(' style=opacity:', cur.alpha);
            ignoreOldIE || str.push(';filter:alpha(opacity=', cur.alpha * 100, ')');
          }
          
          cur.color && str.push(' bgcolor=', cur.color);
        }
        
        str.push('></td>');
      }
    }
    str.push('</tr>');
  }
  str = '<table width=' + width + ' height=' + height + ' cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:0;font-size: 0;">' + str.join('') + '</table>'
  return str;
};

function rgbToHex(rgb){
  var r = rgb[0].toString(16)
    , g = rgb[1].toString(16)
    , b = rgb[2].toString(16)
    ;
  
  r = r.length === 1 ? ('0' + r) : r;
  g = g.length === 1 ? ('0' + g) : g;
  b = b.length === 1 ? ('0' + b) : b;
  
  r = ('0x' + r) % 17 ? r : r.charAt(0);
  g = ('0x' + g) % 17 ? g : g.charAt(0);
  b = ('0x' + b) % 17 ? b : b.charAt(0);
  
  return '#' + r + g + b;
}

function colorTable(imageData, width){
  var table = [], colorRow = []
    , alpha, color
    ;
  
  for(var i = 0, l = imageData.length; i < l; i += 4){
    if((i / 4) % width === 0){
      colorRow = [];
      table.push(colorRow);
    }
    
    alpha = Math.round(imageData[i + 3] * 100 / 255) / 100;//accuracy 1/100
    color = alpha ? rgbToHex([imageData[i], imageData[i + 1], imageData[i + 2]]) : '';
      
    colorRow.push({alpha: alpha, color: color, colspan: 1, rowspan: 1});
    
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

tableImage.convert = convert;
exports.tableImage = tableImage;
return tableImage;
})(typeof module !== 'undefined' && this.module !== module ? module.exports : window);