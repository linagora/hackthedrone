'use strict';

var drone = require('ar-drone');
var client = drone.createClient();

console.log('--> Take off!');
client.takeoff();

client.after(7000, function() {
    console.log('--> Clockwise');
    this.clockwise(0.5);
}).after(2000, function() {
    this.stop();
    console.log('--> Wave');
    this.animate('wave', 100);
}).after(2000, function() {
    console.log('--> Blink');
    this.stop();
    client.animateLeds('blinkRed', 5, 2)
}).after(2000, function() {
    console.log('--> Landing...');
    this.stop();
    this.land();
});