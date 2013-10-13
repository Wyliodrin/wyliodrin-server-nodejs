var wxmpp = require('./xmpp_library').xmpp;
var dict = require('dict');
var fs = require('fs');
var config_file = require('/boot/wyliodrin.json');

var isConnected = false;
function connect()
{
	console.log(JSON.parse(config_file));
	var jid
	var password
	if(!isConnected)
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

	//	wxmpp.on ('stanza', function (stanza)
	//	{
	//	  console.log (this.jid+'>'+stanza.root().toString());
	//	  if (stanza.is('message') && stanza.attrs.type !== 'error')
	//	  {
	//	  	shells = stanza.getChild ('shells', 'wyliodrin');
	//	 } 			  
	//	});
		wxmpp.load();		
		isConnected = true;
	}
}

function disconnect(jid)
{
	if(isConnected)
	{
		wxmpp.end(jid);
		isConnected = false;
	}
} 

function send(stanza, to, id)
{
	wxmpp.send(new wxmpp.Element('message',{to:to, id:id}).c(stanza);
}

//connect();
