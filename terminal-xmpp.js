var xmpp = require("node-xmpp");


function send_data(data,id)
{
	var tag = new xmpp.Element('shells',{xmlns:'wyliodrin',id:id,action:"keys",}).c(data);

}

exports.send_data = send_data;

