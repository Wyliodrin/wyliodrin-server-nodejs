/*function handles error messages*/



"use strict";

var wxmpp = null;
var xmpp = null;
var logs = [];
var config = null;

function load (modulesDict)
{
	wxmpp = modulesDict.wxmpp;
	xmpp = modulesDict.xmpp;
	config = modulesDict.config;
}

function flush ()
{
	while (wxmpp && wxmpp.checkConnected() && logs.length > 0)
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
exports.load = load;