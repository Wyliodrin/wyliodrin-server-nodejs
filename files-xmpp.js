var xmpp = start_script.modules.xmpp;
var wxmpp = start_script.modules.wxmpp;

function files_stanza(t, from, to, es, error)
{

}

function getAttr(path, sendResult)
{
	if(xmpp.checkConnected)
	{
		var t = xmpp.getConnection;
		var tag = new wxmpp.Element('files',{action:"attributes", path:path});
		t.sendWyliodrin();
	}
	

}