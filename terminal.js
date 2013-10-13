var pty = require('pty.js');
var terminal_xmpp = require('terminal-xmpp.js');
MAX_TERMINALS = 1024;
TERMINAL_ROWS = 24;
TERMINAL_COLS = 80;

TERMINAL_E_NOT_FOUND = 1;
TERMINAL_OK = 0;
TERMINAL_E_NOT_ALLOC = 2;

var terminals=[];


function alloc_terminal()
{
	var id = find_terminal_id();
	var t = {id:id,
				terminal:null};
	terminals[id] = t;
	return t;
}

function init_terminals()
{
	for(var i=0; i<MAX_TERMINALS; i++)
	{
		terminals[i] = null;
	}
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
			t.terminal.kill();
			terminals[id] = null;
			return TERMINAL_OK;
		}
		else
			return TERMINAL_E_NOT_ALLOC;
	}
	else return TERMINAL_E_NOT_FOUND;	
}

function start_terminal(id, command, send_data)
{
	var t = find_terminal_by_id(id);
	if(t != null)
	{
		var term = pty.spawn(command, [], {
		  name: 'xterm-color',
		  cols: TERMINAL_COLS,
		  rows: TERMINAL_ROWS,
		  cwd: process.env.HOME,
		  env: process.env
		});
	
		t.terminal = term;
		term.on('data', function(data)
		{
			var data64 = new Buffer(data, 'base64');
			send_data(data64,id);
		});	
		return TERMINAL_OK
	}
	return TERMINAL_E_NOT_FOUND;
}

function sendKeysToTerminal(id, keys)
{
	var t = find_terminal_by_id(id);
	if(t != null)
	{
		t.terminal.write(keys);
		return TERMINAL_OK;
	}
	else
		return TERMINAL_E_NOT_FOUND;
}

exports.initTerminals = init_terminals;
exports.allocTerminal = alloc_terminal;
exports.destroyTerminal = destroy_terminal;
exports.startTerminal = start_terminal;
exprots.sendKeysToTerminal = sendKeysToTerminal;
// init_terminals();
// console.log(alloc_terminal(find_terminal_id()).id);
// console.log(alloc_terminal(find_terminal_id()).id);
// //console.log(alloc_terminal(find_terminal_id()).id);
// console.log(alloc_terminal(find_terminal_id()).id);


// start_terminal(1,'vi');
// //destroy_terminal(1);
// //setTimeout(destroy_terminal(1), 10000);
// //console.log("end");

