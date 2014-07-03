# Hack The Drone :: Twitter

In order to run this, you will have to:

- Register a new application on http://apps.twitter.com, generate credentials and fill the ./config.js file
- Be able to connect to the drone and to the internet at the same time: Tethering is the easier choice.

The drone will take off when a tweet will be received on the twitter stream with some conditions.

For example, if you fill the config track parameter (config.js) like

    track: '@chamerling,#hackthedrone'

And if someone mentions @chamerling with the #hackthedrone tag and with the takeoff word, then the drone will take off (and you will get a tweet reply). This tweet works: https://twitter.com/hackthedrone/status/484634025051820032.

This part also shows how to use websocket to send tweets to the browser as soon as they are received in the stream (OK, js code on the client side is completely awful!).