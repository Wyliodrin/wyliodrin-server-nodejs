
path = require('path');
fs = require('fs');
child_process = require('child_process');

PATH_ERROR = 1;
PATH_OK = 0;

var mountPath = null;
var buildFile = null;

function loadConfig(configs)
{
	buildFile = configs.buildFile;
	mountPath = configs.mountFile;
	console.log(buildFile);
}

function load(modules)
{

}

function validatePath(id, returnPath)
{
	if(id.indexOf('/') == -1)
		validPath = path.join(buildFile, id)
	else
		validPath = null;
	returnPath(validPath,id);
} 

function make(id, command, sendOutput)
{
	console.log('make');
	validatePath(id, function(path,id)
	{
		if(path)
		{
			child_process.exec('rm -r '+path, {maxBuffer:10*1024, cwd:buildFile},
				function(error, stdout, stderr){
					child_process.exec('cp -rv '+mountPath+'/'+id+' '+buildFile, {maxBuffer: 30*1024, cwd:buildFile}, 
					function(error, stdout, stderr){
						console.log('copy error = '+error+' '+stderr);

						if(!error)
						{
							console.log('copied successfully');
							child_process.exec(command, {maxBuffer: 200*1024,cwd: path},
							function (error, stdout, stderr) {
								var out = new Buffer(stdout).toString('base64');
								var err = new Buffer(stderr).toString('base64');
								sendOutput(out,"stdout", null, null);
								sendOutput(err, "stderr", null, null);   
								if (!error) {
								  	sendOutput(null, "system", error.code, error.signal);
								}});
						}
					});	
				});							
		}
		else
		{
			sendOutput("Invalid path", "system",null,null);
		}
	});
}
exports.make = make;
exports.load = load;
exports.loadConfig = loadConfig;
