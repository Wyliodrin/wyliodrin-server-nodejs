"use strict"
var fs = require('fs');
var path = require('path');
var CONFIG_FILE =path.join(__dirname, 'wyliodrin.json');
var E_NO_CONF = -1;
var loadModules = null;
var data_wyliodrin = null;

function loadConfig()
{
	var file_data_wyliodrin = null;
	var XMPP = require('./xmpp_library');
	var xmpp = XMPP.xmpp;
	var log = require('./log');
	try
	{
		file_data_wyliodrin = fs.readFileSync('./wyliodrin.json');
		data_wyliodrin = JSON.parse(file_data_wyliodrin);
		loadModules = {config:data_wyliodrin,
						XMPP:XMPP,
						xmpp:xmpp,
						log:log
						};
	}
	catch(e)
	{
		log.putError('cannot read local config file '+e);
	}
}

function load()
{	
	console.log('load function');
		var xmpp_temp = require('./xmpp_library.js');
		console.log('required');
		var modulesDict = {	config:data_wyliodrin,
						terminal:require('./terminal'),
						wxmpp:wxmpp,
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
						log:log,
						fuse:fuse
					   };
					   console.log('loaded');
		wxmpp.load(modulesDict);			   
	
		modulesDict.terminal.load(modulesDict);
		modulesDict.build_xmpp.load(modulesDict);
		modulesDict.files_xmpp.load(modulesDict);
		modulesDict.files.load(modulesDict);
		modulesDict.terminal_xmpp.load(modulesDict);
		modulesDict.build.load(modulesDict);
		modulesDict.signal.load(modulesDict);

		modulesDict.build.loadConfig(data_wyliodrin);
		modulesDict.terminal_xmpp.loadConfig(data_wyliodrin);
		modulesDict.signal_xmpp.load(modulesDict);
		modulesDict.info.load(modulesDict);
		
		wxmpp.load(modulesDict);
		wxmpp.loadSettings();
		//modulesDict.files.main();
		modulesDict.signal.startSocketServer();
}

var wificonfig = require('./wificonfig.js');
var wxmpp = require('./wxmpp');
var fuse = require('./fuse');
var log = require('./log');

wificonfig.init();
var rc;
setTimeout(function(){
	console.log('entered function');
	loadConfig();
	wxmpp.initConnection(loadModules);
	setTimeout(function()
		{fuse.init(loadModules, wxmpp);
			setTimeout(load(),1000);},1000);
		
}, 30000);

	
