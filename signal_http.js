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
}

function sendSignal(signal, functie)
{
	var s = JSON.stringify(signal);
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
	  functie(res.statusCode);
	});

	req.write(s);
	req.end();

	req.on('error', function(e) {
	  console.error(e);
	});
}

exports.sendSignal = sendSignal;
exports.load = load;