"use strict";
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var ejs = require ('ejs');

var RASPBERRY = 'raspberry';
var GALILEO = 'galileo';
var RASPBERRY_PATH = '/boot/wyliodrin.json';
var RASPBERRY_CONFIG_FILE = path.join(__dirname,'conf/wyliodrin.json');
var RETRY_TIME = 2000;

var WIFICONF = path.join(__dirname, 'conf/wireless/wireless.conf');

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
				if(fs.existsSync(RASPBERRY_CONFIG_FILE))
				{
					d = fs.readFileSync(RASPBERRY_CONFIG_FILE);
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
						resetWIFI = true;
						log.putError('local config not json');
					}
				}
				else
				{
					resetWIFI = true;
				}
				if(fs.existsSync(RASPBERRY_CONFIG_FILE))
					fs.unlinkSync(RASPBERRY_CONFIG_FILE);
				try
				{
					fs.writeFileSync(RASPBERRY_CONFIG_FILE, data);
				}
				catch(e)
				{
					log.putError('Cannot copy config file'+e);
				}
			}
			catch(e)
			{
				log.putError('Config file not json');
			}
		}
		else if(!fs.existsSync(RASPBERRY_CONFIG_FILE))
		{
			log.putError('No configuration file');
		}
		/* resets wifi if data has changed */
		var wifiNewData = getConfigData();
		if(wifiNewData != null)
		{
			if(!resetWIFI)
			{
				if(!fs.existsSync(WIFICONF))
					wifi(wifiNewData);
			}
			else
			{
				wifi(wifiNewData);
			}
		}		
	}
}

function getConfigData()
{
	try
	{
		var d = fs.readFileSync(RASPBERRY_CONFIG_FILE);
		d = JSON.parse(d);
		return d;
	}
	catch(e)
	return null;
}

function wifi(d)
	{
		if(d != null)
		{
			var WIFIFORM = path.join(__dirname,'conf',d.gadget,'/wireless/wireless_form.conf');
			try
			{
				var wifiData = fs.readFileSync(WIFIFORM);
				var fileWifi = ejs.render (wifiData.toString(), {ssid:d.ssid, scan_ssid:d.scan_ssid, psk:d.psk});
				try
				{
					fs.writeFileSync(WIFICONF, fileWifi);
					child_process.exec ('sudo ifdown wlan0; sudo ifup wlan0', function (error, stdout, stderr)
					{
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
															log.putError('Wifi error' +stderr);	
														}
													})}, 2*RETRY_TIME);
											}
										})}, RETRY_TIME);							
						}
					});
				}
				catch(e)
				{
					log.putError('Cannot write wifi file '+e);
				}
			}
			catch(e)
			{
				log.putError('Cannot read wifi file '+e);
			}
		}		
	}

exports.init = init;