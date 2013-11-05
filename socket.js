var net = require('net');
var util = require('util');
var carrier = require('carrier');

PORT = 8124;

function startSocketServer()
{
	var server = net.createServer(function(c){
		// c.on('data',function(data){
		// 	console.log('server received '+data);
		carrier.carry(c, function(line){
			console.log('line = '+line);
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
	client.write('ana\nare\nmere\r\n');
});
client.on('data', function(data) {
  console.log('data '+data.toString());
});
}

exports.startSocketServer = startSocketServer;
exports.PORT = PORT;
exports.startSocketClient = startSocketClient;