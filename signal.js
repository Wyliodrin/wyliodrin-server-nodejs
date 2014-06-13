"use strict"

var net = require('net');
var util = require('util');
var carrier = require('carrier');
var signal_xmpp = require('./signal_xmpp');
var _ = require ('underscore');

var redis = require("redis");

var socketArray = [];
var config = require('./settings').config;
var port = config.port;
var log = require('./log');

var CHANNEL = "wyliodrin";

//message = signal:projectId
var SUBMESSAGE = "signal";
var MESSAGE_OFFSET = 7;

function connectRedis()
{
	var client = redis.createClient();
	client.subscribe(CHANNEL);

	client.on("subscribe", function(channel, count){
		console.log("connected redis "+channel);
	});

	client.on("error", function (err) {
        log.putError(err);
    });

    client.on("message", function(channel, message){
    	console.log("message\n");
	var pos = message.indexOf(SUBMESSAGE);
	if(pos > -1)
	{
		var proj = message.str(MESSAGE_OFFSET);
		var signals = client.lrange(proj, 0, -1);
		for (var i = 0; i < signals.length; i++)
		{
			console.log("signal = "+signal[i]+'\n');
		}
	} 
});
}


// function startSocketServer()
// {
// 		var server = net.createServer(function(c){
// 			console.log('id = '+id);
// 		var id = null;
// 		carrier.carry(c, function(line){
// 			var tokens = line.split(' ');
// 			if(!id)
// 			{
// 				if((tokens.length == 2) && (tokens[0] == "id") && (tokens[1] != 'undefined'))
// 				{
// 					id = tokens[1];
// 					socketArray[id] = c;
// 					console.log('received id\n');
// 				}
// 				else
// 				{
// 					console.log('server end connection');
// 					c.end();
// 				}
// 			}
// 			else
// 			{
// 				var signal = tokens[0];
// 				var value = tokens[1];
// 				if(parseFloat(value) != NaN)
// 				{
// 					var d = new Date();
// 					var time = d.getTime();
// 					var s = {signal:signal, value:value, id:id, time:time};
// 					signal_xmpp.sendSignal(s, id, time);
// 				}
// 				else
// 				{
// 					var d = new Date();
// 					var time = d.getTime();
// 					var s={signal:signal, component:[], id:id, time:time};
// 					var i=1;
// 					while(i<(tokens.length-1))
// 					{
// 						s.component.push({signal:tokens[i], value:tokens[i+1]});
// 						i=i+2;
// 					}
// 					signal_xmpp.sendSignal(s);
// 				}
// 			}
// 		});
// 	});
// 	server.listen(port, function(){console.log('server listening')});
// }
	
function setSignal(signal, value, id)
{
	if(id)
	{
		if(socketArray[id])
		{
			c.write(signal+' '+value);
		}
	}
}

function startSocketClient(id)
{
	console.log('startSocketClient '+id);
	var client = net.connect({port: 8124},
    function() { //'connect' listener
  	client.write('id '+id+'\n');
});
client.on('end',function(data){
	console.log('connection ended ');
	client.end();
});
client.on('data', function(data) {
  console.log('data '+data.toString());
});
client.on('error', function(error){
	console.log('error '+error)
});
}

//exports.setSignal = setSignal;
exports.connectRedis = connectRedis;
