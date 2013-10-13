var wxmpp = require('./xmpp_library').xmpp;
var dict = require('dict');
var fs = require('fs');

var isConnected = false;

var isConnected = false;
function connect()
{
	var file_data = fs.readFileSync('/boot/wyliodrin.json');
	var d = JSON.parse(file_data);
	var jid = d.jid;
	var password = d.password;

	if(!isConnected)
	{
		
		var connection = new wxmpp.Client({jid:jid,password:password,preferredSaslMechanism:'PLAIN'});
		isConnected = true;
		
		connection.on ('error', function(error)
		{
		  console.error (error);
		});

		connection.on ('online', function()
		{
		  console.log (jid+"> online");
		  connection.send(new wxmpp.Element('presence',
		           {}).
		      c('priority').t('50').up().
		      c('status').t('Happily echoing your <message/> stanzas')
		     );
		});

		connection.on ('rawStanza', function (stanza)
		{
		  console.log (jid+'>'+stanza.root().toString());
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

function send(stanza, to, t)
{
	t.send(new wxmpp.Element('message',{to:to}).c(stanza);
}
