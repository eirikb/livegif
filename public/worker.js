importScripts('trix.js');
importScripts('NeuQuant.js');
importScripts('LZWEncoder.js');
importScripts('GIFEncoder.js');

self.addEventListener('message', function(event) {
  var data = event.data;
  var encoder = new self.GIFEncoder(data.width, data.height);
  encoder.setQuality(30);

  if (data.first) {
    encoder.writeHeader();
  }

  encoder.firstFrame = data.first;
  encoder.addFrame(data.data);

  self.postMessage(getData(encoder));
}, false);

function getData(encoder) {
  var pages = encoder.out.pages;
  var bufferSize = pages[0].length;
  var length = bufferSize * pages.length;
  length -= (bufferSize - encoder.out.cursor);

  var array = new Uint8Array(length);

  for (var p = 0; p < pages.length; p++) {
    var page = pages[p];
    var offset = p * bufferSize;
    var end = offset + bufferSize;
    if (end > length) page = page.subarray(0, length % bufferSize);

    array.set(page, offset);
  }

  return array;
}
