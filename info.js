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

function load()
{	
	setInterval(function(){
		if (projectSendDict.size > 0)
		{
			console.log("projectSendDict.size > 0");
			if (wxmpp && wxmpp.checkConnected())
			{
				var t = wxmpp.getConnection();
				projectSendDict.forEach(function(value,key){
					processes (function (ps)
					{
						var elem = new xmpp.Element('info',{data:'ps', loadavg:os.loadavg()[0]*100, totalmem:os.totalmem(), freemem:os.freemem()});
						ps.forEach(function( item ){
							elem.c('ps',{name:item.COMMAND,pid:item.PID,cpu:item['%CPU'],mem:item.VSZ}).up();
						});

						  //console.log ("owner = "+networkConfig.owner);
							t.sendWyliodrin(networkConfig.owner, elem);
					});
					value = value -1;
					if (value <= 0)
					 {
					 	projectSendDict.delete(key);
					 }						
				});
			}
		}
	},3000);
}

function sendStartInfo(from)
{
	console.log("start info from -"+from);
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
	console.log("send info from -"+from);
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
	if (!error)
	{
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
			console.log("info stanza send");
			var request_id = es.attrs.request;
			if(config.pstimes)
				projectSendDict.set(request_id.toString(),config.pstimes);
			else
				projectSendDict.set(request_id.toString(), 30);
			
		}
		else if (action == 'stop')
		{
			//stop sending
			var request_id = es.attrs.request;
			projectSendDict.delete(request_id.toString());
		}
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

function kill (pid, done)
{
	console.log (networkConfig.stop+' '+pid);
    child_process.exec (config.stop+' '+pid, function (error, stdout, stderr)
    {
    	console.log(error);
    	console.log(stdout);
        if (done) done (error);
    });
}

function listprocesse (psls, pslist)
{
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
exports.load = load;
exports.info_stanza = info_stanza;