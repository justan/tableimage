tableimage
==========

convert image to html table. a javascript version. Inspire by [http://news.ycombinator.com/item?id=4442041](http://news.ycombinator.com/item?id=4442041).

## 安装

  - In node: `npm install tableimage`
  - In browser: `<script type="text/javascript" src="tableimage.js"></script>` 
  
## 用法示例

  - In node: 
      
        var Image = require('canvas').Image,
          , fs = require('fs')
          , tableImage = require('tableimage').tableImage
          ;
        
        var img = new Image;
        fs.readFile(__dirname + '/taiji.png', function(err, buffer){
          if(!err && buffer){
            img.src = buffer;
            fs.writeFileSync(__dirname + '/out.html', tableImage.convert(img), 'utf8');
          }
        });

  - In browser: 
       
        var img = document.getElementById('pic')//需要转换的图片
          , out = document.getElementById('out');//显示容器
       
        var table = tableImage.convert(img);
        out.innerHTML = table;
        
### options:

  `tableimage.convert` 接收的第二个参数. 
  - options.ignoreOldIE 是否不需要支持老掉牙的 IE (< 9.0)?
  - options.background 指定背景的 rgb 值. 如: [255, 0, 0]
  - options.maxWidth 转换后 table 的最大宽度(px), 超出此值将缩放图片
  - options.maxHeight 最大高度
        
## Demo
[在线示例](http://justan.github.com/tableimage)

## License
MIT