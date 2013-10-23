Based on ideas from https://github.com/sidorares/vnc-over-gif.  
Thanks to [eugeneware](https://github.com/eugeneware) for support and 
[jnordberg](https://github.com/jnordberg) for [gif.js](http://jnordberg.github.io/gif.js/).


####How it works
In browser:
  1. Read from web cam.
  2. Write frame to a canvas.
  3. Create one gif-frame with [gif.js](http://jnordberg.github.io/gif.js/)  
     (first frame is special).
  4. Gif frame data is sent binary to server using [ws](https://github.com/einaros/ws).

On server:
  1. Gif frame data is sent out as _wat.gif_-file with a simple `response.write`.

####Usage

    npm install; node server.js
    
Open your browser (with camera) to http://localhost:8080/cam.html and allow cam.  
Now the camera is streamed to http://localhost:8080/wat.gif

