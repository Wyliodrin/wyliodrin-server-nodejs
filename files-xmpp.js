var dict = require('dict');
var _ = request('underscore');

var xmpp = null;
var wxmpp = null;

var requests = null;

function load(modules)
{
	xmpp = modules.xmpp;
	wxmpp = modules.wxmpp;

	requests = dict();
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
				attrs = 0;
				if(err == 0)
				{
					type = es.attrs.type;
					if(type == 'file')
						attrs = 0100400;
					else
						attrs = 040500;
				}
				_.each (requests.get ('attributes '+es.attrs.path), function (sendResult)
				{
					sendResult (err, attrs);
				});
				requests.delete ('attributes '+es.attrs.path);
			}
		}
	}
}

function getAttr(path, sendResult)
{
	if(xmpp.checkConnected)
	{
		var t = xmpp.getConnection;
		var tag = new wxmpp.Element('files',{action:"attributes", path:path});
		t.sendWyliodrin();
		if(!requests.has('attributes '+path))
		{			
			requests.set("attributes "+path, [sendResult]);
		}
		else
		{
			requests.get('attributes '+path).push(sendResult);
		}
		
	}
}

exports.load = load;