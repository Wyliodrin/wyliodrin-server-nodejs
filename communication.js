"use strict"

var redis = require("redis");
var log = require("./log");
var communication_xmpp = require("./communication_xmpp");

var CHANNEL = "communication_server:*"
var CHANNEL_PUBLISH = "communication_client:";

var client;

function connectRedis()
{
	try
	{
		var channelClient = redis.createClient();
		channelClient.psubscribe(CHANNEL);

		client = redis.createClient();

		channelClient.on("error", function (err) {
        	log.putError(err);
   		 });

		channelClient.on("pmessage", function(pattern, channel, m){
			console.log("new message"+m);
			var message = JSON.parse(m);
			var port = channel.split(':')[1];
			var id = message["id"];
			var data = message["data"];
			communication_xmpp.sendMessage(id, port, data);
		});
	}
	catch (e)
	{
		log.putError("Redis not connected");
	}
}

function sendMessage(from, port, data)
{
	var message = {from:from, data:data};
	client.publish(CHANNEL_PUBLISH+port, JSON.stringify(message));
}

exports.connectRedis = connectRedis;
exports.sendMessage = sendMessage;
