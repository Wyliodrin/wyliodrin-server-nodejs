var xmpp = null;
var dict = require('dict');
var fs = require('fs');
var terminal_xmpp = null;
var build_xmpp = null;
var files_xmpp = null;

var isConnected = false;

var connection = null;

var config = null;
var XMPP = null;

var available = false;

stanzas = []


function load(modules)
{
	xmpp = modules.xmpp;
	terminal_xmpp = modules.terminal_xmpp;
	build_xmpp = modules.build_xmpp;
	files_xmpp = modules.files_xmpp;
	config = modules.config;
	XMPP = modules.XMPP;
}

function connect()
{
	if(!isConnected)
	{
		
		connection = new xmpp.Client({jid:config.jid,password:config.password,preferredSaslMechanism:'PLAIN'});
		isConnected = true;
		emptyStanzaBuffer();
		
		connection.on ('error', function(error)
		{
		  console.error (error);
		});

		connection.on ('disconnect', function()
		{
		  console.error ('disconnect');
		  isConnected = false;
		});

		connection.on ('online', function()
		{
		  console.log (config.jid+"> online");
		  connection.send(new xmpp.Element('presence',
		           {}).
		      c('priority').t('50').up().
		      c('status').t('Happily echoing your <message/> stanzas')
		     );
		  connection.send(new xmpp.Element('presence',
		  {
		  	type:'subscribe',
		  	to:config.owner
		  }));
		});

		connection.on ('rawStanza', function (stanza)
		{
		  console.log (config.jid+'>'+stanza.root().toString());
		});
	//	wxmpp.on ('stanza', function (stanza)
	//	{
	//	  console.log (this.jid+'>'+stanza.root().toString());
	//	  if (stanza.is('message') && stanza.attrs.type !== 'error')
	//	  {
	//	  	shells = stanza.getChild ('shells', 'wyliodrin');
	//	 } 			  
	//	});
		connection.load(function (connection, from, to, stanza, error)
		{
			if (stanza.getName()=='presence')
			{
				console.log('presence');
				if (stanza.attrs.type == 'subscribe')
				{
					if (from == config.owner)
					{
						connection.send(new xmpp.Element('presence',
		  				{
		  					type:'subscribed',
		  					to:config.owner
		  				}));

					}
				}
				else if(!stanza.attrs.type || stanza.attrs.type == 'available')
				{
					console.log('available');
					available = true;
				}
				else if(stanza.attrs.type == 'unavailable')
				{
					console.log('unavailable');
					available = false;
					files_xmpp.ownerUnavailable();
				}
			}
		});		
		connection.tag('shells', XMPP.WYLIODRIN_NAMESPACE, terminal_xmpp.shellStanza);
		connection.tag('make', XMPP.WYLIODRIN_NAMESPACE, build_xmpp.buildStanza);
		connection.tag('files', XMPP.WYLIODRIN_NAMESPACE, files_xmpp.files_stanza);
		isConnected = true;
	}
}

function getOwner()
{
	if(ownerIsAvailable())
		return config.owner;
	else
		return null;
}

function ownerIsAvailable()
{
	return available;
}

function disconnect(jid)
{
	if(isConnected)
	{
		connection.end(jid);
		isConnected = false;
	}
} 

function getConnection()
{
	return connection;
}

function checkConnected()
{
	return isConnected;
}

function emptyStanzaBuffer()
{
	for (i = 0; i<stanzas.length; i++)
	{
		connection.sendWyliodrin(config.owner, stanzas[i]);
	}
}

exports.connect = connect;
exports.getConnection = getConnection;
exports.checkConnected = checkConnected;
exports.load = load;
exports.ownerIsAvailable = ownerIsAvailable;
exports.stanzas = stanzas;

