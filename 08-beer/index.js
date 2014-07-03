var autonomy = require('ardrone-autonomy')
  , drone = require('ar-drone')
  , arDroneConstants = require('ar-drone/lib/constants')
  , mission  = autonomy.createMission();

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

mission.takeoff()
  .zero()
  .altitude(1)
  .hover(10000)
  .forward(1)
  .hover(10000)
  .taskSync(function() {
    console.log('Beer delivered!');
  })
  .cw(180)
  .go({x:0, y:0})
  .ccw(180)
  .hover(1000)
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
