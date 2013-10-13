var wxmpp = require('node-xmpp');
var fs = require('fs');

var isConnected = false;

function connect()
{
	var file_data = fs.readFileSync('/boot/wyliodrin.json');
	var d = JSON.parse(file_data);
	var jid = d.jid;
	var password = d.password;

	if(!isConnected)
	{
		
		var connection = new wxmpp.Client({jid:jid,password:password,preferredSaslMechanism:'PLAIN'});
		isConnected = true;
		
		connection.on ('error', function(error)
		{
		  console.error (error);
		});

		connection.on ('online', function()
		{
		  console.log (jid+"> online");
		  connection.send(new wxmpp.Element('presence',
		           {}).
		      c('priority').t('50').up().
		      c('status').t('Happily echoing your <message/> stanzas')
		     );
		});

		connection.on ('rawStanza', function (stanza)
		{
		  console.log (jid+'>'+stanza.root().toString());
		});

		connection.on('stanza', function(stanza)
		{

		});
	}
	return connection;
}

function disconnect(connection)
{
	if(isConnected)
	{
		console.log('disconnect');
		connection.end();
		isConnected = false;
	}
}

var connection = connect();

//disconnect(connection);