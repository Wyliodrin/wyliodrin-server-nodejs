var f4js = require('fuse4js');
var fs = require('fs');
var child_process = require('child_process');

function canMount()
{
	var fuse;
	try
  {
    fuse = fs.existsSync ('/dev/fuse');
    console.log("fuse = "+fuse);
  }
  catch(e)
  {
    console.log("not file "+e);
    fuse = false;
  }
  return fuse;
}

function init(modules, functie)
{
	var config = modules.config;
	var mountFile = config.mountFile;
  var wxmpp = modules.wxmpp;
  var didFunction = false;
  if(canMount())
  {
  	child_process.exec('sudo umount -f '+mountFile, function (err, stdout, stderr)
    {
      if (err == 0)
      {
         if(wxmpp.checkConnected)
        {
          if(wxmpp.ownerIsAvailable())
          {
            var t = wxmpp.getConnection();
            var tag = new xmpp.Element('status',{fuse:canMount()});
            if(xmpp.ownerIsAvailable())
              t.sendWyliodrin(owner, tag, false);
            else
              t.sendWyliodrin(owner, tag, true);
          }
        }
      }
      modules.files.start();
      functie();
    });
  }
}

exports.init = init;
exports.canMount = canMount;