window.onload = function() {
  var socket = io.connect();
  var video = document.querySelector('video');
  var canvas = document.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var localMediaStream = null;

  function snapshot() {
    if (localMediaStream) {
      ctx.drawImage(video, 0, 0, 100, 100);
      socket.emit('data', canvas.toDataURL('image/jpg'));
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
    console.log(err)
  });

  setInterval(function() {
    snapshot();
  }, 200);
};
