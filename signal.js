var net = require('net');
var util = require('util');
var carrier = require('carrier');
var signal_xmpp = null;
var _ = require ('underscore');

var socketArray = [];

PORT = 8124;

function load(modules)
{
	signal_xmpp = modules.signal_xmpp;
}

function startSocketServer()
{
	
		var server = net.createServer(function(c){
		var id = null;
		carrier.carry(c, function(line){
			var tokens = line.split(' ');
			if(!id)
			{
				if((tokens.length == 2) && (tokens[0] == "id"))
				{
					id = tokens[1];
					socketArray[id] = c;
				}
				else
				{
					c.end();
				}
			}
			else
			{
				var signal = tokens[0];
				var value = tokens[1];
				var d = new Date();
				var time = d.getTime();
				signal_xmpp.sendSignal(signal, value, id, time);
			}
		});
	});
	server.listen(PORT, function(){});
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
exports.PORT = PORT;
exports.startSocketClient = startSocketClient;
exports.load = load;
exports.setSignal = setSignal;