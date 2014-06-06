"use strict";
var path = require('path');
var fs = require('fs');
var child_process = require('child_process');
var _ = require('underscore');
var mkdirp = require ('mkdirp');

var PATH_ERROR = 1;
var COPY_ERROR = 2;
var WGET_ERROR = 3;
var PATH_OK = 0;

var mountPath = null;
var buildFile = null;
var settings = null;
var files = null;
var gadget = null;
var signalTimeout = null;
var port = null;
var log = null;

var processArray = [];

function loadConfig(configs)
{
	console.log (settings);
	gadget = settings.platform;
	port = configs.port;
//	try
//	{
		signalTimeout = parseInt(configs.timeout);
//	}
//	catch(e)	
}

function load(modules)
{
	files = modules.files;
	log = modules.log;
	settings = modules.settings;
	console.log (settings);
	buildFile = settings.buildFile;
	mountPath = settings.mountFile;
	log.putLog ('Creating build directory in '+buildFile);
    mkdirp.sync (buildFile);
}

function validatePath(id, returnPath)
{
	var validPath;
	if(id.indexOf('/') == -1)
		validPath = path.join(buildFile, id)
	else
		validPath = null;
	returnPath(validPath,id);
} 

function startBuildProcess(command, args, path, sendOutput, done, id)
{
	var makeProcess = child_process.spawn(command,args,{cwd:path, env:_.extend(process.env,{wyliodrinid:id, wyliodrinport:port})});
	processArray[id] = makeProcess;
	makeProcess.stdout.on('data', function(data){
		// var out = new Buffer(data).toString('base64');
		sendOutput(data, 'stdout', null);
	});
	makeProcess.stderr.on('data', function(data){
		// var err = new Buffer(data).toString('base64');
		sendOutput(data, 'stderr', null);
	});
	makeProcess.on('close', function(code){
		sendOutput(null, null, code);
		processArray[id] = null;
	});
	// done();
} 

function make(id, command, args, address, sendOutput)
{
	validatePath(id, function(buildPath,id)
	{
		if(buildPath)
		if(true)
		{
			console.log('build path');
			child_process.exec('rm -rf '+buildPath, {maxBuffer:10*1024, cwd:buildFile},
				function(error, stdout, stderr){
					if(files.canMount())
					{
						console.log('can mount');
						child_process.exec('cp -rfv '+mountPath+'/'+id+' '+buildFile+' && chmod -R u+w '+buildFile, {maxBuffer: 30*1024, cwd:buildFile}, 
						function(error, stdout, stderr){
							if (!error)
							{	
								console.log ('ln -s Makefile.'+gadget+' Makefile '+buildPath+'/'+id);
								child_process.exec ('ln -s Makefile.'+gadget+' Makefile', {cwd: buildPath}, function (err, stdout, stderr)
								{
									if (!error)
									{
										startBuildProcess(command,args,buildPath,sendOutput, id);
									}
									else
									{
										console.log ('ln error: '+err);
										sendOutput ("ln error: "+err, "system", error.code);
									}
								});
							}
							else
							{
								console.log ('cp error: '+error);
								sendOutput ("cp error: "+error, "system", error.code);
							}
					
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
						child_process.exec('wget --no-check-certificate '+address, {maxBuffer:30*1024, cwd:buildFile},function(error,stdout,stderr){
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
								console.log (error);
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
