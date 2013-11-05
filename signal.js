var net = require('net');
var util = require('util');
var carrier = require('carrier');
var signal_xmpp = null;

PORT = 8124;

function load(modules)
{
	signal_xmpp = modules.signal_xmpp;
}

function startSocketServer()
{
	var id = null;
	var server = net.createServer(function(c){
		carrier.carry(c, function(line){
			//console.log('line = '+line);
			var tokens = line.split(' ');
			if(!id)
			{
				if(tokens[0]=='id')
				{
					id = tokens[1];
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
	


function startSocketClient()
{
	var client = net.connect({port: 8124},
    function() { //'connect' listener
  console.log('client connected');
//   process.stdin.resume();
// process.stdin.setEncoding('utf8');

// process.stdin.on('data', function(chunk) {
//   client.write(chunk);
// });
	client.write('temperature 123\n');
	client.write('sensor');
	client.write(' 1234\n');
});
client.on('data', function(data) {
  console.log('data '+data.toString());
});
}

exports.startSocketServer = startSocketServer;
exports.PORT = PORT;
exports.startSocketClient = startSocketClient;
exports.load = load;