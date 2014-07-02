# Hack The Drone

Source code originally created for the [@chamerling](http://chamerling.github.io) talk at [RMLL 2014](https://2014.rmll.info/conference278).
Slides are available at http://chamerling.github.io/slides/content/rmll14/.

## Requirements

git, node, an ardrone, and money if you are unlucky with the drone.

## Howto

Each module described in the talk is available in a dedicated directory:

- 01-takeoff: Take off, rotate and land with the raw client
- 02-web: Use expressjs and expose the takeoff and land operation as services 
- 03-image: Get the PNG stream and serve it as image on /drone/image  
- 04-streaming: Get the video stream and display it in a web page
- 05-navdata: Push drone nav data to the browser using socket.io
- 06-graph: Draw the altitude using d3.js and epoch.js. Altitude is coming from the drone through the server to the browser using web socket
- 07-twitter: Use the twitter streaming API to detect special tweets and takeoff or land (thanks to @romainhuet for the inspiration)
- 08-beer: Better than Amazon, deliver a beer using the drone

Source use npm modules and bower packages, all is centralized in the root folder, so you just have to install all dependencies once

    npm install
    bower install

If not specified, you can launch the drone stuff by going in the folder and launch node

    node index.js


## License

(The MIT License)

Copyright (c) 2014 Christophe Hamerling <chamerling@linagora.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.