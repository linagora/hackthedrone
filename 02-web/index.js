'use strict';

process.on('uncaughtException', function(err) {
  console.log(err);
});

var state = 'started';
var express = require('express');
var drone = require('ar-drone');
var client = drone.createClient();
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

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Drone server started on ', port);
});
