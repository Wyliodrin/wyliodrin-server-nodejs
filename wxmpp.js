"use strict";
var xmpp = require('./xmpp_library.js').xmpp;
var dict = require('dict');
var fs = require('fs');
var terminal_xmpp = require('./terminal_xmpp');
var build_xmpp = require('./build_xmpp');
var files_xmpp = require('./files_xmpp');

var isConnected = false;
var connecting = false;

var connection = null;

var config = require('./settings').config;
var XMPP = require('./xmpp_library');

var available = false;
var info = require('./info');
var delay = 100;

var log = require('./log');

var intervalID = null;

//var functie = null;

var networkConfig = require('./settings').config.networkConfig;

function initConnection() //(fns)
{
	//functie = fns;
	connect ();
}

function connect()
{
	if(!isConnected)
	{
		if(networkConfig.firewall){
			connection = new xmpp.Client({jid:networkConfig.jid,password:networkConfig.password,
				reconnect:false, preferred:'PLAIN', 
				websocket: {url: 'wss://wxmpp.wyliodrin.org/ws/server?username='+networkConfig.jid+'&password='+networkConfig.password+'&resource=wyliodrin'}});
		}
		else
		{
			connection = new xmpp.Client({jid:networkConfig.jid,password:networkConfig.password,
				reconnect:false, preferred:'PLAIN'});
		}
		if (connection.connection && connection.connection.socket)
		{
			connection.connection.socket.setTimeout (0);
			connection.connection.socket.setKeepAlive (true, 100);
		}
		connection.ping = true;
		connecting = false;
		loadSettings ();
		connection.on ('error', function(error)
		{
			console.log ('XMPP error');
			if (!connecting)
			{
				clearInterval (connection.interval);
				reconnect ();
				console.error (error);
				isConnected = false;
			}
		});

		connection.on ('disconnect', function()
		{
			console.log ('XMPP disconnect');
			if (!connecting)
			{
				clearInterval (connection.interval);
				reconnect ();
		  		console.error ('disconnect');
		  		isConnected = false;
			}
		});


		connection.on ('close', function()
		{
			console.log ('XMPP close');
			if (!connecting)
			{
				clearInterval (connection.interval);
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
			connection.interval = setInterval (function ()
			{
				if (!connection.nr) connection.nr = 0;
			    if (connection.ping)
			    {
			        connection.nr = 0;
			        connection.ping = false;
			    }
			    else
			    {
			        connection.nr ++;
			    }
			    // console.log ('ping nr '+connection.nr);
			    if (connection.nr > 50)
			    {
			    	try
			    	{
			        	connection.nr = 0;
			        	connection.disconnect ();
			        }
			        catch (e)
			        {
			        	isConnected = false;
			        	clearInterval (connection.interval);
			        	reconnect ();
			        }
			    }
			}, 1000);
		  //console.log (networkConfig.jid+"> online");
		  connection.send(new xmpp.Element('presence',
		           {}).
		      c('priority').t('50').up().
		      c('status').t('Happily echoing your <message/> stanzas')
		     );
		  // if(functie != null)
		  // {
		  // 	console.log('functie != null');
		  // }
		  connection.send(new xmpp.Element('presence',
		  {
		  	type:'subscribe',
		  	to:networkConfig.owner
		  }));
		  log.flush ();
		});

		connection.on ('rawStanza', function (stanza)
		{
		  //console.log (networkConfig.jid+'>'+stanza.root().toString());
		});
		
		connection.on ('end', function ()
		{
			console.log ('XMPP end');
			if (!connecting)
			{
				clearInterval (connection.interval);
				isConnected = false;
				reconnect ();
			}
		});
		connection.load(connection, function (from, to, stanza, error)
		{
			if (stanza.getName()=='presence')
			{
				//console.log('presence');
				if (stanza.attrs.type == 'subscribe')
				{
					//console.log (networkConfig.owner+' '+stanza.toString());
					if (from == networkConfig.owner)
					{
						//console.log ('sending subscribed to '+networkConfig.owner);
						connection.send(new xmpp.Element('presence',
		  				{
		  					type:'subscribed',
		  					to:networkConfig.owner
		  				}));

					}
				}
				else if(!stanza.attrs.type || stanza.attrs.type == 'available')
				{
					//console.log('available');
					available = true;
					connection.emptyStanzaBuffer(); 
					//console.log("wxmpp from start info = "+from);
					// info.sendStartInfo(from);
					//intervalID = setInterval(function(){	
					//info.sendInfo(from);}, 2000);
					
				}
				else if(stanza.attrs.type == 'unavailable')
				{
					//console.log('unavailable');
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

function loadSettings()
{
	connection.tag('shells', XMPP.WYLIODRIN_NAMESPACE, terminal_xmpp.shellStanza);
	connection.tag('make', XMPP.WYLIODRIN_NAMESPACE, build_xmpp.buildStanza);
	connection.tag('files', XMPP.WYLIODRIN_NAMESPACE, files_xmpp.filesStanza);
	connection.tag('info', XMPP.WYLIODRIN_NAMESPACE, info.info_stanza);
	connection.tag('ps', XMPP.WYLIODRIN_NAMESPACE, info.info_stanza);
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
exports.ownerIsAvailable = ownerIsAvailable;
exports.initConnection = initConnection;
//exports.loadSettings = loadSettings;

