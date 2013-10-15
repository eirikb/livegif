Based on ideas from https://github.com/sidorares/vnc-over-gif .  
Thanks to [eugeneware](https://github.com/eugeneware) for https://github.com/eugeneware/gifencoder .

Current version has problems with framedelay and streaming.  
If streaming becomes slower than gif delay then the gif will loop, without loop the gif will freeze.
Eventually the gif will become out of sync.

####Usage

    npm install; node server.js
    
Open your browser (with camera) to http://localhost:8080/cam.html and allow cam.  
Now the camera is streamed to http://localhost:8080/wat.gif

