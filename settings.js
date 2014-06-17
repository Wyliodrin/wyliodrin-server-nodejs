var settings = require ('./conf/wyliodrin_settings.js');
var child_process = require ('child_process');
var fs = require ('fs');
var log = require('log');

var config = {config:null,
				networkConfig:null};

/* Function checks if the board is a raspberry pi. 
		Step one. */
function isRaspberry(functie)
{
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
			config.config = settings;
		}
		catch(e)
		{
			log.putError("No configuration file");
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
		board = fs.readFileSync ('board.type', 'utf8');
	}
	catch (ex)
	{
		log.putError(ex);
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

exports.config = config;