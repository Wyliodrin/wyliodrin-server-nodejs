var fs = require('fs');
var CONFIG_FILE ='/boot/wyliodrin.json';

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
							build:require('./build')
						};

	modulesDict.terminal.load(modulesDict);
	modulesDict.wxmpp.load(modulesDict);
	modulesDict.build_xmpp.load(modulesDict);
	modulesDict.files_xmpp.load(modulesDict);
	modulesDict.files.load(modulesDict);
	modulesDict.terminal_xmpp.load(modulesDict);
	// xmpp_temp.load(modulesDict);
	modulesDict.files_xmpp.loadConfig(d);
	modulesDict.build.loadConfig(d);
	modulesDict.terminal_xmpp.loadConfig(d);
	modulesDict.files.loadConfig(d);

	console.log('loaded');

}

load();
modulesDict.wxmpp.connect();
modulesDict.files.main();
// t = modulesDict.terminal.allocTerminal();
// modulesDict.terminal.startTerminal(t.id, '/usr/bin/vim', 30, 10, function (data)
// 				{
// 					console.log('term data'+data);
// 				});
// setTimeout(function(){
// 	modulesDict.build.make("4634cf49-e469-4d18-95c0-e86bf753fb3c" ,'make build', function(a,b,c,d){
// 	console.log('make '+a);
// });
// }, 5000);



exports.config = d;
exports.modules = modulesDict;
