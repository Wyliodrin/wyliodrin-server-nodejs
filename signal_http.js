"use strict"

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
	//domain = domain+'/signals/send';	
}

function sendSignal(signal, functie)
{
	var s = JSON.stringify(signal);
	console.log("sent: "+s);
	var options =
	{
	  hostname: domain,
	  port: 443,
	  path: '/signals/send',
	  method: 'POST',
	  headers: {
          'Content-Type': 'application/json',
          'Content-Length': s.length
      }
	};

	var req = https.request(options, function(res) {
	  console.log("statusCode: ", res.statusCode);
	  console.log("headers: ", res.headers);
	  functie(res.statusCode);
	  //functie(200);
	});

	req.write(s);
	//req.write(signal);
	req.end();

	req.on('error', function(e) {
	  console.error(e);
	});
		//console.log("signal_http: "+JSON.stringify(signal));
	}

exports.sendSignal = sendSignal;
exports.load = load;