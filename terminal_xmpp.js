"use strict"
var dict = require('dict');
var log = require('./log');
var projectsDict = dict({});
var xmpp = require('./xmpp_library.js').xmpp;
var terminal = require('./terminal');
var config = require('./settings').config.config;
//var settings = config.config;

var sys = require ('child_process');

var COMMAND = '/bin/bash';

var buildFile = config.buildFile;
var INVALID_ID = -2;

var wxmpp = require('./wxmpp');
var home = config.home;

function makeTerminal(t, from, to, es, error, command, args, env)
{
	//console.log('make terminal');
	var term = terminal.allocTerminal(from);
	var width;
	var height;
	term.request = es.attrs.request;
	// console.log('term allocated');
	// console.log (es);
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
	var rc = terminal.startTerminal(term.id, es.attrs.projectid, command, args, width, height, term.request,
			es.attrs.userid, env, function (data, from)
		{
			if (from) for(var i=0; i<from.length; i++)
			{
	//			console.log('started terminal with from = '+from[i]);
				var tag = new xmpp.Element('shells',{shellid:term.id,action:"keys",request:term.request}).t(data);
				t.sendWyliodrin(from[i], tag, false);
			}
		});
	if(rc == terminal.TERMINAL_OK)
	{
	//	console.log('terminal ok');
		var id = es.attrs.request;
		var tag = new xmpp.Element('shells', {action:'open', response:'done', request:term.request, shellid:term.id});
		// console.log(tag.root().toString());
		t.sendWyliodrin(from, tag, false);
	}
	else
	{
	//	console.log('terminal error');
		var id = es.attrs.request;
		var tag = new xmpp.Element('shells', {action:'open', response:'error', request:term.request});
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
				//console.log('open terminal '+home);
				makeTerminal(t, from, to, es, error, COMMAND, [], home);		
			}
			else
			{
				if(es.attrs.projectid.indexOf('/') == -1)
				{
	//				console.log("hos not /");
					if(projectsDict.has(es.attrs.projectid))
					{
						// console.log('attachTerminal');
	//					console.log('terminal in dict');
						var id = projectsDict.get(es.attrs.projectid);
						// terminal.attachTerminal(from, id);	
						terminal.destroyTerminal(id, from, 'stop', function(code, from){
							var tag = new xmpp.Element('shells', {shellid:id, action:es.attrs.action, code:code, projectid:es.attrs.projectid});
							t.sendWyliodrin(from, tag);
							try{
							var term = makeTerminal(t, from, to, es, error, config.run[0], config.run.slice (1).concat ('run'), buildFile+'/'+es.attrs.projectid);
							}catch(e){throw e;}
							projectsDict.set(es.attrs.projectid,term.id);
						});
					}
					else
					{
	//					console.log('no terminal in dict');
						try{
	//						console.log (buildFile+'/'+es.attrs.projectid);
						var term = makeTerminal(t, from, to, es, error, config.run[0], config.run.slice (1).concat ('run'), buildFile+'/'+es.attrs.projectid);
						} catch(e){log.putError(e);}
						projectsDict.set(es.attrs.projectid,term.id);
					}					
					
				}
				
			}
		}
		if(es.attrs.action == 'poweroff')
		{
			console.log('poweroff stanza');
			sys.exec (config.sudo+' poweroff', function (error, stdout, stderr)
			{
				console.log(error);
				if (error) log.putError('poweroff error '+stderr);
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
						var tag = new xmpp.Element('shells', {shellid:id, action:es.attrs.action, request:es.attrs.request, code:code, projectid:es.attrs.projectid});
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
exports.closeProject = closeProject;
