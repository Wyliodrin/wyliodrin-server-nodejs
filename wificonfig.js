"use strict";

var child_process = require('child_process');

var fs   = require('fs');
var path = require('path');
var ejs  = require ('ejs');
var log  = require ('./log');

var settings;

var RASPBERRY       = 'raspberry';
var ARDUINO_GALILEO = 'arduinogalileo';
var GALILEO         = 'galileo';

var RETRY_TIME = 2000;

var WIFICONF = path.join(__dirname, 'conf/wireless/wireless.conf');

function init(s, functie)
{
  settings = s;
  console.log('Starting Wyliodrin');
  isRaspberry(functie);
  isGalileo(functie);
}

/**
 * Check if the board is a raspberry pi.
 */
function isRaspberry(functie)
{
  console.log('Is it a Raspberry Pi?');
  var child  = child_process.exec('cat /proc/cpuinfo | grep BCM',
    function(error, stdout, stderr)
    {
      if(error != null)
      {
        log.putError('\t not Raspberry Pi');
      }
      if(stdout != '')
      {
        findConfigFile(RASPBERRY, functie);
      }
    });
}

/**
 * Check if the board is a galileo. 
 */
function isGalileo(functie)
{
  console.log('Is it an Arduino Galileo?');
  var child  = child_process.exec('cat /proc/cpuinfo | grep GenuineIntel',
    function(error, stdout, stderr)
    {
      if(error != null)
      {
        log.putError('\t not Arduino Galileo');
      }
      if(stdout != '')
      {
        findConfigFile(ARDUINO_GALILEO,functie);
      }
    });
}

function findSSID(done)
{
  child_process.exec('iwgetid -r', 
    function (error, stdout, stderr)
    {
      if (!error)
      {
        done (stdout);
      }
      else
      {
        done (null);
      }
    });
}

/**
 * Search for config file depending on the platform.  
 */
function findConfigFile(platform, functie)
{
  log.putLog ('Board is '+platform);
  log.putLog('Reading config file');
  settings = settings[platform];
  var JSON_PATH = settings.config_file;
  var d = null;
  var resetWIFI = false;
  var start = true;
  if(fs.existsSync(JSON_PATH))
  {
    var data = fs.readFileSync(JSON_PATH);
    try
    {
      var newJsonData = JSON.parse(data);
      findSSID(
        function (ssid)
        {
          if(newJsonData.ssid != '' && ssid!=newJsonData)
          {
            resetWIFI = true;
          }

          log.putLog ('Starting');

          // Reset wifi if data has changed
          if(!resetWIFI)
          {
            functie(settings);
          }
          else
          {
            wifi(newJsonData, functie);
          }
        });
    }
    catch(e)
    {
      log.putError('Cannot load config file');
      start = false;
    }
  }
  else
  {
    start = false;
  }
  if (!start)
  {
    log.putLog ('Not starting, waiting to exit');
    setTimeout (
      function ()
      {
        process.exit (0);
      }, 600000);
  }
}

function wifi(d, functie)
{
  console.log('wifi');
  if(d != null)
  {
    var WIFIFORM = path.join(__dirname, 'conf', d.gadget, '/wireless/wireless_form.conf');
    if (!fs.existsSync(WIFIFORM)) 
    {
      log.putLog('Board specific WiFi Form not found, using default');
      WIFIFORM = path.join(__dirname,'conf/wireless/wireless_form.conf');
    }
    try
    {
      var wifiData = fs.readFileSync(WIFIFORM);
      var fileWifi = ejs.render (wifiData.toString(), 
        {ssid:d.ssid, scan_ssid:d.scan_ssid, psk:d.psk});
      try
      {
        fs.writeFileSync(WIFICONF, fileWifi);
        child_process.exec('sudo ifdown wlan0; sudo ifup wlan0', 
          function (error, stdout, stderr)
          {
            if (error != null) 
            {
              console.log("Error resetting Wifi, retrying "+stderr);
              // Retry after RETRY_TIME miliseconds 
              setTimeout(
                function()
                {
                  child_process.exec ('sudo ifdown wlan0; sudo ifup wlan0', 
                    function(error, stdout, stderr)
                    {
                      if (error!=null) 
                      {
                        // Retry after 2*RETRY_TIME miliseconds
                        setTimeout(
                          function()
                          {
                            child_process.exec('sudo ifdown wlan0; sudo ifup wlan0', 
                            function(error, stdout, stderr)
                            {
                              if (error!=null) 
                              {
                                log.putError('Wifi error' +stderr); 
                              }
                              else
                              {
                                functie(settings);
                              }
                            })
                          }, 2 * RETRY_TIME);
                      }
                      else
                      {
                        functie(settings);
                      }
                    })
                }, RETRY_TIME);             
            }
            else
            {
              functie(settings);
            }
          });
      }
      catch(e)
      {
        log.putError('Cannot write wifi file '+e);
        functie (settings);
      }
    }
    catch(e)
    {
      log.putError('Cannot read wifi file '+e);
      functie (settings);
    }
  }
  else
  {
    log.putError ('No cofiguration file');
  }   
}

exports.init = init;
