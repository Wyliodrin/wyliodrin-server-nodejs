"use strict";

var child_process = require('child_process');

var fs   = require('fs');
var path = require('path');
var ejs  = require ('ejs');

var log;

var RASPBERRY = 'raspberry';
var GALILEO   = 'galileo';

var RASPBERRY_PATH = '/boot/wyliodrin.json';

var RASPBERRY_CONFIG_FILE = 'wyliodrin.json';
var RASPBERRY_WIFI_FILE   = 'libs/wireless/wireless.conf';

var localConfig = path.join(__dirname, RASPBERRY_CONFIG_FILE);
var wifi = false;

function load(modules)
{
  log = modules.log;
  isRaspberry();
  ifGalileo();
}

/**
 * Check if board is Raspberry Pi
 */
function isRaspberry()
{
  var child  = child_process.exec('cat /proc/cpuinfo | grep BCM',
    function(error, studout, stderr)
    {
      if(error != null)
      {
        log.putError('exec error');
      }
      if(stdout != '')
      {
        findConfigFile(RASPBERRY);
      }
    });
}

/**
 * Check if board is Intel Galileo
 */
function isGalileo()
{
  // TODO
}

/**
 * Search for config file depending on the platform.  
 */
function findConfigFile(platform)
{
  if(platform == RASPBERRY)
  {
    var d         = null;
    var resetWIFI = false;

    if(fs.existsSync(RASPBERRY_PATH))
    {
      var data = fs.readFileSync(RASPBERRY_PATH);
      try
      {
        data = JSON.parse(data);

        // Check if the ssid data has changed
        if(fs.existsSync(localConfig))
        {
          d = fs.readFileSync(localConfig);
          try
          {
            d = JSON.parse(d);
            console.log(data.ssid);
            console.log(d.ssid);
            console.log(data.psk);
            console.log(d.psk);
            if((data.ssid != d.ssid != '') || (data.psk != d.psk))
            {
              console.log("differet");
              resetWIFI = true;
            }
          }
          catch(e)
          {
            log.putError('not json');
          }
          fs.unlinkSync(localConfig);
        }
        fs.writeFileSync(localConfig, data);
      }
      catch(e)
      {
        log.putError('not json');
      }
    }
    else if(!fs.existsSync(localConfig))
    {
      log.putError('no configuration file');
    }

    // Resets wifi if data has changed
    if(resetWIFI)
    {
      setTimeout(wifi(d),5000);
    }
  }

  function wifi(d)
  {
    if(d != null)
    {
      try
      {
        var wifiData = fs.readFileSync(path.join(__dirname, 'conf',
          d.gadget,'/wireless/wireless_form.conf'));
        var fileWifi = ejs.render(wifiData.toString(), 
          {ssid:d.ssid, scan_ssid:d.scan_ssid, psk:d.psk});
        try
        {
          fs.writeFileSync(path.join(__dirname, 'libs/wireless/wireless.conf'), fileWifi);
          child_process.exec('sudo ifdown wlan0; sudo ifup wlan0', function (error, stdout, stderr)
          {
            if (error!=0) 
            {
              log.putError ('error wireless '+stderr);
            }
          });
        }
        catch(e)
        {
          log.putError('cannot write wifi file '+e);
        }
      }
      catch(e)
      {
        log.putError('cannot read wifi file '+e);
      }
    }   
  }
}

findConfigFile(RASPBERRY);
