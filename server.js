var http = require('http');
var express = require('express');

var app = express();
var server = http.createServer(app);

var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({
  server: server
});

var listeners = [];
var frame = {};

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

app.get('/wat.gif', function(req, res) {
  if (!frame.first) {
    res.end('Stream not found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'image/gif'
  });

  console.log('Connect from', req.connection.remoteAddress, req.headers['x-forwarded-for']);

  var b = frame.first;
  listeners.push(function() {
    var d = frame.current;
    // Omit the last byte to prevent gif from freezing
    res.write(Buffer.concat([b, d.slice(0, -1)]));
    b = d.slice(-1);
  });
});

server.listen(8080);

var ready = true;
wss.on('connection', function(ws) {
  console.log('Cam connect from', ws._socket.remoteAddress);

  ws.on('message', function(message) {
    if (message.slice(0, 3).toString() === 'GIF') {
      frame.first = message;
    }

    frame.current = message;

    listeners.forEach(function(cb) {
      cb();
    });
  });
});
