GIFEncoder.prototype.getData = function() {
  var pages = this.out.pages;
  var bufferSize = pages[0].length;
  var length = bufferSize * pages.length;
  length -= (bufferSize - this.out.cursor);

  var array = new Uint8Array(length);

  for (var p = 0; p < pages.length; p++) {
    var page = pages[p];
    var offset = p * bufferSize;
    var end = offset + bufferSize;
    if (end > length) page = page.subarray(0, length % bufferSize);

    array.set(page, offset);
  }

  return array;
};
