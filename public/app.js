window.onload = function() {
  var video = document.querySelector('video');
  var canvas = document.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var localMediaStream = null;
  var width = 320;
  var height = 240;
  var worker = new Worker("worker.js");
  var first = {
    sent: false
  };

  function snapshot() {
    if (localMediaStream) {
      ctx.drawImage(video, 0, 0, width, height);

      worker.postMessage({
        first: !first.frame,
        width: width,
        height: height,
        data: ctx.getImageData(0, 0, width, height).data
      });
    }
  }

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;

  navigator.getUserMedia({
    video: true
  }, function(stream) {
    video.src = window.URL.createObjectURL(stream);
    localMediaStream = stream;
  }, function(err) {
    console.log(err);
  });

  setInterval(snapshot, 300);

  var ws;
  var connected = false;
  (function connect() {
    ws = new WebSocket('ws://' + window.document.location.host);
    ws.binaryType = "arraybuffer";
    ws.onopen = function() {
      connected = true;

      ws.onclose = function() {
        first.sent = false;
        connected = false;
        setTimeout(connect, 5000);
      };
    };
  })();

  worker.addEventListener('message', function(event) {
    if (!first.frame) first.frame = event.data;
    if (!connected) return;

    if (!first.sent) {
      ws.send(first.frame);
      first.sent = true;
    }

    ws.send(event.data);
  }, false);
};
