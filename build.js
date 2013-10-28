
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

function make(id, command, args, sendOutput)
{
	console.log('make');
	validatePath(id, function(path,id)
	{
		if(path)
		{
			child_process.exec('rm -rf '+path, {maxBuffer:10*1024, cwd:buildFile},
				function(error, stdout, stderr){
					child_process.exec('cp -rfv '+mountPath+'/'+id+' '+buildFile+' && chmod -R u+w '+buildFile, {maxBuffer: 30*1024, cwd:buildFile}, 
					function(error, stdout, stderr){
						console.log('copy error = '+error+' '+stderr);
						if(!error)
						{
							console.log('copied successfully');
							var makeProcess = child_process.spawn(command,args,{cwd:path});
							makeProcess.stdout.on('data', function(data){
								var out = new Buffer(data).toString('base64');
								sendOutput(out, 'stdout', null);
							});
							makeProcess.stderr.on('data', function(data){
								var err = new Buffer(data).toString('base64');
								sendOutput(err, 'stderr', null);
							});
							makeProcess.on('close', function(code){
								sendOutput(null, null, code);
							});
						}
					});	
				});							
		}
		else
		{
			sendOutput("Invalid path", "system",null);
		}
	});
}
exports.make = make;
exports.load = load;
exports.loadConfig = loadConfig;
