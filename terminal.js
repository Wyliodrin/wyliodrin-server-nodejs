"use strict";
var pty = require('pty.js');
var exec = require ('child_process').exec;
var _ = require('underscore');

var terminal_xmpp = require('./terminal_xmpp');

var MAX_TERMINALS = 1024;
var TERMINAL_ROWS = 24;
var TERMINAL_COLS = 80;
var SCREEN_COMMAND = "/usr/bin/screen";
var BASH_COMMAND="/bin/bash";

var log = require ('./log');

var TERMINAL_E_NOT_FOUND = 1;
var TERMINAL_OK = 0;
var TERMINAL_E_NOT_ALLOC = 2;
var settings = require('./settings').config;
var config = settings.config;
var networkConfig = settings.networkConfig;
var terminals=[];
var home = config.home;

for(var i=0; i<MAX_TERMINALS; i++)
{
	terminals[i] = null;
}

getScreens(function(ids){
	for(var i=0; i<ids.length; i++)
	{
		var id = ids[i];
		var t = {id:id,
				terminal:null,
				from:null,
				projectId:null};
		terminals[id] = t;
	}
	});	

function alloc_terminal(from)
{
	var id = find_terminal_id();
	log.putLog ('Registering shell '+id);
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
	// log.putLog ('Searching shell '+id);
	while(i<terminals.length)
	{
		if(terminals[i])
		{
			if(terminals[i].id == id)
			{
				// log.putLog ('Found shell '+id);
				return terminals[i];
			}
		}
		i++;
	}
	// log.putError ('Shell not found '+id);
	return null;
}

function destroy_terminal(id,from,action, sendResponse)
{
	log.putError ('Close shell '+id);
	var t = find_terminal_by_id(id);
	if(t != null)
	{
		//verific daca s-a facut terminalul sau doar s-a alocat
		if(t.terminal != null)
		{
			if(action == 'stop' || action == 'close')
			{

				console.log("closing project");
				// if(t.from.length > 1)
				// {
				// 	t.from.pop(from);
				// 	sendResponse(TERMINAL_OK, [from]);
				// }
				// else
				// {
					exec ("screen -X -S wyliodrin_screen"+id+" kill");
					t.terminal.destroy();
					terminals[id] = null;
					sendResponse(TERMINAL_OK, [from]);
				// }
			}
			else
			{
				log.putLog ('Unrecognized shell action '+action);
				// var from = t.from;
				// exec (config.stop+' '+t.terminal.pid);
				// t.terminal.destroy();
				// terminals[id] = null;
				// sendResponse(TERMINAL_OK, from);
			}
		}
		else
		{
			log.putLog ('Shell is not registered');
			sendResponse(TERMINAL_E_NOT_ALLOC);
		}
	}
	else sendResponse(TERMINAL_E_NOT_FOUND);	
}

function start_terminal(id, projectId, command, args, width, height, requestid, userid, env, send_data)
{
	log.putLog ('Start shell with project '+projectId+' starting '+command+' '+args.join(' '));
	var t = find_terminal_by_id(id);
	var termWidth = TERMINAL_COLS;
	var termHeight = TERMINAL_ROWS;
	//var my_args;
	if(t != null)
	{
		if(width != 0)
			termWidth = width;
		if(height != 0)
			termHeight = height;
		// if(!projectId)
		// {
			args.splice(0,0,"-S","wyliodrin_screen"+id,command);
		// 	my_args = args;
		// }
		// else
		// {
		// 	my_args = ["-S", "screen"+id, BASH_COMMAND, "-c", "'"+command+' '+args.join(' ')+";"+BASH_COMMAND+"'"];
		// }
		// console.log("starting "+my_args.join(" ")+" in "+env);
		var term = pty.spawn(SCREEN_COMMAND, args, {
		  name: 'xterm',
		  cols: termWidth,
		  rows: termHeight,
		  cwd: env,
		  env:_.extend(process.env,{HOME:home,wyliodrin_project:projectId, wyliodrin_port:6379,
		  		wyliodrin_session:requestid, wyliodrin_userid:userid, wyliodrin_board:config.board})
		});
	
		t.terminal = term;
		t.projectId = projectId;
		term.on('data', function(data)
		{	
			var data64 = new Buffer(data).toString('base64');
			send_data(data64, t.from);
			// send_data(data);
		});
		term.on('exit', function(){
			log.putLog ('Shell closed');
			if(t.projectId)
			{
				log.putLog ('Stopping project '+t.projectId);
				terminal_xmpp.closeProject(t.projectId);
			}
			terminal_xmpp.notifyClosedTerminal(id, t.from, requestid);
			terminals[id] = null;

		});
		// term.write('blabla\r');
		return TERMINAL_OK
	}
	return TERMINAL_E_NOT_FOUND;
}

function sendKeysToTerminal(id, keys)
{
	var t = find_terminal_by_id(id);
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

function getScreens(callbackFunction)
{
	exec("screen -ls | grep wyliodrin", function(error, stdout, stderr){
		var ids = [];
		var results = stdout.match(/wyliodrin_screen[0-9]+/g);
		if(results)
		{
			for(var i=0; i<results.length; i++)
			{
				var pos = "wyliodrin_screen".length;
				ids.push(results[i].substring(pos));
			}
		}
		callbackFunction(ids);
	});
}

function foreground(id, from, callbackFunction)
{
	var t = find_terminal_by_id(id);
	if(t != null)
	{
		console.log
		var args = ['-r','wyliodrin_screen'+id];
		var term = pty.spawn(SCREEN_COMMAND, args, {
		  name: 'xterm',
		  cols: TERMINAL_COLS,
		  rows: TERMINAL_ROWS,
		  cwd: '/wyliodrin'
		});	
		t.terminal = term;
		t.from = [from];
		callbackFunction(null);
		term.on('data', function(data)
		{
			var data64 = new Buffer(data).toString('base64');
			send_data(data64, t.from);
						// send_data(data);
		});
		term.on('exit', function(){
			log.putLog ('Shell closed');
			if(t.projectId)
			{
				log.putLog ('Stopping project '+t.projectId);
				terminal_xmpp.closeProject(t.projectId);
			}
			terminal_xmpp.notifyClosedTerminal(id, t.from, requestid);
			terminals[id] = null;

		});
	}
	else
		callbackFunction(1);
}

exports.foreground = foreground;
exports.allocTerminal = alloc_terminal;
exports.destroyTerminal = destroy_terminal;
exports.startTerminal = start_terminal;
exports.sendKeysToTerminal = sendKeysToTerminal;
exports.TERMINAL_OK = TERMINAL_OK;
exports.MAX_TERMINALS = MAX_TERMINALS;
exports.attachTerminal = attachTerminal;
exports.getScreens = getScreens;


