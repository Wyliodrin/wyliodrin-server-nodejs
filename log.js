"use strict";

// var wxmpp = require('./wxmpp');
// var xmpp = require('./xmpp_library.js').xmpp;
var logs = [];
// var config = require('./settings').config.networkConfig;

function flush ()
{
	// while (wxmpp && wxmpp.checkConnected && wxmpp.checkConnected() && logs.length > 0)
	// {
	// 	var log = logs[0];
	// 	logs.splice (0,1);
	// 	var connection = wxmpp.getConnection ();
	// 	var tag = new xmpp.Element('log', {type:logs.type, timestamp:log.timestamp}).t (new Buffer (log.str).toString('base64'));
	// 	connection.sendWyliodrin (config.owner, tag);
	// }
}

var https = require('https');
var settings = require('./settings').config;
var networkConfig = settings.networkConfig;

var domain;

function load()
{
	var arr = networkConfig.jid.split("@");
	for(var i=0; i<arr.length; i++)
	{
		domain = arr[i];
	}
	setInterval (function ()
	{
		sendLogs ();
	}, 3000);
	console.log ('loaded');
}

function sendLogs()
{
	console.log ('sending logs');
	if (!domain) load ();
	var s = {str:logs.join ('\n')};
	var options =
	{
	  hostname: domain,
	  port: 443,
	  path: '/gadgets/logs/'+networkConfig.jid,
	  method: 'POST',
	  headers: {
          'Content-Type': 'application/json',
          'Content-Length': s.length,
          'Connection': 'close'
      }
	};

	var req = https.request(options, function(res) {
		//console.log("codul de eroare :"+res.statusCode);
	  // functie(false, res.statusCode);
	  if (res.statusCode == 200)
	  {
	  	logs = [];
	  }
	});

	req.on('socket', function (socket) {
	    socket.setTimeout(2000);  
	    	socket.on('timeout', function() {
        		//console.log ('socket timeout');
        		req.abort();
    		});
	});

	req.write(s);
	req.end();

	req.on('error', function(e) {
	  console.error(e);
	  // functie (e);
	});
}

function send (type, str, timestamp)
{
	// logs.push ({type:type, str:str, timestamp:timestamp});
	// flush ();
	if (logs.length > 100000) logs.splice (0, 1000);
	logs.push (type+' '+timestamp+' '+str);
}

function putLog(log)
{
	send ('debug', log, new Date());
}

function putError(error)
{
	send ('error', error, new Date());
	console.error("error = "+error);
}

load ();

exports.putLog = putLog;
exports.putError = putError;
exports.flush = flush;
