"use strict";
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

function sendSignal(s)
{
	if(wxmpp.checkConnected())
	{
		var t = wxmpp.getConnection();
		if(s.value)
		{
			var tag = new xmpp.Element('signal', s);
			if(wxmpp.ownerIsAvailable())
				t.sendWyliodrin(owner, tag, false);
			else
				t.sendWyliodrin(owner, tag, true);
		}
		else
		{
			var tag = new xmpp.Element('signal', {signal:s.signal, id:s.id, time:s.time});
			for(var i=0; i<s.component.length; i++)
			{
				tag.c('component',{name:component[i].signal, value:component[i].value});
			}
			if(wxmpp.ownerIsAvailable())
				t.sendWyliodrin(owner, tag, false);
			else
				t.sendWyliodrin(owner, tag, true);
		}
			
	}
	else
	{
		console.log('push signal');
		signals.push(s)
	}
		
}

function sendSignalBuffer()
{
	if(signals.length > 0)
	{
		console.log('send buffer');
		var t = wxmpp.getConnection();
		var tag = new xmpp.Element('signals');
		for(var i=0; i<signals.length; i++)
		{
			if(signals[i].value)
			{
				tag.c('signal', signals[i]);
			}
			else
			{
				tag.c('signal',{signal:signals[i].signal, id:signals[i].id, time:signals[i].time});
				for(var j=0; j<signals[i].component.length; i++)
					tag.c('component',{name:signals[i].component[j].signal, value:signals[i].component[j].value});
			}			
		}
		if(wxmpp.ownerIsAvailable())
				t.sendWyliodrin(owner, tag, false);
			else
				t.sendWyliodrin(owner, tag, true);
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
