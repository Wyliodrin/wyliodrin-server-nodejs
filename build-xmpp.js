var xmpp = null;
var build = null;

function load(modules)
{
	xmpp = modules.xmpp;
	build = modules.build;
}

function buildStanza(t, from, to, es, error)
{
	if(error == 0)
	{
		if(es.attrs.action == "build")
		{
			build.make(es.attrs.projectid, "make build", function(data,source, code, signal)
			{
				if(source == "stdout" || source == "stderr")
				{
					var tag = new xmpp.Element("make", {action:es.attrs.action, response:"done",
						request:es.attrs.request, projectid:es.attrs.projectid, source:source}).t(data);
					t.sendWyliodrin(from, tag);
				}
				else
				{
					var tag = new xmpp.Element("make",{action:es.attrs.action, response:"error",
						request:es.attrs.request, projectid:es.attrs.projectid, code:code, signal:signal});
					t.sendWyliodrin(from, tag);
				}
			});
		}
	}	
}

exports.buildStanza = buildStanza;
exports.load = load;
