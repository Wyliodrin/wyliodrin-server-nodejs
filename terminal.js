var pty = require('pty.js');
var MAX_TERMINALS = 1024;

function terminal(id)
{
	var t = {id:id};
	return t;
}

function init_terminal()
{
	var term[];
	for(var i=0; i<MAX_TERMINALS; i++)
	{
		term[i] = null;
	}
	return term;
}

function find_terminal_id()
{
	var i = 0;
	var found = 0;
	while(i<MAX_TERMINALS && found==0)
	{
		if
	}
}

var term = pty.spawn('bash',[],{
	name: 'xterm-color',
	cols:80,
	rows:24,
	cwd:process.env.HOME,
	env:process.env
});

