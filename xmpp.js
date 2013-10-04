var xmpp = require('node-xmpp');
var fs = require('fs');
var config_file = require('/boot/wyliodrin.json');

function connect()
{
	console.log(JSON.parse(config_file));
	var jid
	var password
	if(!isConnected(jid))
	{
		
		var connection = new xmpp.Client({jid:jid,password:password,preferredSaslMechanism:'PLAIN'});
		
		wxmpp.on ('error', function(error)
		{
		  console.error (error);
		  disconnect (jid);
		});

		wxmpp.on ('online', function()
		{
		  console.log (jid+"> online");
		  wxmpp.send(new wxmpp.Element('presence',
		           {}).
		      c('priority').t('50').up().
		      c('status').t('Happily echoing your <message/> stanzas')
		     );
		});

		wxmpp.on ('rawStanza', function (stanza)
		{
		  console.log (this.jid+'>'+stanza.root().toString());
		});

		wxmpp.on ('stanza', function (stanza)
		{
		  console.log (this.jid+'>'+stanza.root().toString());
		  if (stanza.is('message') && stanza.attrs.type !== 'error')
		  {
		  	shells = stanza.getChild ('shells', 'wyliodrin');
		  	if (shells!=undefined)
		  	{
		  		// keys = x16_decode (shells.getText ());
		  		keys = new Buffer (shells.getText (), 'base64').toString ('utf8');
		  		ws.emit ('keys', keys);
		  	}
		  }
		});
	}
}

connect();