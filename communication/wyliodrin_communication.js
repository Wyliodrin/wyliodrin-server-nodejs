"use strict"

var _=require('underscore');
var redis = require("redis");

var IP = '127.0.0.1'
var CHANNEL = "communication:";

var port; 
var client;
var channelClient = {};
function initCommunication(redis_port)
{
	port = redis_port;
	try
	{
		client = redis.createClient(port, IP, {});
		return 0;
	}
	catch (e)
	{
		console.log("Redis cannot connect "+e);
		return -1;
	}
}

function openConnection(communication_port, myFunction)
{
	try
	{
		var chClient = redis.createClient(port, IP, {});
		channelClient[communication_port] = chClient;
		
		chClient.subscribe(CHANNEL+communication_port);

		chClient.on("message", function(channel, message){
			var mes = JSON.parse(message);
			myFunction(mes['from'], 0, mes['data']);
		});
	}
	catch (e)
	{
		console.log("Redis cannot connect "+e);
	}
}

function sendMessage(id, communication_port, data)
{
	var message = {id:id, data:data};
	client.publish(CHANNEL+communication_port, JSON.stringify(message));
}

function closeConnection(port)
{
	var c = channelClient[port];
	if (c)
	{
		c. quit();
	}		
}

function closeCommunication ()
{
	client.quit();
	_.each(channelClient, function(value, key,list){
		value.quit();
	})
}

exports.initCommunication = initCommunication;
exports.openConnection = openConnection;
exports.sendMessage = sendMessage;
exports.closeConnection = closeConnection;
exports.closeCommunication = closeCommunication;
