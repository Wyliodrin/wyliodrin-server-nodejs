"use strict"

var net = require('net');
var util = require('util');
var carrier = require('carrier');
//var signal_xmpp = require('./signal_xmpp');
var signal_http = require('./signal_http');
var _ = require ('underscore');

var redis = require("redis");

var socketArray = [];
var config = require('./settings').config.networkConfig;
//var port = config.port;
var log = require('./log');

var CHANNEL = "wyliodrin";

//message = signal:projectId
var SUBMESSAGE = "signal";
var MESSAGE_OFFSET = 7;

var dict = require('dict');
var d = dict();

function connectRedis()
{
	var channelClient = redis.createClient();
	channelClient.subscribe(CHANNEL);

	var client = redis.createClient();

	channelClient.on("subscribe", function(channel, count){
		console.log("connected redis "+channel);
	});

	channelClient.on("error", function (err) {
        log.putError(err);
    });

    /*
{
   "projectid":"89452744-4f73-4c29-a58a-83ab3bda5fe2", -se pune din clientul nodejs 
   "gadgetid":"alexandru.radovici_galileo@wyliodrin.org", -se pune din clientul nodejs
   "userid":""
   "timestamp":"12",
   "signals":{
    "s1":"1",
   "s3":"3"
   }
}
*/

    channelClient.on("message", function(channel, message){
    	console.log('\n\n');
    	console.log("new redis message "+message);
	var pos = message.indexOf(SUBMESSAGE);
	if(pos > -1)
	{
		var proj = message.substring(7);
		if(!d.has(proj))
		{
			d.set(proj, 1);
			var userid;
			var session;
			client.lrange(proj,0,-1,function(error, items){
			if(items.length != 0)
			{
				var j = JSON.parse(items[0]);
				var signal = {'projectid':'',
							'gadgetid':'',
							'userid':'',
							'session':'',
							'data':[]};
				signal['projectid'] = proj;
				signal['gadgetid'] = config.jid;
				signal['userid'] = j.userid;
				signal['session']=j.session;			
				for (var i = 0; i < items.length; i++)
				{
					var s = JSON.parse(items[i]);
					delete s.userid;
					delete s.session;
					console.log("push: "+JSON.stringify(s));
					signal.data.push(JSON.stringify(s));					
				}
				console.log("send = "+JSON.stringify(signal));
				signal_http.sendSignal(signal, function(rc){
					if(rc == 200)
					{
						client.ltrim(proj, items.length,-1);
						client.lrange(proj,0,-1,function(error, items){
							d.delete(proj);
							if(items.count > 0)
								client.publish("wyliodrin","signal:"+proj);
						});
					}
					else
					{
						d.delete(proj);
					}
				});
			}
			else
			{
				d.delete(proj);
			}
			});
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
