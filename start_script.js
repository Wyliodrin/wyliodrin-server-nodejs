var fs = require('fs');
var CONFIG_FILE ='/boot/wyliodrin.json';

var d;
var modulesDict;
var _ = require('underscore');
function load()
{
	var file_data = fs.readFileSync(CONFIG_FILE);
	d = JSON.parse(file_data);
	modulesDict = {	terminal:require('./terminal'),
							wxmpp:require('./xmpp'),
							build_xmpp:require('./build-xmpp'),
							files_xmpp:require('./files-xmpp'),
							files:require('./xmpp'),
							terminal_xmpp:require('./terminal-xmpp'),
							xmpp:require('./xmpp_library.js').xmpp
						};

	_.each(modulesDict, function(module){
		module.load(modulesDict);
	});

}


exports.config = d;
exports.modules = modulesDict;