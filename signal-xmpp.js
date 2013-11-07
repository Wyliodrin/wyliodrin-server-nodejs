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

function sendSignals()
{
	var t = wxmpp.getConnection();
	var t = new xmpp.Element('signals');
	for(i=0; i<signals.length; i++)
	{
		var t = new xmpp.Element('signals')
	}
}

exports.sendSignals = sendSignals;
exports.sendSignal = sendSignal;
exports.load = load;