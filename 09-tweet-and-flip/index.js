var request = require('request');
var config = require('./config');
var open = require('open');

var drone = require('ar-drone');
var client = drone.createClient();
var currentImg;
var tweeted = false;
var interval;

process.on('SIGINT', function() {
  if (client) {
    client.stop();
    client.land();
  }
  process.exit();
});

function tweetPicture(tweet, callback) {
  if (!currentImg) {
    return callback(new Error('Can not tweet empty image'));
  }
  var r = request.post({
    url: 'https://api.twitter.com/1.1/statuses/update_with_media.json',
    oauth: {
      consumer_key: config.consumer_key,
      consumer_secret: config.consumer_secret,
      token: config.access_token,
      token_secret: config.access_token_secret
    }
  }, callback);
  var form = r.form();
  form.append('status', tweet);
  form.append('media[]', currentImg);
  return form;
};

function bye() {
  clearInterval(interval);

  client.after(3000, function() {
    console.log('Going up');
    this.up(1);
  }).after(3000, function() {
    console.log('Blink');
    console.log('Be ready to flip in 3 seconds...');
    this.animateLeds('snakeGreenRed', 5, 5);
  }).after(3000, function() {
    console.log('flip!');
    this.animate('flipAhead');
  }).after(3000, function() {
    this.stop();
    this.land();
  });
}

var stream = drone.createPngStream();
stream.on('data', function(frame) {
  currentImg = frame;
});

stream.on('error', function(err) {
  console.log('Got an error on stream', err);
});

console.log('--> Take off!');
client.takeoff();

interval = setInterval(function() {
  console.log('--> Trying to tweet, say cheeeeeeeeeeese!!!');
  if (!currentImg) {
    console.log('Can not tweet empty image');
    return;
  }

  if (tweeted) {
    console.log('Already tweeted');
    return bye();
  }

  var tweet = config.tweet || 'Say hi to from the drone!';
  tweetPicture(tweet, function (error, response, body) {
    tweeted = true;
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      var url = 'https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str;
      console.log('Tweet posted!', url);
      open(url);
      return bye();
    } else {
      console.log('Something is bad...');
      console.log('err :', err);
      console.log('response: ', response);
    }
  });
}, 5000);
