"use strict";

var wxmpp = require('./wxmpp');
var xmpp = require('./xmpp_library.js').xmpp;
var logs = [];
var config = require('./settings').config;

function flush ()
{
	console.log('wxmpp = '+wxmpp);
	while (wxmpp && wxmpp.checkConnected && wxmpp.checkConnected() && logs.length > 0)
	{
		var log = logs[0];
		logs.splice (0,1);
		var connection = wxmpp.getConnection ();
		var tag = new xmpp.Element('log', {type:logs.type, timestamp:log.timestamp}).t (new Buffer (log.str).toString('base64'));
		connection.sendWyliodrin (config.owner, tag);
	}
}

function send (type, str, timestamp)
{
	logs.push ({type:type, str:str, timestamp:timestamp});
	flush ();
}

function putLog(log)
{
	send ('debug', log, new Date());
	console.log(log);
}

function putError(error)
{
	send ('error', error, new Date());
	console.error("error = "+error);
}

exports.putLog = putLog;
exports.putError = putError;
exports.flush = flush;