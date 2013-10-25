var xmpp = null;
var terminal = null;

var COMMAND = '/bin/bash';

var buildFile = null;

function load(modules)
{
	xmpp = modules.xmpp;
	terminal = modules.terminal;
}

function loadConfig(configs)
{
	buildFile = configs.buildFile;
}

function makeTerminal(t, from, to, es, error, command, args, env)
{
	var term = terminal.allocTerminal();
				console.log('term allocated');
				if(!es.attrs.height)
					height = 0;
				else
				{
					try
					{
					height = parseInt(es.attrs.height);
					}
				catch(e){}
				}
				if(!es.attrs.width)
					width = 0;
				else
				{
					try
					{
					width = parseInt(es.attrs.width);
					}
				catch(e){}
				}
				var rc = terminal.startTerminal(term.id, command, args, width, height, env, function (data)
					{
						var tag = new xmpp.Element('shells',{shellid:term.id,action:"keys",}).t(data);
						t.sendWyliodrin(from, tag);
					});
				if(rc == terminal.TERMINAL_OK)
				{
					console.log('terminal ok');
					var id = es.attrs.request;
					var tag = new xmpp.Element('shells', {action:'open', response:'done', request:id, shellid:term.id});
					console.log(tag.root().toString());
					t.sendWyliodrin(from, tag);
				}
				else
				{
					console.log('terminal error');
					var id = es.attrs.request;
					var tag = new xmpp.Element('shells', {action:'open', response:'error', request:id});
					t.sendWyliodrin(from, tag);
				}
}


function shell_stanza(t, from, to, es, error)
{
	console.log('shell_stanza');
	console.log('error='+error);
	if(error == 0)
	{
		if(es.attrs.action == 'open')
		{
			if(!es.attrs.projectid)
			{
				console.log('open');
				makeTerminal(t, from, to, es, error, COMMAND, [],process.env.HOME);
				
			}
			else
			{
				if(es.attrs.projectid.indexOf('/') == -1)
				{
					makeTerminal(t, from, to, es, error, 'sudo', ['make','run'], buildFile+'/'+es.attrs.projectid);
				}
				
			}
		}
		if(es.attrs.action == 'close')
		{
			var id = parseInt(es.attrs.shellid);
			var rc = terminal.destroyTerminal(id);
		}
		if(es.attrs.action == 'keys')
		{
			var id = parseInt(es.attrs.shellid);
			var rc = terminal.sendKeysToTerminal(id, new Buffer(es.getText(),'base64').toString());
		}
	}
	
}


exports.shellStanza = shell_stanza;
exports.load = load;
exports.loadConfig = loadConfig;
