var xmpp = require('./xmpp.js');
var terminal = require('terminal.js');


function shell_stanza(t, from, to, es, error)
{
	if(error == 0)
	{
		var action = es.getChild('action');
		if(action == 'open')
		{
			var term = allocTerminal();
			var rc = startTerminal(term.id, "/bin/bash", function send_data(data,id)
				{
					var tag = new xmpp.Element('shells',{xmlns:'wyliodrin',id:id,action:"keys",}).c(data);
					xmpp.send(tag, to, t);
				});
			if(rc == terminal.TERMINAL_OK)
			{
				var id = es.getChild('request');
				var tag = new xmpp.Element('shells', {xmlns:'wyliodrin',action:'done', request:id});
				xmpp.send(tag, to, t);
			}
			else
			{
				var id = es.getChild('request');
				var tag = new xmpp.Element('shells', {xmlns:'wyliodrin',action:'error', request:id});
				xmpp.send(tag, to, t);
			}
		}
		if(action == 'close')
		{
			var id = parseInt(es.getChild('id'));
			var rc = destroyTerminal(id);
		}
		if(action == 'keys')
		{
			var id = parseInt(es.getChild('id'));
			var rc = sendKeysToTerminal(id, es.getText());
		}
	}
	
}
