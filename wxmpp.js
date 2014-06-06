"use strict";
var xmpp = null;
var dict = require('dict');
var fs = require('fs');
var terminal_xmpp = null;
var build_xmpp = null;
var files_xmpp = null;

var isConnected = false;
var connecting = false;

var connection = null;

var config = null;
var XMPP = null;

var available = false;
var signal_xmpp = null;
var info = null;
var delay = 100;

var log = null;

var intervalID = null;

var functie = null;

function initConnection (modules, fns)
{
	xmpp = modules.xmpp;
	config = modules.config;
	log = modules.log;
	functie = fns;
	connect ();
}

function connect()
{
	if(!isConnected)
	{
		connection = new xmpp.Client({jid:config.jid,password:config.password,reconnect:false, preferred:'PLAIN', websock: {url: 'wss://wxmpp.wyliodrin.org/ws/server?username='+config.jid+'&password='+config.password+'&resource=wyliodrin'}});
		if (connection.connection && connection.connection.socket)
		{
			connection.connection.socket.setTimeout (0);
			connection.connection.socket.setKeepAlive (true, 100);
		}
		connecting = false;
		loadSettings ();
		connection.on ('error', function(error)
		{
			console.log ('error');
			if (!connecting)
			{
				reconnect ();
				console.error (error);
				isConnected = false;
			}
		});

		connection.on ('disconnect', function()
		{
			console.log ('disconnect');
			if (!connecting)
			{
				reconnect ();
		  		console.error ('disconnect');
		  		isConnected = false;
			}
		});


		connection.on ('close', function()
		{
			console.log ('close');
			if (!connecting)
			{
				reconnect ();
		  		console.error ('disconnect');
		  		isConnected = false;
			}
		});

		connection.on ('online', function()
		{
			delay = 100;
			isConnected = true;
			connecting=false;
		  console.log (config.jid+"> online");
		  connection.send(new xmpp.Element('presence',
		           {}).
		      c('priority').t('50').up().
		      c('status').t('Happily echoing your <message/> stanzas')
		     );
		  if(functie != null)
		  {
		  	console.log('functie != null');
		  }
		  connection.send(new xmpp.Element('presence',
		  {
		  	type:'subscribe',
		  	to:config.owner
		  }));
		  log.flush ();
		});

		connection.on ('rawStanza', function (stanza)
		{
		  console.log (config.jid+'>'+stanza.root().toString());
		});
		
		connection.on ('end', function ()
		{
			console.log ('end');
			if (!connecting)
			{
				isConnected = false;
				reconnect ();
			}
		});
		connection.load(connection, function (from, to, stanza, error)
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
					connection.emptyStanzaBuffer(); 
					info.sendStartInfo(from);
					//intervalID = setInterval(function(){	
					//info.sendInfo(from);}, 2000);
					
				}
				else if(stanza.attrs.type == 'unavailable')
				{
					console.log('unavailable');
					available = false;
					ownerUnavailable();
					// if(intervalID)
					// {
					//		clearInterval(intervalID);
					//		intervalID = null;
					// }
				}
			}
		});		
	}
}

function load(modules)
{
	xmpp = modules.xmpp;
	terminal_xmpp = modules.terminal_xmpp;
	build_xmpp = modules.build_xmpp;
	files_xmpp = modules.files_xmpp;
	config = modules.config;
	XMPP = modules.XMPP;
	signal_xmpp = modules.signal_xmpp;
	info = modules.info;
}

function loadSettings()
{
	connection.tag('shells', XMPP.WYLIODRIN_NAMESPACE, terminal_xmpp.shellStanza);
	connection.tag('make', XMPP.WYLIODRIN_NAMESPACE, build_xmpp.buildStanza);
	connection.tag('files', XMPP.WYLIODRIN_NAMESPACE, files_xmpp.filesStanza);
	connection.tag('signal', XMPP.WYLIODRIN_NAMESPACE, signal_xmpp.signalStanza);
	if(signal_xmpp != null)
		signal_xmpp.sendSignalBuffer();
}

function ownerUnavailable()
{
	if(files_xmpp != null)
	{
		files_xmpp.ownerUnavailable();
	}
}

function reconnect ()
{
	connecting = true;
	console.log ('reconnecting '+delay);
	setTimeout (function ()
	{
		delay = delay * 2;
		if (delay > 30*1000) delay = 100;
		connect ();
	}, delay);
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

exports.getConnection = getConnection;
exports.checkConnected = checkConnected;
exports.load = load;
exports.ownerIsAvailable = ownerIsAvailable;
exports.initConnection = initConnection;
exports.loadSettings = loadSettings;

