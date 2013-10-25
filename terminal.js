var pty = require('pty.js');

var terminal_xmpp = null;
MAX_TERMINALS = 1024;
TERMINAL_ROWS = 24;
TERMINAL_COLS = 80;

TERMINAL_E_NOT_FOUND = 1;
TERMINAL_OK = 0;
TERMINAL_E_NOT_ALLOC = 2;

var terminals=[];

function load(modules)
{
	terminal_xmpp = modules.terminal_xmpp;
	for(var i=0; i<MAX_TERMINALS; i++)
	{
		terminals[i] = null;
	}
}


function alloc_terminal()
{
	var id = find_terminal_id();
	var t = {id:id,
				terminal:null};
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
		if(terminals[i].id == id)
			return terminals[i];
		i++;
	}
	return null;
}

function destroy_terminal(id)
{
	var t = find_terminal_by_id(id);
	if(t != null)
	{
		//verific daca s-a facut terminalul sau doar s-a alocat
		if(t.terminal != null)
		{
			t.terminal.destroy();
			terminals[id] = null;
			return TERMINAL_OK;
		}
		else
			return TERMINAL_E_NOT_ALLOC;
	}
	else return TERMINAL_E_NOT_FOUND;	
}

function start_terminal(id, command, args, width, height, env, send_data)
{
	console.log('start terminal');
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
		console.log('not null');
		var term = pty.spawn(command, args, {
		  name: 'xterm',
		  cols: termWidth,
		  rows: termHeight,
		  cwd: env,
		  env: process.env
		});
	
		t.terminal = term;
		term.on('data', function(data)
		{
			// var b=	new Buffer(data);
			// for(i=0; i<b.length; i++)
			// {
			// 	console.log(b[i]);
			// }
	
			var data64 = new Buffer(data).toString('base64');
			send_data(data64);
			// send_data(data);
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
		for (i=0; i<keys.length; i++)
		{
			t.terminal.write(keys[i]);
		}
		return TERMINAL_OK;
	}
	else
		return TERMINAL_E_NOT_FOUND;
}

exports.allocTerminal = alloc_terminal;
exports.destroyTerminal = destroy_terminal;
exports.startTerminal = start_terminal;
exports.sendKeysToTerminal = sendKeysToTerminal;
exports.TERMINAL_OK = TERMINAL_OK;

exports.load = load;


