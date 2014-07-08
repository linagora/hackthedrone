# Hack The Drone :: Tweet and Flip

In order to run this, you will have to:

- Register a new application on http://apps.twitter.com, generate credentials and fill the ./config.js file
- Be able to connect to the drone and to the internet at the same time: Tethering is the easier choice.

The app will tweet a photo from the drone camera and flip on success.

    node index.js