"use strict";
var pty = require('pty.js');
var _ = require('underscore');

var terminal_xmpp = null;
var MAX_TERMINALS = 1024;
var TERMINAL_ROWS = 24;
var TERMINAL_COLS = 80;

var TERMINAL_E_NOT_FOUND = 1;
var TERMINAL_OK = 0;
var TERMINAL_E_NOT_ALLOC = 2;

var terminals=[];
var port;

function load(modules)
{
	port = parseInt(modules.config.port);
	// console.log('port = '+port);
	terminal_xmpp = modules.terminal_xmpp;
	for(var i=0; i<MAX_TERMINALS; i++)
	{
		terminals[i] = null;
	}
}


function alloc_terminal(from)
{
	var id = find_terminal_id();
	var t = {id:id,
				terminal:null,
				from:[from],
				projectId:null};
	terminals[id] = t;
	return t;
}

function find_terminal_id()
{
	var i = 0;
	while(i<MAX_TERMINALS)
	{
		if(terminals[i]==null)
		{
			return i;
		}
		i++;
	}
}

function find_terminal_by_id(id)
{
	var i=0;
	while(i<terminals.length)
	{
		if(terminals[i])
		{
			if(terminals[i].id == id)
				return terminals[i];
		}
		i++;
	}
	return null;
}

function destroy_terminal(id,from,action, sendResponse)
{
	var t = find_terminal_by_id(id);
	if(t != null)
	{
		//verific daca s-a facut terminalul sau doar s-a alocat
		if(t.terminal != null)
		{
			if(action = 'close')
			{
				if(t.from.length > 1)
				{
					t.from.pop(from);
					sendResponse(TERMINAL_OK, [from]);
				}
				else
				{
					t.terminal.destroy();
					terminals[id] = null;
					sendResponse(TERMINAL_OK, [from]);
				}
			}
			else
			{
				var from = t.from;
				t.terminal.destroy();
				terminals[id] = null;
				sendResponse(TERMINAL_OK, from);
			}
		}
		else
			sendResponse(TERMINAL_E_NOT_ALLOC);
	}
	else sendResponse(TERMINAL_E_NOT_FOUND);	
}

function start_terminal(id, projectId, command, args, width, height, env, send_data)
{
	// console.log('start terminal');
	var t = find_terminal_by_id(id);
	//console.log(t.id);
	var termWidth = TERMINAL_COLS;
	var termHeight = TERMINAL_ROWS;
	if(t != null)
	{
		if(width != 0)
			termWidth = width;
		if(height != 0)
			termHeight = height;
		// console.log('not null');
		var term = pty.spawn(command, args, {
		  name: 'xterm',
		  cols: termWidth,
		  rows: termHeight,
		  cwd: env,
		  env:_.extend(process.env,{home:modules.config.home,wyliodrin_id:projectId, wyliodrin_port:port})
		});
	
		t.terminal = term;
		t.projectId = projectId;
		term.on('data', function(data)
		{
			// var b=	new Buffer(data);
			// for(i=0; i<b.length; i++)
			// {
			// 	console.log(b[i]);
			// }
	
			var data64 = new Buffer(data).toString('base64');
			send_data(data64, t.from);
			// send_data(data);
		});
		term.on('exit', function(){
			// console.log('terminal closed');
			if(t.projectId)
			{
				// console.log('term has proj id');
				terminal_xmpp.closeProject(t.projectId);
			}
			terminal_xmpp.notifyClosedTerminal(id, t.from);
			terminals[id] = null;

		});
		// term.write('blabla\r');
		return TERMINAL_OK
	}
	return TERMINAL_E_NOT_FOUND;
}

function sendKeysToTerminal(id, keys)
{
	// console.log ('sending keys');
	var t = find_terminal_by_id(id);
	// console.log (t);
	if(t != null)
	{
		for (var i=0; i<keys.length; i++)
		{
			t.terminal.write(keys[i]);
		}
		return TERMINAL_OK;
	}
	else
	{
		console.log ('terminal not found '+id);
		return TERMINAL_E_NOT_FOUND;
	}
}

function attachTerminal(from, id)
{
	var t = find_terminal_by_id(id);
	if(t != null)
	{
		t.from.push(from);
	}
}

exports.allocTerminal = alloc_terminal;
exports.destroyTerminal = destroy_terminal;
exports.startTerminal = start_terminal;
exports.sendKeysToTerminal = sendKeysToTerminal;
exports.TERMINAL_OK = TERMINAL_OK;
exports.MAX_TERMINALS = MAX_TERMINALS;

exports.load = load;
exports.attachTerminal = attachTerminal;


