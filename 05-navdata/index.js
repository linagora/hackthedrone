'use strict';

process.on('uncaughtException', function(err) {
  console.log(err);
});

var state = 'started';
var express = require('express');
var drone = require('ar-drone');
var client = drone.createClient();
var dronestream = require('dronestream');
var path = require('path');
var io = require('socket.io');
var app = express();

process.on('SIGINT', function() {
  if (client) {
    client.stop();
    client.land();
  }
  process.exit();
});

client.config({ key: 'general:navdata_demo', value: 'FALSE', timeout: 1000 }, function(err) {
  if (err) console.log(err);
});
client.config('video:video_channel', 0);
client.on('lowBattery', function() {
  console.log('Low battery, may not be able to take off');
});

app.get('/drone/takeoff', function(req, res) {
  console.log('Takeoff called');
  client.takeoff();
  state = 'departed';
  return res.json(200, {state: state});
});

app.get('/drone/land', function(req, res) {
  console.log('Land called');
  client.land();
  state = 'landed';
  return res.json(200, {state: state});
});

app.get('/drone/resume', function(req, res) {
  client.resume();
  state = 'resumed';
  return res.json(200, {state: state});
});

app.get('/drone/battery', function(req, res) {
  return res.json(200, {level: client.battery()})
});

var port = process.env.PORT || 3000;
app.set('port', port);
app.use('/', express.static(path.normalize(__dirname)));
app.use('/assets', express.static(path.normalize(__dirname + '/../bower_components')));

var http = require('http');
var server = http.createServer(app);
dronestream.listen(server);

server.listen(port, function() {
  console.log('Drone server started on ', port);
  console.log('Check the stream at /');
});

var sio = io.listen(server);
sio.set('destroy upgrade', false);
sio.sockets.on('connection', function (socket) {
  console.log('New Socket.IO connection');

  client.on('navdata', function(data) {
    console.log('NAVDATA :: ', data);
    socket.emit('navdata', data);
  });

  socket.on('disconnect', function () {
    console.log('Socket.IO is now disconnected');
  });
});
