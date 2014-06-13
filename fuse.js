var f4js = require('fuse4js');
var fs = require('fs');
var child_process = require('child_process');
var mkdirp = require ('mkdirp');
var config = require('./settings').config.config;
var mountFile = config.mountFile;
var wxmpp = require('./wxmpp');
var log = require('./log');
var files = require('./files');


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

function init()
{
  var didFunction = false;
  if(canMount())
  {
  	child_process.exec(config.umount+' '+mountFile, function (err, stdout, stderr)
    {
	console.log (err);
      {
        log.putLog ('Creating fuse mounting directory in '+mountFile);
        mkdirp.sync (mountFile);
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
      files.start();
    });
  }
}

exports.init = init;
exports.canMount = canMount;
