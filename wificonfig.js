"use strict";
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var ejs = require ('ejs');
var set = require('./settings').config;
//log.putLog("settings = "+JSON.stringify(set,null,2));
var config = set.config;
var networkConfig = set.networkConfig;

var log = require ('./log.js');

var WIFICONF = './conf/wireless/wireless.conf';

var RASPBERRY = 'raspberry';
var ARDUINO_GALILEO = 'arduinogalileo';

var RETRY_TIME = 2000;

function init(funct)
{
	findConfigFile(funct);
}

function findSSID (done)
{
	child_process.exec ('iwgetid -r', function (error, stdout, stderr)
	{
		if (!error)
		{
			done (stdout.replace (/\n$/, ''));
		}
		else
		{
			done (null);
		}
	});
}

/* Function searches for config file depending on the platform.  
	Step two. */
function findConfigFile(funct)
{
	var resetWIFI = false;		
	findSSID (function (ssid)
	{
		if(networkConfig.ssid != '' && ssid!=networkConfig.ssid)
		{
			resetWIFI = true;
		}

		//log.putLog ('Starting');
		//log.putLog('Starting');
		/* resets wifi if data has changed */
		if(resetWIFI)
		{
			// if(!fs.existsSync(WIFICONF))
			// 	wifi(newJsonData, functie);
			// else 
			wifi(funct);
		}
		else
			funct();
	});
}

function wifi(functie)
{
	log.putLog ('Setting up WiFi');
	if (config.board == 'arduinogalileo')
	{
		log.putLog ('Running ./conf/arduinogalileo_wifi.sh');
		child_process.exec ('./conf/arduinogalileo_wifi.sh "'+networkConfig.ssid+'" "'+networkConfig.psk+'"', function (error, stdout, stderr)
		{
			log.putLog ('Setting up wifi');
			log.putLog (stdout);
			setTimeout (function ()
			{
				functie ();
			}, 5000);
		});
	}
	else if (config.board == 'edison')
	{
		log.putLog ('Running ./conf/arduinogalileo_wifi.sh');
		child_process.exec ('rm -rf /var/log/journal/*');
		var type = 'OPEN';
		if (networkConfig.psk && networkConfig.psk.length > 0)
		{
			type = 'WPA-PSK';
		}
		log.putLog ('Running configure-edison --changeWiFi '+type);
		child_process.exec ('configure-edison --changeWiFi '+type+' "'+networkConfig.ssid+'" "'+networkConfig.psk+'"', function (error, stdout, stderr)
		{
			log.putLog ('Setting up wifi');
			log.putLog (stdout);
			log.putLog (stderr);
			setTimeout (function ()
			{
				functie ();
			}, 10000);
		});
	}
	else
	{
		var FORM = 'wireless_form.conf';
		if (networkConfig.psk.length==0) FORM = 'wireless-open_form.conf';
	var WIFIFORM = path.join(__dirname,'conf',config.board,'/wireless/'+FORM);
	if (!fs.existsSync(WIFIFORM)) 
	{
		//log.putLog('Board specific WiFi Form not found, using default');
		log.putLog ('Board specific WiFi Form not found, using default');
		WIFIFORM = path.join(__dirname,'conf/wireless/'+FORM);
	}
	try
	{
		var wifiData = fs.readFileSync(WIFIFORM);
		//log.putLog("wifidata = "+networkConfig.ssid);
		var fileWifi = ejs.render (wifiData.toString(), {ssid:networkConfig.ssid,
							scan_ssid:networkConfig.scan_ssid, psk:networkConfig.psk});
		try
		{
			fs.writeFileSync(WIFICONF, fileWifi);
			child_process.exec ('sudo ifdown wlan0; sudo ifup wlan0', function (error, stdout, stderr)
			{
				if (error!=null) 
				{
					log.putLog("Error resetting Wifi, retrying "+stderr);
					/* retry after RETY_TIME miliseconds */
					setTimeout(function(){child_process.exec ('sudo ifdown wlan0; sudo ifup wlan0', function (error, stdout, stderr)
								{
									if (error!=null) 
									{
										/* retry after 2*RETRY_TIME miliseconds */
						
										setTimeout(function(){child_process.exec ('sudo ifdown wlan0; sudo ifup wlan0', function (error, stdout, stderr)
											{
												if (error!=null) 
												{
													log.putError('Wifi error' +stderr);	
												}
												else
												{
													functie();
												}
											})}, 2*RETRY_TIME);
									}
									else
									{
										functie();
									}
								})}, RETRY_TIME);							
				}
				else
				{
					functie();
				}
			});
		}
		catch(e)
		{
			//log.putError('Cannot write wifi file '+e);
			functie (settings);
		}
	}
	catch(e)
	{
		//log.putError('Cannot read wifi file '+e);
		 functie ();
	}
	}	
}
exports.init = init;
