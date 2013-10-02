var pty = require('pty.js');
MAX_TERMINALS = 1024;
TERMINAL_ROWS = 24;
TERMINAL_COLS = 80;
var terminals=[];


function alloc_terminal()
{
	var id = find_terminal_id();
	var t = {id:id
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

function delete_terminal(id)
{
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
	terminals[id].terminal = term;
}

function send_keys(data,id)
{

}

init_terminals();
console.log(alloc_terminal(find_terminal_id()).id);
console.log(alloc_terminal(find_terminal_id()).id);
delete_terminal(1);
console.log(alloc_terminal(find_terminal_id()).id);
console.log(alloc_terminal(find_terminal_id()).id);

start_terminal(1,'vi');

