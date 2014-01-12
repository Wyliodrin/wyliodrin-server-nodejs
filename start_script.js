var fs = require('fs');
var CONFIG_FILE ='/boot/wyliodrin.json';
var sys = require ('child_process');
var ejs = require ('ejs');

var d;
var modulesDict;
var _ = require('underscore');

function wireless (ssid, scan_ssid, psk, wlanrestart)
{
	fs.readFile ('libs/'+d.gadget+'/wireless/wireless_form.conf', function (err, filewifiform)
	{
		if (err) console.log ('error wireless '+err);
		else
		{
			console.log (filewifiform.toString());
			filewifi = ejs.render (filewifiform.toString(), {ssid:d.ssid, scan_ssid:d.scan_ssid, psk:d.psk});
			fs.writeFile ('libs/wireless/wireless.conf', filewifi, function (err)
			{
				if (err) console.log ('error wireless '+err);
				if (wlanrestart) sys.exec ('sudo ifdown wlan0; sudo ifup wlan0', function (error, stdout, stderr)
				{
					if (error!=0) console.log ('error wireless '+stderr);
				});
			});
		}
	});


}

function load()
{
	var file_data = null;
	var file_data_boot = null;
	var file_data_wyliodrin = null;
	
	try
	{
		file_data_wyliodrin = fs.readFileSync('./wyliodrin.json');
	}
	catch (ex2)
	{
		
	}

	

	try
	{
		file_data_boot = fs.readFileSync(CONFIG_FILE);
		if (file_data_boot!=null)
		{
			fs.writeFileSync ('./wyliodrin.json', file_data_boot);
		}
	}
	catch (ex)
	{
	}

	var newsettings = true;
	if (file_data_boot!=null && file_data_wyliodrin!=null) newsettings = file_data_boot.toString()!=file_data_wyliodrin.toString();

	console.log ('new settings '+newsettings);

	if (file_data_boot) file_data = file_data_boot;
	else file_data = file_data_wyliodrin;

	if (file_data!=null)
	{
		d = JSON.parse(file_data);
		if (newsettings && d.ssid && d.ssid!='')
		{
			wireless (d.ssid, d.scan_ssid, d.psk, true);
		}
		var xmpp_temp = require('./xmpp_library.js');
		modulesDict = {	config:d, terminal:require('./terminal'),
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
								info:require('./info')
							};
	
		modulesDict.terminal.load(modulesDict);
		modulesDict.wxmpp.load(modulesDict);
		modulesDict.build_xmpp.load(modulesDict);
		modulesDict.files_xmpp.load(modulesDict);
		modulesDict.files.load(modulesDict);
		modulesDict.terminal_xmpp.load(modulesDict);
		modulesDict.build.load(modulesDict);
		modulesDict.signal.load(modulesDict);
		//xmpp_temp.load(modulesDict);
		modulesDict.files_xmpp.loadConfig(d);
		modulesDict.build.loadConfig(d);
		modulesDict.terminal_xmpp.loadConfig(d);
		modulesDict.files.loadConfig(d);
		modulesDict.signal_xmpp.load(modulesDict);
		modulesDict.info.load(modulesDict);
	
		console.log('loaded');
		
		modulesDict.wxmpp.connect();
		modulesDict.files.main();
		modulesDict.signal.startSocketServer();
	}
	else
	{
		console.log ('cannot load wyliodrin.json');
		setTimeout (function ()
		{
			console.log ('exiting');
		}, 50000);
	}
}

load();


exports.config = d;
exports.modules = modulesDict;
