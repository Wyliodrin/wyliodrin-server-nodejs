var xmpp = null;
var wxmpp = null;
var owner = null;

var signals = [];

function load(modules)
{
	xmpp = modules.xmpp;
	wxmpp = modules.wxmpp;
	owner = modules.config.owner;
}

function sendSignal(signal, value, id, time)
{
	if(wxmpp.checkConnected)
	{
		if(wxmpp.ownerIsAvailable)
		{
			var t = wxmpp.getConnection();
			var tag = new xmpp.Element('signal', {signal:signal, value:value, id:id, time:time});
			t.sendWyliodrin(owner, tag);
		}
		else
			signals.push({signal:signal, value:value, id:id, time:time});
	}
	else
		signals.push({signal:signal, value:value, id:id, time:time});
}

exports.sendSignal = sendSignal;