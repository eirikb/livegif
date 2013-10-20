var GIFEncoder = require('gifencoder');
var Canvas = require('canvas-superjoe');
var http = require('http');
var express = require('express');

var app = express();
var server = http.createServer(app);
var io = require("socket.io").listen(server);

var width = 320;
var height = 240;
var listeners = [];
var frame = {};

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

function getFrame(data, isFirst, cb) {
  var encoder = new GIFEncoder(width, height);
  var canvas = new Canvas(width, height);
  var ctx = canvas.getContext('2d');
  var img = new Canvas.Image();

  encoder.setQuality(100);

  img.onload = function() {
    if (isFirst) {
      encoder.start();
    }
    ctx.drawImage(img, 0, 0, width, height);
    encoder.firstFrame = isFirst;
    encoder.addFrame(ctx);

    cb(new Buffer(encoder.out.data));
  };

  img.src = data;
}

app.get('/wat.gif', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/gif'
  });

  getFrame(frame.data, true, function(b) {
    listeners.push(function() {
      var d = frame.current;
      // Omit the last byte to prevent gif from freezing
      res.write(Buffer.concat([b, d.slice(0, -1)]));
      b = d.slice(-1);
    });
  });
});

server.listen(8080);

var ready = true;
io.sockets.on('connection', function(socket) {
  socket.on('data', function(data) {
    frame.data = data;
    if (!ready) return;

    ready = false;
    setTimeout(function() {
      getFrame(data, false, function(current) {
        frame.current = current;
        listeners.forEach(function(cb) {
          cb();
        });
        ready = true;
      });
    }, 1);
  });
});
