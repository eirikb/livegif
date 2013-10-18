var GIFEncoder = require('gifencoder');
var Canvas = require('canvas-superjoe');
var fs = require('fs');
var http = require('http');
var express = require('express');

var app = express();
var server = http.createServer(app);
var io = require("socket.io").listen(server);

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

var encoder = new GIFEncoder(320, 240);
encoder.setRepeat(-1);
encoder.setDelay(0);
encoder.setQuality(10);
encoder.start();

var stream = encoder.createReadStream();
var canvas = new Canvas(320, 240);
var ctx = canvas.getContext('2d');

var first;
var all = new Buffer(0);
var rs = [];

stream.addListener('data', function(data) {
  all = Buffer.concat([all, data]);
  if (!first) {
    setTimeout(function() {
      first = new Buffer(all);
    }, 0);
  }

  rs.forEach(function(res) {
    var diff = all.length - res.pos;
    var end = res.pos + diff - 1;
    res.write(all.slice(res.pos, end));
    res.pos = end;
  });
});

app.get('/wat.gif', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/gif'
  });

  res.write(first);
  res.pos = all.length;
  rs.push(res);
});

server.listen(8080);

var ready = true;
io.sockets.on('connection', function(socket) {
  socket.on('data', function(data) {
    console.log(data.length);
    if (!ready) {
      console.log('not ready');
      return;
    }
    ready = false;
    fs.writeFile('frame.jpg', toBuffer(data), function() {
      var img = new Canvas.Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0, 320, 240);
        encoder.addFrame(ctx);
        ready = true;
      };
      img.src = data;
    });
  });
});

function toBuffer(string) {
  var regex = /^data:.+\/(.+);base64,(.*)$/;

  var matches = string.match(regex);
  var ext = matches[1];
  var data = matches[2];
  return new Buffer(data, 'base64');
}
