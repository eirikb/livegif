importScripts('trix.js');
importScripts('gif.js/NeuQuant.js');
importScripts('gif.js/LZWEncoder.js');
importScripts('gif.js/GIFEncoder.js');
importScripts('GIFEncoderGetData.js');

self.addEventListener('message', function(event) {
  var data = event.data;
  var encoder = new self.GIFEncoder(data.width, data.height);
  encoder.setQuality(30);

  if (data.first) {
    encoder.writeHeader();
  }

  encoder.firstFrame = data.first;
  encoder.addFrame(data.data);

  self.postMessage(encoder.getData());
}, false);
