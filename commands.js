xterm = require ('./terminal.js');

xterm.initTerminals ();
t = xterm.allocTerminal ();
xterm.startTerminal (t.id, "bash", function (data)
{
	//console.log (data);
	// console.log ('t: ' +data);
	for (var i=0; i<data.length; i++)
	{
		process.stdout.write (data[i]+' ');
	}
	// console.log (data.length);
	// process.stdout.write (data);
});

setTimeout (function ()
	{
		t.terminal.write ('ls\n');
	}, 1000);



