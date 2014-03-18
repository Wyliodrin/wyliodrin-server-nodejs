var f4js = require('fuse4js');

function canMount()
{
	var fuse;
	try
  {
    fuse = fs.existsSync ('/dev/fuse');
  }
  catch(e)
  {
    fuse = false;
  }
  return fuse;
}

function init(modules,wxmpp)
{
	var config = modules.config;
	var mountFile = config.mountFile;
  if(canMount())
  {
  	child_process.exec('sudo umount -f '+mountFile, function (err, stdout, stderr)
    {
      f4js.start(mountFile, handlers, true);
    });
  }
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

exports.init = init;