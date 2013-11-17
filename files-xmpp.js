var dict = require('dict');
var _ = require('underscore');

var xmpp = null;
var wxmpp = null;

var requests = null;
var owner = null;
var config = null;

function load(modules)
{
	xmpp = modules.xmpp;
	wxmpp = modules.wxmpp;

	requests = dict();
	
	config = modules.config;
}

function loadConfig(confs)
{
	owner = confs.owner;
}

function files_stanza(t, from, to, es, error)
{

	if(!error)
	{
		var action = es.attrs.action;
		if(action == 'attributes')
		{
			if(requests.has('attributes '+es.attrs.path))
			{
				err = parseInt(es.attrs.error);
				var stats = {};
				stats.mode = 0;
				stats.size = 0;
				console.log (err);
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
					console.log ('files-xmpp.js sending result for attributes');
					sendResult (err, stats);
				});
				requests.delete ('attributes '+es.attrs.path);
			}
		}
		else if(action == 'list')
		{
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
						console.log ('files-xmpp.js sending result for list');
						sendResult(err, names);
					});
				}
				requests.delete ('list '+es.attrs.path);
			}
		}
		else if(action == 'open')
		{
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
}

function getAttr(path, sendResult)
{
	console.log ('owner is available attr'+wxmpp.ownerIsAvailable());
	if(wxmpp.checkConnected())
	{
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
		sendResult(-2);
	}
}

function readDir(path, sendResult)
{
	console.log ('owner is available attr'+wxmpp.ownerIsAvailable());
	if(wxmpp.checkConnected())
	{
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
	console.log ('owner is available attr'+wxmpp.ownerIsAvailable());
	if(wxmpp.checkConnected())
	{
		if(wxmpp.ownerIsAvailable())
		{
			var t = wxmpp.getConnection();
			var tag = new xmpp.Element('files', {action:'open', path:path});
			t.sendWyliodrin(owner, tag, false);
			addToRequests('open '+path, sendResult);
		}
		else
			sendResult(-2);
	}
	else
	{
		sendResult(-2);
	}
}

function ownerUnavailable()
{
	requests.forEach(function(value,key){
		for(var i=0; i<value.length; i++)
			value[i](-2);
	});
	requests.clear();
	
}

function read(path,offset,len,sendResult)
{
	console.log ('owner is available attr'+wxmpp.ownerIsAvailable());
	if(wxmpp.checkConnected())
	{
		if(wxmpp.ownerIsAvailable())
		{
			var t = wxmpp.getConnection();
			var tag = new xmpp.Element('files', {action:'read', path:path, offset:offset, length:len});
			t.sendWyliodrin(owner, tag, false);
			addToRequests('read '+path, sendResult);
		}
		else
			sendResult(-2,null,null);
	}
	else
	{
		sendResult(-2);
	}
}

exports.read = read;
exports.ownerUnavailable = ownerUnavailable;
exports.load = load;
exports.loadConfig = loadConfig;
exports.filesStanza = files_stanza;
exports.readDir = readDir;
exports.getAttr = getAttr;
exports.open = open;
