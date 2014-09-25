"use strict";
var xmpp = require('./xmpp_library.js').xmpp;
var build = require('./build');
var wxmpp = require('./wxmpp');
var log = require ('./log');

function buildStanza(t, from, to, es, error)
{
	if(error == 0)
	{
		log.putLog ('Make stanza from '+from);
		if(es.attrs.action == "build")
		{
			log.putLog ('Build project');
			build.make(es.attrs.projectid, "make", ["build"], es.attrs.address, es.attrs.userid,
				function(data,source, code)
			{
				if (data) data = new Buffer (data).toString ('base64');
				if(source)
				{
					var tag = new xmpp.Element("make", {action:es.attrs.action, response:"working",
						request:es.attrs.request, projectid:es.attrs.projectid, source:source}).t(data);
					if(wxmpp.ownerIsAvailable())
						t.sendWyliodrin(from, tag, false);
					else
						t.sendWyliodrin(from, tag, true);
				}
				else
				{
					var tag = new xmpp.Element("make",{action:es.attrs.action, response:"done",
						request:es.attrs.request, projectid:es.attrs.projectid, code:code});
					if(wxmpp.ownerIsAvailable())
						t.sendWyliodrin(from, tag, false);
					else
						t.sendWyliodrin(from, tag, true);
				}
			});
		}
		else if(es.attrs.action == "close")
		{
			log.putLog ('Stop project');
			if(build.buildArray[es.attrs.projectid] != null)
			{
				build.killProcess();
			}
		}
	}	
}

exports.buildStanza = buildStanza;
