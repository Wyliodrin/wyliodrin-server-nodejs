"use strict";

var os = require('os');

var boardType = null;
var xmpp = null;
var wxmpp = null;
var child_process = require('child_process');


var count = 1;
var timer;

function load(modules)
{
	boardType = modules.config.gadget;
	xmpp = modules.xmpp;
	wxmpp = modules.wxmpp;
	
	

		setInterval(function(){
			var t = wxmpp.getConnection();
			if (t)
			{
				processes (function (ps)
				{
					var elem = new xmpp.Element('info',{data:'ps'});
					ps.forEach(function( item ){
						elem.c('ps',{name:'',pid:item.pid,cpu:item['%CPU'],mem:item.VSZ}).up();
					});
						
					  console.log (ps);
					 t.sendWyliodrin(modules.config.owner, elem);
					});
			}
			},1000);
}

function sendStartInfo(from)
{
	if(wxmpp != null && wxmpp.checkConnected())
	{
		var t = wxmpp.getConnection();
		var tag = new xmpp.Element('info', {board:boardType, uptime:os.uptime(), loadavg1:os.loadavg()[0],
			loadavg5:os.loadavg()[1], loadavg15:os.loadavg()[2], totalmem:os.totalmem(), freemem:os.freemem()});
		var cpus = os.cpus();	
		for(var i=0; i<cpus.length; i++)
		{
			tag.c('cpu', {model:cpus[i].model, speed:cpus[i].speed});
		}
		t.sendWyliodrin(from, tag);
	}
}

function sendInfo(from)
{
	if(wxmpp.checkConnected())
	{
		var t = wxmpp.getConnection();
		var tag = new xmpp.Element('info', {uptime:os.uptime(), loadavg1:os.loadavg()[0], freemem:os.freemem(),
			loadavg5:os.loadavg()[1], loadavg15:os.loadavg()[2]});
		t.sendWyliodrin(from, tag);
	}
}

function info_stanza(t, from, to, es, error)
{
	console.log('info stanza');
	if (!error)
	{
		console.log("! err");
		var action = es.attrs.action;
		if (action == 'kill')
		{
			//kill process
			var pid = es.attrs.pid;
			if (pid)
			{
				kill(pid);
			}
		}
		else if (action == 'send')
		{
			//send
			timer = setInterval(function(){
				if (count <= 30 && es.attrs.action == 'send')
				{
					processes (function (ps)
					{
						var elem = new xmpp.Element('info',{data:'ps', request:'request id'});
						ps.forEach(function( item ){
							elem.c('ps',{name:'',pid:item.pid,cpu:item.CPU,mem:item.VSZ}).up();
						});
						
					    //console.log (ps);
					    if (t)
					    {
					    	t.sendWyliodrin(from, elem);
					    }
					});
					count = count + 1;
				}
			},10000);
			
			
		}
		else if (action == 'stop')
		{
			//stop sending
			clearInterval(timer);
		}
	}
}


function processes (list)
{
    child_process.exec ('ps -eo pid,%cpu,vsz,comm | tr -s \' \'', function (error, stdout, stderr)
    {
        var ps = []; 
        var lines = stdout.split ('\n');
        var columns = lines[0].trim().split (' ');
        lines.splice (0,1);
        lines.forEach (function (process)
        {
            if (process!='')
            {
                var pscolumns = process.trim().split (' ');
                var pss = {};
                for (var i=0; i<columns.length; i++)
                {
                    pss[columns[i]] = pscolumns[i];
                }
                ps.push (pss);
            }
        });
        list (ps);
    });
}

function kill (pid)
{
    child_process.exec ('kill -KILL '+pid, function (error, stdout, stderr)
    {
        if (done) done (err);
    });
}


exports.sendStartInfo = sendStartInfo;
exports.load = load;
exports.sendInfo = sendInfo;
