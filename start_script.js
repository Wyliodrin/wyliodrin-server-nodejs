var fs = require('fs');
var CONFIG_FILE ='wyliodrin.json';

var d;
var modulesDict;
var _ = require('underscore');
function load()
{
	var file_data = fs.readFileSync(CONFIG_FILE);
	d = JSON.parse(file_data);
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

}

load();
modulesDict.wxmpp.connect();
modulesDict.files.main();
modulesDict.signal.startSocketServer();


exports.config = d;
exports.modules = modulesDict;
