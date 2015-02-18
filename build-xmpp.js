"use strict";

var xmpp  = null;
var build = null;
var wxmpp = null;

function load(modules)
{
  xmpp  = modules.xmpp;
  build = modules.build;
  wxmpp = modules.wxmpp;
}

function buildStanza(t, from, to, es, error)
{
  if(error == 0)
  {
    if(es.attrs.action == "build")
    {
      build.make(es.attrs.projectid, "make", ["build"], es.attrs.address, function(data,source, code)
      {
        if(data)
        { 
          data = new Buffer (data).toString ('base64');
        }
        if(source)
        {
          var tag = new xmpp.Element("make", {action:es.attrs.action, response:"working",
            request:es.attrs.request, projectid:es.attrs.projectid, source:source}).t(data);
          if(wxmpp.ownerIsAvailable())
          {
            t.sendWyliodrin(from, tag, false);
          }
          else
          {
            t.sendWyliodrin(from, tag, true);
          }
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
  } 
}

exports.buildStanza = buildStanza;
exports.load = load;
