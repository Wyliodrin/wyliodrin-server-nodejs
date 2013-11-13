
path = require('path');
fs = require('fs');
child_process = require('child_process');

PATH_ERROR = 1;
COPY_ERROR = 2;
WGET_ERROR = 3;
PATH_OK = 0;

var mountPath = null;
var buildFile = null;
var files = null;
var gadget = null;
var signalTimeout = null;
var port = null;

var processArray = [];

function loadConfig(configs)
{
	buildFile = configs.buildFile;
	mountPath = configs.mountFile;
	console.log(buildFile);
	gadget = configs.gadget;
	port = configs.port;
	try
	{
		signalTimeout = parseInt(configs.timeout);
	}
	catch(e)	
}

function load(modules)
{
	console.log('load files');
	files = modules.files;
	console.log('files = '+files);
}

function validatePath(id, returnPath)
{
	if(id.indexOf('/') == -1)
		validPath = path.join(buildFile, id)
	else
		validPath = null;
	returnPath(validPath,id);
} 

function startBuildProcess(command, args, path, sendOutput, done, id)
{
	var makeProcess = child_process.spawn(command,args,{cwd:path, env:{id:id, port:port}});
	processArray[id] = makeProcess;
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
		processArray[id] = null;
	});
	// done();
}

function make(id, command, args, address, sendOutput)
{
	console.log('make');
	validatePath(id, function(buildPath,id)
	{
		if(buildPath)
		{
			child_process.exec('rm -rf '+buildPath, {maxBuffer:10*1024, cwd:buildFile},
				function(error, stdout, stderr){
					if(files.canMount())
					{
						child_process.exec('cp -rfv '+mountPath+'/'+id+' '+buildFile+' && chmod -R u+w '+buildFile, {maxBuffer: 30*1024, cwd:buildFile}, 
						function(error, stdout, stderr){	
							console.log ('ln -s Makefile.'+gadget+' Makefile '+buildPath+'/'+id);
							child_process.exec ('ln -s Makefile.'+gadget+' Makefile', {cwd: buildPath}, function (err, stdout, stderr)
							{
								if (!error)
								{
									startBuildProcess(command,args,buildPath,sendOutput, id);
								}
								else
								{
									console.log ('ln error: '+error);
									sendOutput ("ln error", "system", error.code);
								}
							});
					
							/*if(!error)
							{
								startBuildProcess(command, args, buildPath, sendOutput);
							}
							else
							{
								sendOutput("Copy error", "system", error.code);
							}*/
						});
					}
					else
					{
						console.log('address = '+address);
						child_process.exec('wget '+address, {maxBuffer:30*1024, cwd:buildFile},function(error,stdout,stderr){
							if(!error)
							{
								console.log("fisier = "+path.basename(address));
								child_process.exec('tar xf '+path.basename(address), {maxBuffer:30*1024, cwd:buildFile},
									function(error, stdout, stderr){
										child_process.exec('rm -rf '+path.basename(address), {maxBuffer:30*1024, cwd:buildFile},
											function(error,stdout,stderr){

											});
										if(!error)
										{
											child_process.exec ('ln -s Makefile.'+gadget+' Makefile', {cwd: buildPath}, function (err, stdout, stderr)
											{
												if (!error)
												{
													startBuildProcess(command,args,buildPath,sendOutput, id);
												}
												else
												{
													sendOutput ("ln error", "system", error.code);
												}
											});
										}
										else
											sendOutput("tar error", "system", error.code);
									});

							}
							else
							{
								sendOutput("Wget error", "system", error.code);
							}
						});
					}
			});						
		}
		else
		{
			sendOutput("Invalid path", "system",PATH_ERROR);
		}
	});
}

function killProcess(id)
{
	var process = processArray[id];
	if(process)
	{
		process.kill(process.pid, 'SIGTERM');
		setTimeout(function(){
			if(processArray[id])
				processArray[id].kill(processArray[id].pid, 'SIGKILL');
		},signalTimeout);
	}
}

exports.make = make;
exports.load = load;
exports.loadConfig = loadConfig;
