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
var config = require('./config');
var flying = false;

process.on('SIGINT', function() {
  if (client) {
    client.stop();
    client.land();
  }
  process.exit();
});

var Twitter = require('twit');
var twitter = new Twitter(config);
var stream = twitter.stream('statuses/filter', { track: config.track });

var reply = function(tweet, status) {
  console.log('About to tweet: @' + tweet.user.screen_name + ' ' + status);
  twitter.post('/statuses/update', {
    status: '@' + tweet.user.screen_name + ' ' + status,
    in_reply_to_status_id: tweet.id_str
  }, function(err, data) {
    if (!err && data) {
      var url = 'https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str;
      console.log('The drone replied to the Tweet!', url);
    } else {
      console.log('Not able to reply to the tweet');
    }
  });
};

var validTakeOffTweet = function(tweet) {
  return (tweet && tweet.text && tweet.text.indexOf('takeoff') !== -1 || tweet.text.indexOf('take off') !== -1 || tweet.text.indexOf('fly') !== -1);
};

stream.on('tweet', function(tweet) {
  console.log('Got a Tweet', tweet.text.toLowerCase());

  if (validTakeOffTweet(tweet)) {
    if (flying) {
      console.log('Already flying');
      reply(tweet, 'Thanks for your tweet, but I am already flying!!!');
    } else {
      flying = true;
      client.takeoff();
      reply(tweet, 'Thanks for your tweet, taking off!!!');
    }
  } else {
    console.log('Wrong tweet');
    reply(tweet, 'I am already flying!');
  }
});

client.config('general:navdata_demo', 'TRUE');
client.config('video:video_channel', 0);

client.on('lowBattery', function() {
  console.log('Low battery, may not be able to take off');
});

app.get('/drone/resume', function(req, res) {
  client.resume();
  state = 'resumed';
  return res.json(200, {state: state});
});

app.get('/drone/battery', function(req, res) {
  return res.json(200, {level: client.battery()})
});

app.get('/drone/status', function(req, res) {
  return res.json(200, {flying: flying});
});

app.get('/drone/land', function(req, res) {
  console.log('Land called');
  client.land();
  flying = false;
  return res.json(200, {state: state});
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
  console.log('Check the twitter stream at /');
});

var sio = io.listen(server);
sio.set('destroy upgrade', false);
sio.sockets.on('connection', function (socket) {
  console.log('New Socket.IO connection');

  stream.on('tweet', function(tweet) {
    socket.emit('tweet', tweet);
  });

  socket.on('disconnect', function () {
    console.log('Socket.IO is now disconnected');
  });
});
