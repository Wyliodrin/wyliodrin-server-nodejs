var dict = require('dict');

var projectsDict = dict({});
var xmpp = null;
var terminal = null;

var sys = require ('child_process');

var COMMAND = '/bin/bash';

var buildFile = null;
var INVALID_ID = -2;

var wxmpp = null;
var home = null;

function load(modules)
{
	xmpp = modules.xmpp;
	terminal = modules.terminal;
	wxmpp = modules.wxmpp;
}

function loadConfig(configs)
{
	buildFile = configs.buildFile;
	home = configs.home;
}



function makeTerminal(t, from, to, es, error, command, args, env)
{
	var term = terminal.allocTerminal(from);
	// console.log('term allocated');
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
	var rc = terminal.startTerminal(term.id, es.attrs.projectid, command, args, width, height, env, function (data, from)
		{
			if (from) for(var i=0; i<from.length; i++)
			{
				var tag = new xmpp.Element('shells',{shellid:term.id,action:"keys",}).t(data);
				t.sendWyliodrin(from[i], tag, false);
			}
		});
	if(rc == terminal.TERMINAL_OK)
	{
		// console.log('terminal ok');
		var id = es.attrs.request;
		var tag = new xmpp.Element('shells', {action:'open', response:'done', request:id, shellid:term.id});
		// console.log(tag.root().toString());
		t.sendWyliodrin(from, tag, false);
	}
	else
	{
		// console.log('terminal error');
		var id = es.attrs.request;
		var tag = new xmpp.Element('shells', {action:'open', response:'error', request:id});
		t.sendWyliodrin(from, tag, false);
	}
	return term;
}


function shell_stanza(t, from, to, es, error)
{
	// console.log('shell_stanza');
	// console.log('error='+error);
	if(error == 0)
	{
		if(!es.attrs.err){
		if(es.attrs.action == 'open')
		{
			if(!es.attrs.projectid)
			{
				// console.log('open');
				makeTerminal(t, from, to, es, error, COMMAND, [], home);		
			}
			else
			{
				if(es.attrs.projectid.indexOf('/') == -1)
				{
					if(projectsDict.has(es.attrs.projectid))
					{
						// console.log('attachTerminal');
						var id = projectsDict.get(es.attrs.projectid);
						// terminal.attachTerminal(from, id);	
						terminal.destroyTerminal(id, from, 'stop', function(code, from){
							var tag = new xmpp.Element('shells', {shellid:id, action:es.attrs.action, code:code});
							t.sendWyliodrin(from, tag);
							var t = makeTerminal(t, from, to, es, error, 'sudo', ['-E', 'make', 'run'], buildFile+'/'+es.attrs.projectid);
							projectsDict.set(es.attrs.projectid,t.id);
						});
					}
					else
					{
						var t = makeTerminal(t, from, to, es, error, 'sudo', ['-E', 'make', 'run'], buildFile+'/'+es.attrs.projectid);
						projectsDict.set(es.attrs.projectid,t.id);
					}					
					
				}
				
			}
		}
		if(es.attrs.action == 'poweroff')
		{
			sys.exec ('sudo poweroff', function (error, stdout, stderr)
			{
				if (error) console.log ('poweroff error '+stderr);
			});
		}
		if(es.attrs.action == 'close' || es.attrs.action == 'stop')
		{
			if(es.attrs.shellid)
			{
				try{
				var id = parseInt(es.attrs.shellid);}
				catch(e){}
				terminal.destroyTerminal(id, from, es.attrs.action, function(code, from){
					if (from) for(var i = 0; i<from.length; i++)
					{
						var tag = new xmpp.Element('shells', {shellid:id, action:es.attrs.action, request:es.attrs.request, code:code});
						t.sendWyliodrin(from[i], tag);
					}
				});
			}
			else
			{
				var tag = new xmpp.Element('shells', {action:'close', request:es.attrs.request, code:INVALID_ID});
				t.sendWyliodrin(from, tag);
			}
		}
		if(es.attrs.action == 'list')
		{
			projectsDict.forEach(function(value, key){
				var tag = new xmpp.Element('shells',{action:'list', request:es.attrs.request}).c('project',{projectid:key});
				t.sendWyliodrin(from.tag);
			});
		}
		if (es.attrs.action == 'keys')
		{
			try{	
			var id = parseInt(es.attrs.shellid);}
			catch(e){}
			var rc = terminal.sendKeysToTerminal(id, new Buffer(es.getText(),'base64').toString());
		}
	}

}
	
}

function closeProject(projectId)
{
	// console.log('close project ' +projectId);
	if(projectsDict.has(projectId))
	{
		// console.log('removing projectId');
		projectsDict.delete(projectId);
	}
}

function notifyClosedTerminal(id, from)
{
	var t = wxmpp.getConnection();
	var tag = new xmpp.Element('shells',{action:'close', status:'done', shellid:id});
	for(var i=0; i<from.length; i++)
	{
		t.sendWyliodrin(from[i], tag);
	}
}


exports.notifyClosedTerminal = notifyClosedTerminal;
exports.shellStanza = shell_stanza;
exports.load = load;
exports.loadConfig = loadConfig;
exports.closeProject = closeProject;
