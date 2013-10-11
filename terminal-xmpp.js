var xmpp = require('./xmpp.js');


function shell_stanza(stanza, from, to, es, error)
{
	var action = stanza.getChild('action');
	
}

function send_data(data,id)
{
	var tag = new xmpp.Element('shells',{xmlns:'wyliodrin',id:id,action:"keys",}).c(data);

}

exports.send_data = send_data;

