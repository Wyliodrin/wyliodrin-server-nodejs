var settings = require ('./conf/wyliodrin_settings.js');
var child_process = require ('child_process');
var fs = require ('fs');

var log = require ('./log.js');

var config = {config:null,
				networkConfig:null};

/* Function checks if the board is a raspberry pi. 
		Step one. */
function isRaspberry(functie)
{
	log.putLog ('Checking wether it is a Raspberry Pi');
	var child  = child_process.exec('cat /proc/cpuinfo | grep BCM',
		function(error, stdout, stderr)
		{
			if(error != null)
			{
				functie (null);
			}
			if(stdout != '')
			{
				functie ('raspberrypi');
			}
		});
}

/* Function checks if the board is a galileo. 
		Step one. */
function isGalileo(functie)
{
	log.putLog ('Checking wether it is an Intel Galileo');
	var child  = child_process.exec('cat /proc/cpuinfo | grep GenuineIntel',
		function(error, stdout, stderr)
		{
			if(error != null)
			{
				functie (null);
			}
			if(stdout != '')
			{
				functie ('arduinogalileo');
			}
		});
}

exports.load = function (start)
{
	var cont = function (board)
	{
		settings = settings[board];
		try
		{
			var file_data_wyliodrin = fs.readFileSync(settings.config_file);
			config.networkConfig = JSON.parse(file_data_wyliodrin);
			config.networkConfig.owner = config.networkConfig.owner.toLowerCase();
			config.config = settings;
		}
		catch(e)
		{
			console.log("No configuration file");
		}
		if (!config.config) setTimeout (function ()
		{
			process.exit (0);
		}, 10000);
		else
		{
			exports.config = config;
			start ();
		}
	};
	var board = null;
	try
	{
		log.putLog ('Reading board type from board.type');
		board = fs.readFileSync ('board.type', 'utf8');
		log.putLog ('Board is '+board);
	}
	catch (ex)
	{
		log.putLog('Board type not found, trying autodetect');
	}
	if (board)
	{
		cont (board);
	}
	else
	{
		isRaspberry (function (board)
		{
			if (board) cont (board);
			else
			{
				isGalileo (cont);
			}
		});	
	}
}

log.putLog ('Loading settings');

exports.config = config;
