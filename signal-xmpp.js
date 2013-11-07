var xmpp = null;
var wxmpp = null;
var owner = null;
var signal = null;


var signals = [];

function load(modules)
{
	xmpp = modules.xmpp;
	wxmpp = modules.wxmpp;
	owner = modules.config.owner;
	signal = modules.signal;
}

function sendSignal(signal, value, id, time)
{
	if(wxmpp.checkConnected())
	{
		var t = wxmpp.getConnection();
		var tag = new xmpp.Element('signal', {signal:signal, value:value, id:id, time:time});
		t.sendWyliodrin(wxmpp.getOwner(), tag);		
	}
	else
		signals.push({signal:signal, value:value, id:id, time:time});
}

function sendSignalBuffer()
{
	if(signals.length > 0)
	{
		console.log('send buffer');
		var t = wxmpp.getConnection();
		var tag = new xmpp.Element('signals');
		for(i=0; i<signals.length; i++)
		{
			tag.c('signal', signals[i]);
		}
		t.sendWyliodrin(wxmpp.getOwner(), tag);
	}
	
}

function signalStanza(t, from, to, es, error)
{
	if(!error)
	{
		if(es.attrs.signal)
		{
			var signal = es.attrs.signal;
			var value = es.attrs.value;
			var id = es.attrs.id;
			signal.setSignal(signal, value, id);
		}
	}
}

exports.sendSignalBuffer = sendSignalBuffer;
exports.sendSignal = sendSignal;
exports.load = load;