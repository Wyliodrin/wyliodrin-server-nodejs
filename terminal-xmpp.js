var xmpp = require('./xmpp_library.js').xmpp;
var terminal = require('./terminal.js');

var COMMAND = '/bin/bash';


function shell_stanza(t, from, to, es, error)
{
	console.log('shell_stanza');
	console.log('error='+error);
	if(error == 0)
	{
		if(es.attrs.action == 'open')
		{
			console.log('open');
			var term = terminal.allocTerminal();
			console.log('term allocated');
			var rc = terminal.startTerminal(term.id, COMMAND, function (data)
				{
					var tag = new xmpp.Element('shells',{id:term.id,action:"keys",}).t(data);
					t.sendWyliodrin(from, tag);
				});
			if(rc == terminal.TERMINAL_OK)
			{
				console.log('terminal ok');
				var id = es.attrs.request;
				var tag = new xmpp.Element('shells', {action:'done', request:id, id:term.id});
				console.log(tag.root().toString());
				t.sendWyliodrin(from, tag);
			}
			else
			{
				console.log('terminal error');
				var id = es.attrs.request;
				var tag = new xmpp.Element('shells', {action:'error', request:id});
				t.sendWyliodrin(from, tag);
			}
		}
		if(es.attrs.action == 'close')
		{
			var id = parseInt(es.attrs.id);
			var rc = terminal.destroyTerminal(id);
		}
		if(es.attrs.action == 'keys')
		{
			var id = parseInt(es.attrs.id);
			var rc = terminal.sendKeysToTerminal(id, es.getText());
		}
	}
	
}


exports.shellStanza = shell_stanza;