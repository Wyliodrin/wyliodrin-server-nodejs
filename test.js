var redis = require('redis');

var client = redis.createClient();
client.publish("communication:32", "a");
