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
				stats.attrs = 0;
				stats.size = 0;
				console.log (err);
				if(err == 0)
				{
					type = es.attrs.type;
					if(type == 'file')
					{
						//TODO atributele trebuie primite, nu sunt implicite
						stats.size = es.attrs.size;
						stats.attrs = 0100400;
					}
					else
					{
						stats.size = 4096;
						stats.attrs = 040500;
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
			if(requests.has('list '+es.attrs.path))
			{
				err = parseInt(es.attrs.error);
				names=[];
				if(err == 0)
				{
					es.forEachChild(es,null,function(child){
						names.push(child.name);
					});
					_.each(requests.get('list '+es.attrs.path), function(sendResult){
						sendResult(err, names);
					});
				}
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
			}
		}
	}
}

function getAttr(path, sendResult)
{
	console.log('get attr');
	if(wxmpp.checkConnected)
	{
		var t = wxmpp.getConnection();
		var tag = new xmpp.Element('files',{action:"attributes", path:path});
		t.sendWyliodrin(config.owner, tag);
		addToRequests('attributes '+path, sendResult);	
	}
}

function readDir(path, sendResult)
{
	if(wxmpp.checkConnected)
	{
		var t = wxmpp.getConnection();
		var tag = new xmpp.Element('files', {action:'list', path:path});
		t.sendWyliodrin(config.owner, tag);
		addToRequests('list '+path, sendResult);
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
	if(wxmpp.checkConnected)
	{
		var t = wxmpp.getConnection();
		var tag = new xmpp.Element('files', {action:'open', path:path});
		t.sendWyliodrin(config.owner,tag);
		addToRequests('open '+path, sendResult);
	}
}

function statfs(cb) {
  cb(0, {
      bsize: 1000000,
      frsize: 1000000,
      blocks: 1000000,
      bfree: 1000000,
      bavail: 1000000,
      files: 1000000,
      ffree: 1000000,
      favail: 1000000,
      fsid: 1000000,
      flag: 1000000,
      namemax: 1000000
  });
}

exports.load = load;
exports.loadConfig = loadConfig;
exports.files_stanza = files_stanza;
exports.readDir = readDir;
exports.getAttr = getAttr;
exports.statfs = statfs;
exports.open = open;
