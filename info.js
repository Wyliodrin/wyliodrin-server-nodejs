"use strict";

var os = require('os');
var dict = require ('dict');
var xmpp = require('./xmpp_library.js').xmpp;
var wxmpp = require('./wxmpp');
var child_process = require('child_process');


var count = 1;
var projectSendDict = dict();
var timer;

var config = require('./settings').config.config;
var networkConfig = require('./settings').config.networkConfig;

var boardType = config.board;

function sendInfo(requestid)
{	
	if (wxmpp && wxmpp.checkConnected())
	{
		var t = wxmpp.getConnection();
		processes (function (ps)
		{
			console.log("\n\nps = "+ps.length);
			var elem = new xmpp.Element('info',{request:requestid, data:'ps', loadavg:os.loadavg()[0]*100, totalmem:os.totalmem(), freemem:os.freemem()});
			ps.forEach(function( item ){
				elem.c('ps',{name:item.COMMAND,pid:item.PID,cpu:item['%CPU'],mem:item.VSZ}).up();
			});
				
			t.sendWyliodrin(networkConfig.owner, elem);					
	});
	}
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
	//console.log('info stanza');
	if (!error)
	{
		//console.log("! err");
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
			var request_id = es.attrs.request;
			sendInfo(request_id);
			
		}
		// else if (action == 'stop')
		// {
		// 	//stop sending
		// 	var request_id = es.attrs.request;
		// 	projectSendDict.delete(request_id.toString());
		// }
	}
}

function filter_attr (str)
{

}


function processes (list)
{
    child_process.exec ('ps -eo pid,%cpu,vsz,comm | tr -s \' \'', function (error, stdout, stderr)
    {
        if (stdout.trim().length==0)
        {
        	child_process.exec ('ps | tr -s \' \'', function (error, stdout, stderr)
        	{
        		listprocesse (stdout, list);
        	});
        }
        else
        {
        	listprocesse (stdout, list);
        }
    });
}

function kill (pid)
{
    child_process.exec ('kill -KILL '+pid, function (error, stdout, stderr)
    {
        if (done) done (err);
    });
}

function listprocesse (psls, pslist)
{
	// console.log (psls);
	var ps = []; 
    var lines = psls.split ('\n');
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
    pslist (ps);
}


exports.sendStartInfo = sendStartInfo;
exports.sendInfo = sendInfo;
