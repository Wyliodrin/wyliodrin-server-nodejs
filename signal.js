"use strict"

var net = require('net');
var util = require('util');
var carrier = require('carrier');
var signal_http = require('./signal_http');
var _ = require ('underscore');

var redis = require("redis");

var socketArray = [];
var config = require('./settings').config.networkConfig;
var log = require('./log');

var CHANNEL = "wyliodrin";

//message = signal:projectId
var SUBMESSAGE = "signal";
var MESSAGE_OFFSET = 7;

var dict = require('dict');
var d = dict();

function connectRedis()
{
	try{
		var channelClient = redis.createClient();
		channelClient.subscribe(CHANNEL);


	var client = redis.createClient();

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
					signal.data.push(JSON.stringify(s));					
				}
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
catch(e)
{
	log.putError("Redis not connected");
}
}

exports.connectRedis = connectRedis;
