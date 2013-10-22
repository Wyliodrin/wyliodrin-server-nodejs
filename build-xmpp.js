var xmpp = require('./xmpp_library.js').xmpp;
var build = require('./build.js');

function buildStanza(t, from, to, es, error)
{
	if(error == 0)
	{
		if(es.attrs.action == "build")
		{
			build.make(es.attrs.id, "make build", function(data,source, code, signal)
			{
				if(source == "stdout" || source == "stderr")
				{
					var tag = new xmpp.Element("make", {action:es.attrs.action, response:"done",
						request:es.attrs.request, source:source}).t(data);
					t.sendWyliodrin(from, tag);
				}
				else
				{
					var tag = new xmpp.Element("make",{action:es.attrs.action, response:"error",
						request:es.attrs.request, code:code, signal:signal});
					t.sendWyliodrin(from.tag);
				}
			});
		}
	}	
}

exports.buildStanza = buildStanza;