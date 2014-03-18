"use strict";
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var ejs = require ('ejs');
var log = require('./log');

var RASPBERRY = 'raspberry';
var GALILEO = 'galileo';
var RASPBERRY_PATH = '/boot/wyliodrin.json';
var RASPBERRY_CONFIG_FILE = 'wyliodrin.json';
var RASPBERRY_WIFI_FILE = 'conf/wireless/wireless.conf';
var RETRY_TIME = 2000;

var localConfig = path.join(__dirname, RASPBERRY_CONFIG_FILE);
var wifi = false;

function init()
{
	console.log('init');
	isRaspberry();
	isGalileo();
}

/* Function checks if the board is a raspberry pi. 
		Step one. */
function isRaspberry()
{
	var child  = child_process.exec('cat /proc/cpuinfo | grep BCM',
		function(error, stdout, stderr)
		{
			if(error != null)
				log.putError('exec error');
			if(stdout != '')
			{
				findConfigFile(RASPBERRY);
			}
		});
}

/* Function checks if the board is a galileo. 
		Step one. */
function isGalileo()
{
	//TODO
}

/* Function searches for config file depending on the platform.  
	Step two. */
function findConfigFile(platform)
{
	if(platform == RASPBERRY)
	{	var d = null;
		var resetWIFI = false;
		if(fs.existsSync(RASPBERRY_PATH))
		{
			var data = fs.readFileSync(RASPBERRY_PATH);
			try
			{
				var newJsonData = JSON.parse(data);
				/* checks if the ssid data has changed */
				if(fs.existsSync(localConfig))
				{
					d = fs.readFileSync(localConfig);
					try
					{
						d = JSON.parse(d);
						if((newJsonData.ssid != d.ssid != '') || (newJsonData.psk != d.psk))
						{
							resetWIFI = true;
						}
					}
					catch(e)
					{
						log.putError('local config not json');
					}
				}
				else
				{
					resetWIFI = true;
				}
				fs.unlinkSync(localConfig);
				fs.writeFileSync(localConfig, data);
				console.log('wyliodrin.json file copied');
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
		/* resets wifi if data has changed */
		if(resetWIFI)
		{
			wifi(newJsonData);
		}
	}

	function wifi(d)
	{
		console.log('reset wifi');
		if(d != null)
		{
			try
			{
				var wifiData = fs.readFileSync(path.join(__dirname,'libs',d.gadget,'/wireless/wireless_form.conf'));
				var fileWifi = ejs.render (wifiData.toString(), {ssid:d.ssid, scan_ssid:d.scan_ssid, psk:d.psk});
				try
				{
					console.log('restarting wifi');
					fs.writeFileSync(path.join(__dirname, 'conf/wireless/wireless.conf'), fileWifi);
					child_process.exec ('sudo ifdown wlan0; sudo ifup wlan0', function (error, stdout, stderr)
					{
						//console.log("wifi err "+error);
						if (error!=null) 
						{
							console.log("retry "+stderr);
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
															log.putError('wifi error' +stderr);	
														}
													})}, 2*RETRY_TIME);
											}
										})}, RETRY_TIME);							
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

exports.init = init;