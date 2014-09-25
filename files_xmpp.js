var dict = require('dict');
var _ = require('underscore');

var xmpp = require('./xmpp_library.js').xmpp;
var wxmpp = require('./wxmpp');
var requests = dict();

var config = require ('./settings.js').config;
var mountFile = config.mountFile;
var owner = config.networkConfig.owner;


function files_stanza(t, from, to, es, error)
{
	if(!error)
	{
		log.putLog ('Files stanza from '+from);
		var action = es.attrs.action;
		if(action == 'attributes')
		{
			log.putLog ('Attributes for '+es.attrs.path);
			if(requests.has('attributes '+es.attrs.path))
			{
				err = parseInt(es.attrs.error);
				var stats = {};
				stats.mode = 0;
				stats.size = 0;
				if(err == 0)
				{
					type = es.attrs.type;
					if(type == 'file')
					{
						//TODO atributele trebuie primite, nu sunt implicite
						try{
						stats.size = parseInt(es.attrs.size);}
						catch(e){}
						stats.mode = 0100600;
					}
					else
					{
						stats.size = 4096;
						stats.mode = 040700;
					}
				}
				_.each (requests.get ('attributes '+es.attrs.path), function (sendResult)
				{
					sendResult (err, stats);
				});
				requests.delete ('attributes '+es.attrs.path);
			}
		}
		else if(action == 'list')
		{
			log.putLog ('Directory list for '+es.attrs.path);
			if(requests.has('list '+es.attrs.path))
			{
				try{
				err = parseInt(es.attrs.error);}
				catch(e){}
				names=[];
				if(err == 0)
				{
					_.each (es.children, function(child){
						if (child.getName()=='file' || child.getName()=='directory')
						names.push(child.attrs.filename);
					});
					_.each(requests.get('list '+es.attrs.path), function(sendResult){
						sendResult(err, names);
					});
				}
				requests.delete ('list '+es.attrs.path);
			}
		}
		else if(action == 'open')
		{
			log.putLog ('Open for '+es.attrs.path);
			if(requests.has('open '+es.attrs.path))
			{
				err = parseInt(es.attrs.error);
				_.each(requests.get('open '+es.attrs.path), function(sendResult){
						sendResult(err);
					});
				requests.delete('list '+es.attrs.path);
			}
		}
		else if(action == 'read')
		{
			log.putLog ('Read for '+es.attrs.path);
			if(requests.has('read '+es.attrs.path))
			{
				err = parseInt(es.attrs.error);
				data = new Buffer(es.getText(),'base64').toString();
				try{
				length = parseInt(es.attrs.length);}
				catch(e){}
				_.each(requests.get('read '+es.attrs.path), function(sendResult){
					sendResult(err, data, length);
				});
				requests.delete('read '+es.attrs.path);
			}
		}
	}
	else
	{
		log.putError ('Files stanza error from '+from);
	}
}

function getAttr(path, sendResult)
{
	if(wxmpp.checkConnected() && wxmpp.ownerIsAvailable())
	{
		log.putLog ('Attributes request for '+path);
		if(wxmpp.ownerIsAvailable())
		{
			var t = wxmpp.getConnection();
			var tag = new xmpp.Element('files',{action:"attributes", path:path});
			t.sendWyliodrin(owner, tag, false);
			addToRequests('attributes '+path, sendResult);	
		}
		else
			sendResult(-2, null);
	}
	else
	{
		log.putError ('Attributes request for '+path+' user offline');
		sendResult(-2);
	}
}

function readDir(path, sendResult)
{
	if(wxmpp.checkConnected() && wxmpp.ownerIsAvailable())
	{
		log.putLog ('Read directory request for '+path);
		if(wxmpp.ownerIsAvailable())
		{
			var t = wxmpp.getConnection();
			var tag = new xmpp.Element('files', {action:'list', path:path});
			t.sendWyliodrin(owner, tag, false);
			addToRequests('list '+path, sendResult);
		}
		else
			sendResult(-2,null);
	}
	else
	{
		log.putError ('Attributes request for '+path+' user offline');
		sendResult(-2);
	}
}

function addToRequests(key, value)
{
	if(!requests.has(key))
		requests.set(key, [value]);
	else
		requests.get(key).push(value);
}

function open(path, sendResult)
{
	if(wxmpp.checkConnected() && wxmpp.ownerIsAvailable())
	{
		log.putLog ('Open request for '+path);
		var t = wxmpp.getConnection();
		var tag = new xmpp.Element('files', {action:'open', path:path});
		t.sendWyliodrin(owner, tag, false);
		addToRequests('open '+path, sendResult);
	}
	else
	{
		log.putError ('Read directory request for '+path+' user offline');
		sendResult(-2);
	}
}

function ownerUnavailable()
{
	log.putLog ('Requests fail, user offline');
	requests.forEach(function(value,key){
		for(var i=0; i<value.length; i++)
			value[i](-2);
	});
	requests.clear();
	
}

function read(path,offset,len,sendResult)
{
	if(wxmpp.checkConnected() && wxmpp.ownerIsAvailable())
	{
		log.putLog ('Read request for '+path);
		var t = wxmpp.getConnection();
		var tag = new xmpp.Element('files', {action:'read', path:path, offset:offset, length:len});
		t.sendWyliodrin(owner, tag, false);
		addToRequests('read '+path, sendResult);
	}
	else
	{
		log.putError ('Read request for '+path+' user offline');
		sendResult(-2);
	}
}

exports.read = read;
exports.ownerUnavailable = ownerUnavailable;
exports.filesStanza = files_stanza;
exports.readDir = readDir;
exports.getAttr = getAttr;
exports.open = open;
