"use strict";

var os = require('os');

var boardType = null;
var xmpp      = null;
var wxmpp     = null;

function load(modules)
{
  boardType = modules.config.gadget;
  xmpp      = modules.xmpp;
  wxmpp     = modules.wxmpp;
}

function sendStartInfo(from)
{
  if(wxmpp != null && wxmpp.checkConnected())
  {
    var t = wxmpp.getConnection();
    var tag = new xmpp.Element('info', {board:boardType, uptime:os.uptime(), loadavg1:os.loadavg()[0],
      loadavg5:os.loadavg()[1], loadavg15:os.loadavg()[2], totalmem:os.totalmem(), freemem:os.freemem()});
    var cpus = os.cpus(); 
    for(var i = 0; i < cpus.length; i++)
    {
      tag.c('cpu', {model:cpus[i].model, speed:cpus[i].speed});
    }
    t.sendWyliodrin(from, tag);
  }
}

function sendInfo(from)
{
  if(wxmpp.checkConnected())
  {
    var t = wxmpp.getConnection();
    var tag = new xmpp.Element('info', {uptime:os.uptime(), loadavg1:os.loadavg()[0], freemem:os.freemem(),
      loadavg5:os.loadavg()[1], loadavg15:os.loadavg()[2]});
    t.sendWyliodrin(from, tag);
  }
}

exports.sendStartInfo = sendStartInfo;
exports.load          = load;
exports.sendInfo      = sendInfo;
