"use strict";
var libxmpp = require('./xmpp_library.js').xmpp;
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
			connection = new libxmpp.Client({jid:networkConfig.jid,password:networkConfig.password,
				reconnect:false, preferred:'PLAIN', 
				websocket: {url: 'wss://wxmpp.wyliodrin.com/ws/server?username='+networkConfig.jid+'&password='+networkConfig.password+'&resource=wyliodrin'}});
		}
		else
		{
			connection = new libxmpp.Client({jid:networkConfig.jid,password:networkConfig.password,
				reconnect:false, preferred:'PLAIN'});
		}
		if (connection.connection && connection.connection.socket)
		{
			connection.connection.socket.setTimeout (0);
			connection.connection.socket.setKeepAlive (true, 100);
		}
		var xmpp = connection;
		xmpp.ping = true;
		connecting = false;
		xmpp.reconnect = true;
		loadSettings ();
		xmpp.on ('error', function(error)
		{
			console.log ('XMPP error');
			console.log (error);
			if (!connecting && xmpp.reconnect)
			{
				xmpp.reconnect = false;
				clearInterval (xmpp.interval);
				reconnect ();
				console.error (error);
				isConnected = false;
			}
		});

		xmpp.on ('disconnect', function()
		{
			console.log ('XMPP disconnect');
			if (!connecting)
			{
				clearInterval (xmpp.interval);
				reconnect ();
		  		console.error ('disconnect');
		  		isConnected = false;
			}
		});


		xmpp.on ('close', function()
		{
			console.log ('XMPP close');
			if (!connecting && xmpp.reconnect)
			{
				xmpp.reconnect = false;
				clearInterval (xmpp.interval);
				reconnect ();
		  		console.error ('disconnect');
		  		isConnected = false;
			}
		});

		xmpp.on ('online', function()
		{
			delay = 100;
			isConnected = true;
			connecting=false;
			xmpp.interval = setInterval (function ()
			{
				if (!xmpp.nr) xmpp.nr = 0;
			    if (xmpp.ping)
			    {
			        xmpp.nr = 0;
			        xmpp.ping = false;
			    }
			    else
			    {
			        xmpp.nr ++;
			    }
			    // console.log ('ping nr '+connection.nr);
			    if (networkConfig.firewall == false && xmpp.nr > 50)
			    {
				console.log ('ping timeout');
			    	try
			    	{
			        	xmpp.nr = 0;
					xmpp.end ();
			        }
			        catch (e)
			        {
			        	isConnected = false;
			        	clearInterval (xmpp.interval);
			        	reconnect ();
			        }
			    }
			}, 1000);
		  //console.log (networkConfig.jid+"> online");
		  xmpp.send(new libxmpp.Element('presence',
		           {}).
		      c('priority').t('50').up().
		      c('status').t('Happily echoing your <message/> stanzas')
		     );
		  // if(functie != null)
		  // {
		  // 	console.log('functie != null');
		  // }
		  xmpp.send(new libxmpp.Element('presence',
		  {
		  	type:'subscribe',
		  	to:networkConfig.owner
		  }));
		  log.flush ();
		});

		xmpp.on ('rawStanza', function (stanza)
		{
		  //console.log (networkConfig.jid+'>'+stanza.root().toString());
		});
		
		xmpp.on ('end', function ()
		{
			console.log ('XMPP end');
			if (!connecting)
			{
				clearInterval (xmpp.interval);
				isConnected = false;
				reconnect ();
			}
		});
		xmpp.load(xmpp, function (from, to, stanza, error)
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
						xmpp.send(new libxmpp.Element('presence',
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
					xmpp.emptyStanzaBuffer(); 
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

