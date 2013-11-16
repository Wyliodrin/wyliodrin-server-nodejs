var net = require('net');
var util = require('util');
var carrier = require('carrier');
var signal_xmpp = null;
var _ = require ('underscore');

var socketArray = [];

var port = null;

function load(modules)
{
	signal_xmpp = modules.signal_xmpp;
	port = modules.config.port;
}

function startSocketServer()
{
		console.log('start socket');	
		var server = net.createServer(function(c){
			console.log('id = '+id);
		var id = null;
		carrier.carry(c, function(line){
		console.log('line = '+line);
			var tokens = line.split(' ');
			if(!id)
			{
				if((tokens.length == 2) && (tokens[0] == "id"))
				{
					id = tokens[1];
					socketArray[id] = c;
					console.log('received id\n');
				}
				else
				{
					console.log('server end connection');
					c.end();
				}
			}
			else
			{
				var signal = tokens[0];
				var value = tokens[1];
				if(parseFloat(value) != NaN)
				{
					var d = new Date();
					var time = d.getTime();
					var s = {signal:signal, value:value, id:id, time:time};
					signal_xmpp.sendSignal(s, id, time);
				}
				else
				{
					var d = new Date();
					var time = d.getTime();
					var s={signal:signal, component:[], id:id, time:time};
					var i=1;
					while(i<(tokens.length-1))
					{
						s.component.push({signal:tokens[i], value:tokens[i+1]});
						i=i+2;
					}
					signal_xmpp.sendSignal(s);
				}
			}
		});
	});
	server.listen(port, function(){console.log('server listening')});
}
	
function setSignal(signal, value, id)
{
	if(id)
	{
		if(socketArray[id])
		{
			c.write(signal+' '+value);
		}
	}
}

function startSocketClient(id)
{
	console.log('startSocketClient '+id);
	var client = net.connect({port: 8124},
    function() { //'connect' listener
  	client.write('id '+id+'\n');
	client.write('temperature 123\n');
	client.write('light 156\n');
	//client.write('sensor');
	//client.write(' 1234\n');
});
client.on('end',function(data){
	console.log('connection ended ');
	client.end();
});
client.on('data', function(data) {
  console.log('data '+data.toString());
});
client.on('error', function(error){
	console.log('error '+error)
});
}

exports.startSocketServer = startSocketServer;
exports.startSocketClient = startSocketClient;
exports.load = load;
exports.setSignal = setSignal;
