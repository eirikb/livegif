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
encoder.setRepeat(0);
encoder.setDelay(300);
encoder.setQuality(10);
encoder.start();

var stream = encoder.createReadStream();
var canvas = new Canvas(320, 240);
var ctx = canvas.getContext('2d');

var cbs = [];

var firstData;

stream.addListener('data', function(data) {
  if (!firstData) firstData = data;

  console.log('cbs: ', cbs.length);
  cbs.forEach(function(cb) {
    cb(data);
  });
});

app.get('/wat.gif', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/gif'
  });

  res.write(firstData);

  cbs.push(function(data) {
    res.write(data);
  });
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
        ctx.drawImage(img, 0, 0, 900, 400);
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
