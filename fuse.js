var f4js = require('fuse4js');
var fs = require('fs');
var child_process = require('child_process');
var mkdirp = require ('mkdirp');

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
<<<<<<< HEAD
	var mountFile = config.mountFile;
  var wxmpp = modules.wxmpp;
=======
  var settings = modules.settings;
	var mountFile = settings.mountFile;
  var wxmpp = modules.wxmpp;
  var log = modules.log;
>>>>>>> master
  var didFunction = false;
  if(canMount())
  {
  	child_process.exec(settings.umount+' '+mountFile, function (err, stdout, stderr)
    {
      if (err == 0)
      {
<<<<<<< HEAD
=======
        log.putLog ('Creating fuse mounting directory in '+mountFile);
        mkdirp.sync (mountFile);
>>>>>>> master
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
