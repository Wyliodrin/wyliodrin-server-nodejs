var xmpp = null;
var dict = require('dict');
var fs = require('fs');
var terminal_xmpp = null;
var build_xmpp = null;

var isConnected = false;

var connection = null;

function load(modules)
{
	xmpp = modules.xmpp;
	terminal_xmpp = modules.terminal_xmpp;
	build_xmpp = modules.build_xmpp;
}

function connect()
{
	if(!isConnected)
	{
		
		connection = new xmpp.Client({jid:jid,password:password,preferredSaslMechanism:'PLAIN'});
		isConnected = true;
		
		connection.on ('error', function(error)
		{
		  console.error (error);
		});

		connection.on ('disconnect', function()
		{
		  console.error ('disconnect');
		});

		connection.on ('online', function()
		{
		  console.log (jid+"> online");
		  connection.send(new xmpp.Element('presence',
		           {}).
		      c('priority').t('50').up().
		      c('status').t('Happily echoing your <message/> stanzas')
		     );
		  connection.send(new xmpp.Element('presence',
		  {
		  	type:'subscribe',
		  	to:owner
		  }));
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
		connection.load(function (connection, from, to, stanza, error)
		{
			if (stanza.getName()=='presence')
			{
				if (stanza.attrs.type == 'subscribe')
				{
					if (from == owner)
					{
						connection.send(new xmpp.Element('presence',
		  				{
		  					type:'subscribed',
		  					to:owner
		  				}));

					}
				}
			}
		});		
		connection.tag('shells', XMPP.WYLIODRIN_NAMESPACE, terminal_xmpp.shellStanza);
		connection.tag('make', XMPP.WYLIODRIN_NAMESPACE, build_xmpp.buildStanza);
		isConnected = true;
	}
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

exports.connect = connect;
exports.getConnection = getConnection;
exports.checkConnected = checkConnected;
exports.load = load;

