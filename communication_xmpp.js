"use strict"

var xmpp = require('./xmpp_library.js').xmpp;
var wxmpp = require('./wxmpp');
var communication = require('./communication');

function sendMessage(id, port, data)
{
	var t = wxmpp.getConnection ();
	var tag = new xmpp.Element('communication',{port:port}).t(data);
	t.sendWyliodrin(id, tag, false);
}

function messageStanza(t, from, to, es, error)
{
	if(error == 0)
	{
		if(!es.attrs.err)
		{
			var port = es.attrs.port;
			var data = es.getText();
			communication.sendMessage(port, data);
		}
	}
}

exports.sendMessage = sendMessage;
exports.messageStanza = messageStanza;