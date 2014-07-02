'use strict';

process.on('uncaughtException', function(err) {
  console.log(err);
});

var state = 'started';
var express = require('express');
var drone = require('ar-drone');
var client = drone.createClient();
var app = express();

var currentImg = null;

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
client.on('lowBattery', function() {
  console.log('Low battery, may not be able to take off');
});

app.get('/', function(req, res) {
  return res.json(200, {state: state});
});

app.get('/drone/takeoff', function(req, res) {
  client.takeoff();
  state = 'departed';
  return res.json(200, {state: state});
});

app.get('/drone/land', function(req, res) {
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

drone.createPngStream().on('data', function(frame) {
  console.log('Got a new image');
  currentImg = frame;
});

app.get('/drone/image', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/png'
  });
  return res.end(currentImg, 'binary');
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Drone server started on ', port);
  console.log('Check the image at /drone/image');
});
