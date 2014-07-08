var autonomy = require('ardrone-autonomy')
  , drone = require('ar-drone')
  , arDroneConstants = require('ar-drone/lib/constants')
  , mission  = autonomy.createMission()
  , config = require('./config');

function navdata_option_mask(c) {
  return 1 << c;
}

var navdata_options = (
  navdata_option_mask(arDroneConstants.options.DEMO)
  | navdata_option_mask(arDroneConstants.options.VISION_DETECT)
  | navdata_option_mask(arDroneConstants.options.MAGNETO)
  | navdata_option_mask(arDroneConstants.options.WIFI)
  );

var exiting = false;
process.on('SIGINT', function() {
  if (exiting) {
    process.exit(0);
  } else {
    console.log('Got SIGINT. Landing, press Control-C again to force exit.');
    exiting = true;
    mission.control().disable();
    mission.client().land(function() {
      process.exit(0);
    });
  }
});

mission.client().config('general:navdata_demo', true);
mission.client().config('general:navdata_options', navdata_options);
mission.client().config('video:video_channel', 1);
mission.client().config('detect:detect_type', 12);

var currentImg;
var tweeted = false;
var stream = drone.createPngStream();
stream.on('data', function(frame) {
  console.log('Saving image');
  currentImg = frame;
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

function tweet() {
  console.log('--> Trying to tweet, say cheeeeeeeeeeese!!!');
  if (!currentImg) {
    console.log('Can not tweet empty image');
    return;
  }

  if (tweeted) {
    console.log('Already tweeted');
    return;
  }

  var tweet = config.tweet || 'Say hi to from the drone!';
  tweetPicture(tweet, function (error, response, body) {
    tweeted = true;
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      var url = 'https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str;
      console.log('Tweet posted!', url);
      open(url);
    } else {
      console.log('Something is bad...');
      console.log('err :', error);
      console.log('response: ', response);
    }
  });
};

var client = mission.client();

mission.takeoff()
  .zero()
  .altitude(1)
  .hover(2000)
  .taskSync(function() {
    console.log('Going to tweet');
    tweet();
  })
  .altitude(2)
  .hover(2000)
  .taskSync(function() {
    console.log('Going to flip...');
    client.animate('flipAhead', 1500);
  })
  .hover(2000)
  .land();

mission.run(function (err, result) {
  if (err) {
    console.trace("Oops, something bad happened: %s", err.message);
    mission.client().stop();
    mission.client().land();
  } else {
    console.log("We are done!");
    process.exit(0);
  }
});
