var settings = require ('./conf/wyliodrin_settings.js');
var child_process = require ('child_process');
var fs = require ('fs');

var config = {config:null,
				networkConfig:null};

/* Function checks if the board is a raspberry pi. 
		Step one. */
function isRaspberry(functie)
{
	console.log('Is it a Raspberry Pi?');
	var child  = child_process.exec('cat /proc/cpuinfo | grep BCM',
		function(error, stdout, stderr)
		{
			if(error != null)
			{
				console.log('\t not Raspberry Pi');
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
	console.log('Is it an Arduino Galileo?');
	var child  = child_process.exec('cat /proc/cpuinfo | grep GenuineIntel',
		function(error, stdout, stderr)
		{
			if(error != null)
			{
				console.log('\t not Arduino Galileo');
				functie (null);
			}
			if(stdout != '')
			{
				console.log('functie');
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
			console.log('cannot read local config file '+e);
		}
		if (!config.config) setTimeout (function ()
		{
			console.log ('no config file');
			process.exit (0);
		}, 10000);
		else
		{
			console.log('exports conf');
			exports.config = config;
			start ();
		}
	};

	console.log('Starting Wyliodrin');
	var board = null;
	try
	{
		board = fs.readFileSync ('board.type', 'utf8');
	}
	catch (ex)
	{
		// console.log (ex);
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