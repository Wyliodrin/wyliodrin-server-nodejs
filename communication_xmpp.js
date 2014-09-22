"use strict"

var xmpp = require('./xmpp_library.js').xmpp;
var wxmpp = require('./wxmpp');
var communication = require('./communication');
function sendMessage(id, port, data)
{
	var t = wxmpp.getConnection ();
	var data64 = new Buffer(data).toString('base64');
	var tag = new xmpp.Element('communication',{port:port}).t(data64);
	t.sendWyliodrin(id, tag, false);
}

function messageStanza(t, from, to, es, error)
{
	if(error == 0)
	{
		if(!es.attrs.err)
		{
			var port = es.attrs.port;
			var data = new Buffer(es.getText(),'base64').toString();
			communication.sendMessage(from, port, data);
		}
	}
}

exports.sendMessage = sendMessage;
exports.messageStanza = messageStanza;