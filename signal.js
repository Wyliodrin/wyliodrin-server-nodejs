"use strict"

var net = require('net');
var util = require('util');
var carrier = require('carrier');
var signal_http = require('./signal_http');
var _ = require ('underscore');

var query = 0;

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

    client.on ('error', function (err)
    {
    	log.putError(err);
    });

    /*
{
   "projectid":"89452744-4f73-4c29-a58a-83ab3bda5fe2", -se pune din clientul nodejs 
   "gadgetid":"alexandru.radovici_galileo@wyliodrin.org", -se pune din clientul nodejs
   "userid":"",
   "session":""
   "timestamp":"12",
   "signals":[
    {"s1":"1"},
   {"s3":"3"}]
   }
}
*/

    channelClient.on("message", function(channel, message){
    	//console.log (message);
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
				var count = items.length;
				//console.log('count = '+count);
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
					signal.data.push(s);					
				}
				query=query+1;
				//console.log ('https '+query);
					signal_http.sendSignal(signal, function(e, rc){
						query = query - 1;
						//console.log ('response');
						if(!e && rc == 200)
						{
							
							//console.log('status code 200 ' + count);
							client.ltrim(proj, count,-1, function(err, result){
								//console.log(err);
								//console.log(result);
								
								d.delete(proj);
								//console.log ('items.count = '+items.count);								
								//console.log("another publish signal:"+proj);
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
