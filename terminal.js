var pty = require('pty.js');
var xmpp = require('node-xmpp');
MAX_TERMINALS = 1024;
TERMINAL_ROWS = 24;
TERMINAL_COLS = 80;
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
	//eroare; nu gaseste terminalul; ce fac????
}

function destroy_terminal(id)
{
	var t = find_terminal_by_id(id);
	//verific daca exista!!!!

	//verific daca s-a facut terminalul sau doar s-a alocat
	if(t.terminal != null)
	{
		//console.log("not null");
		t.terminal.kill();
	}
	//console.log("destroy");
	terminals[id] = null;
}

function start_terminal(id, command)
{
	var term = pty.spawn(command, [], {
	  name: 'xterm-color',
	  cols: TERMINAL_COLS,
	  rows: TERMINAL_ROWS,
	  cwd: process.env.HOME,
	  env: process.env
	});
	var t = find_terminal_by_id(id);
	t.terminal = term;
	term.on('data', function(data)
		{
			
		});	
}

init_terminals();
console.log(alloc_terminal(find_terminal_id()).id);
console.log(alloc_terminal(find_terminal_id()).id);
//console.log(alloc_terminal(find_terminal_id()).id);
console.log(alloc_terminal(find_terminal_id()).id);


start_terminal(1,'vi');
//destroy_terminal(1);
//setTimeout(destroy_terminal(1), 10000);
//console.log("end");

