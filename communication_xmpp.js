"use strict"

var xmpp = require('./xmpp_library.js').xmpp;
var wxmpp = require('./wxmpp');
var communication = require('./communication');
var config = require ('./settings.js').config;
var owner = config.networkConfig.owner;

function sendMessage(id, port, data)
{
	var t = wxmpp.getConnection ();
	var tag = new xmpp.Element('communication',{port:port, from:owner}).t(data);
	t.sendWyliodrin(id, tag, false);
}

function messageStanza(t, from, to, es, error)
{
	if(error == 0)
	{
		if(!es.attrs.err)
		{
			var port = es.attrs.port;
			var from = es.attrs.from;
			var data = es.getText();
			communication.sendMessage(from, port, data);
		}
	}
}

exports.sendMessage = sendMessage;
exports.messageStanza = messageStanza;