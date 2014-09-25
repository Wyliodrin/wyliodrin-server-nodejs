"use strict";
var fs = require('fs');
var path = require('path');
var E_NO_CONF = -1;
var settings = require('./settings');
var child_process = require('child_process');
var log = require ('./log.js');
log.putLog ('Running Wyliodrin');
settings.load (start);
var config;
var networkConfig;

function start2()
{
	var wifi = require('./wificonfig');
	wifi.init(function(){
		if (!networkConfig.privacy)
		{
			log.load ();
		}
		if (networkConfig.nameserver && networkConfig.nameserver.length > 0)
		{
			log.putLog ('Setting nameserver to '+networkConfig.nameserver);
			fs.writeFileSync ("/etc/resolv.conf", "nameserver "+networkConfig.nameserver);
		}
		var wxmpp = require('./wxmpp');
		log.putLog ('Starting XMPP');
		wxmpp.initConnection();
		log.putLog ('Starting fuse');
		var fuse = require('./fuse');
		fuse.init();
		log.putLog ('Starting signals');
		var signal = require('./signal');
		signal.connectRedis();
		var signal_http = require('./signal_http');
		log.putLog ('Starting signals web');
		signal_http.load();
		var info = require('./info');
		info.load();
		//signal_http.sendSignal("skf");
	});
}


function start ()
{
	config = settings.config.config;
	networkConfig = settings.config.networkConfig;
	if(networkConfig.setdate && networkConfig.timezone)
	{
		log.putLog ('Date setup requested');
		child_process.exec(config.sudo+' date -s "$(curl -s --head http://google.com | grep ^Date: | sed \'s/Date: //g\')"',
			function(err, stdout, stderr){
				child_process.exec(config.sudo+' ln -sf /usr/share/zoneinfo/'+networkConfig.timezone+' /etc/localtime',
					function(err, stdout, stderr){
						start2();
					});				
			});
	}
	else
	{
		start2();
	}
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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
*  5. connect XMPP --> start fuse --> connect to redis
*		
* 
*/

// function load()
// {	
// 	try
// 	{
// 		var file_data_wyliodrin = fs.readFileSync(settings.config_file);
// 		data_wyliodrin = JSON.parse(file_data_wyliodrin);
// 	}
// 	catch(e)
// 	{
// 		log.putError('cannot read local config file '+e);
// 	}
// 	var xmpp_temp = require('./xmpp_library.js');
// 	modulesDict = {	settings:settings,
// 					config:data_wyliodrin,
// 					terminal:require('./terminal'),
// 					wxmpp:require('./wxmpp'),
// 					build_xmpp:require('./build-xmpp'),
// 					files_xmpp:require('./files-xmpp'),
// 					files:require('./files'),
// 					terminal_xmpp:require('./terminal-xmpp'),							
// 					xmpp:xmpp_temp.xmpp,
// 					XMPP:xmpp_temp,
// 					build:require('./build'),
// 					signal_xmpp:require('./signal-xmpp'),
// 					signal:require('./signal'),
// 					info:require('./info'),
// 					log:require('./log'),
// 					fuse:require('./fuse')
// 				   };
// 	modulesDict.log.load (modulesDict);
// 	modulesDict.wxmpp.load(modulesDict);	   
// 	modulesDict.wxmpp.initConnection(modulesDict);
// 	modulesDict.files.load(modulesDict);
// 	modulesDict.fuse.init(modulesDict, function()
// 	{
// 		initRest();
// 	});
// }

// function initRest()
// {
// 		modulesDict.terminal.load(modulesDict);
// 		modulesDict.build_xmpp.load(modulesDict);
// 		modulesDict.files_xmpp.load(modulesDict);
// 		modulesDict.terminal_xmpp.load(modulesDict);
// 		modulesDict.build.load(modulesDict);
// 		modulesDict.signal.load(modulesDict);
// 		modulesDict.build.loadConfig(data_wyliodrin);
// 		modulesDict.terminal_xmpp.loadConfig(data_wyliodrin);
// 		modulesDict.signal_xmpp.load(modulesDict);
// 		modulesDict.info.load(modulesDict);
// 		//modulesDict.files.main();
// 		//modulesDict.signal.startSocketServer();
// 		//TODO - inlocuit startSocket Server
// }

// settings = {	config_file: '/boot/wyliodrin.json',
// 		home: '/wyliodrin',
// 		mountFile: '/wyliodrin/projects/mount',
// 		buildFile: '/wyliodrin/projects/build',
// 		umount: 'sudo umount -f',
// 		run: ['sudo', '-E', 'make'],
// 		board:"raspberrypi"		}

// {
//   "jid": "alexandru.radovici_galileo@wyliodrin.org",
//   "password": "boyeraqowu",
//   "owner": "alexandru.radovici@wyliodrin.org",
//   "timeout": 2000,
//   "port": 8124,
//   "maxBuffer": 200,
//   "ssid": "",
//   "scan_ssid": 1,
//   "psk": ""
// }

// function load()
// {
// 	wxmpp.initConnection();
// 	fuse.init();
// 	require('./signal').connectRedis();
// }


/*wificonfig.init(settings, function(s)
	{
		settings.config = s;
		log.putLog ('Creating home directory in '+settings.home);
		mkdirp.sync (settings.home);
		load();
	});
*/
