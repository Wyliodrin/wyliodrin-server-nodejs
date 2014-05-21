"use strict";
var fs = require('fs');
var path = require('path');
var wificonfig = require('./wificonfig.js');
var log = require('./log');
var settings = require ('./conf/wyliodrin_settings.js');
var mkdirp = require ('mkdirp');

var E_NO_CONF = -1;
var loadModules = null;
var data_wyliodrin = null;
var modulesDict = null;

/*
* Start steps:
*	1. search /boot/wyliodrin.json file
*		if exists --> Step 2
* 		else search local wyliodrin.json file
*			if not exists --> ERROR
*			else --> Step 4
*
*  2. search local wyliodrin.json file
*		if exists compare /boot/wyliodrin.json file
*			if different restartWifi = true && --> Step 3
*			else --> Step 4
*		else restartWifi = true && --> Step 3
*  
*  3. replace local wyliodrin.json with /boot/wyliodrin.json --> Step 4
*  
*  4. restartWifi if true && --> Step 5
*
*  5. connect XMPP --> start fuse --> start socket 
*		
* 
*/

function load()
{	
	try
	{
		var file_data_wyliodrin = fs.readFileSync(settings.config_file);
		data_wyliodrin = JSON.parse(file_data_wyliodrin);
	}
	catch(e)
	{
		log.putError('cannot read local config file '+e);
	}
	var xmpp_temp = require('./xmpp_library.js');
	modulesDict = {	settings:settings,
					config:data_wyliodrin,
					terminal:require('./terminal'),
					wxmpp:require('./wxmpp'),
					build_xmpp:require('./build-xmpp'),
					files_xmpp:require('./files-xmpp'),
					files:require('./files'),
					terminal_xmpp:require('./terminal-xmpp'),							
					xmpp:xmpp_temp.xmpp,
					XMPP:xmpp_temp,
					build:require('./build'),
					signal_xmpp:require('./signal-xmpp'),
					signal:require('./signal'),
					info:require('./info'),
					log:require('./log'),
					fuse:require('./fuse')
				   };
	modulesDict.log.load (modulesDict);
	modulesDict.wxmpp.load(modulesDict);	   
	modulesDict.wxmpp.initConnection(modulesDict);
	modulesDict.wxmpp.loadSettings();
	modulesDict.files.load(modulesDict);
	modulesDict.fuse.init(modulesDict, function()
	{
		initRest();
	});
}

function initRest()
{
		modulesDict.terminal.load(modulesDict);
		modulesDict.build_xmpp.load(modulesDict);
		modulesDict.files_xmpp.load(modulesDict);
		modulesDict.terminal_xmpp.load(modulesDict);
		modulesDict.build.load(modulesDict);
		modulesDict.signal.load(modulesDict);
		modulesDict.build.loadConfig(data_wyliodrin);
		modulesDict.terminal_xmpp.loadConfig(data_wyliodrin);
		modulesDict.signal_xmpp.load(modulesDict);
		modulesDict.info.load(modulesDict);
		//modulesDict.files.main();
		modulesDict.signal.startSocketServer();
}

wificonfig.init(settings, function(s)
	{
		settings = s;
		log.putLog ('Creating home directory in '+settings.home);
		mkdirp.sync (settings.home);
		load();
	});
