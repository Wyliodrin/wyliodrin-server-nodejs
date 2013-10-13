var xmpp = require('./xmpp.js');
var terminal = require('terminal.js');


function shell_stanza(t, from, to, es, error)
{
	if(error == 0)
	{
		var action = es.getChild('action');
		if(action == 'open')
		{
			var t = allocTerminal();
			var rc = startTerminal(t.id, "/bin/bash");
			if(rc == terminal.TERMINAL_OK)
			{

			}
		}
	}
	
}

function send_data(data,id,t)
{
	var tag = new xmpp.Element('shells',{xmlns:'wyliodrin',id:id,action:"keys",}).c(data);
	t.send();
}

exports.send_data = send_data;

