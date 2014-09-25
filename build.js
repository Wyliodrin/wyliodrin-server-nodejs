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

var files = require('./files.js');
var log = require('./log.js');

var processArray = [];

var config = require ('./settings.js').config.config;
var buildFile = config.buildFile;
var mountPath = config.mountFile;

var gadget = config.board;

var networkConfig = require('./settings').config.networkConfig;
var port = networkConfig.port;

var signalTimeout = parseInt(networkConfig.timeout);

log.putLog ('Creating build directory in '+buildFile);
mkdirp.sync (buildFile);

function validatePath(id, returnPath)
{
	var validPath;
	if(id.indexOf('/') == -1)
		validPath = path.join(buildFile, id)
	else
		validPath = null;
	returnPath(validPath,id);
} 

function startBuildProcess(command, args, path, sendOutput, done, id, userid)
{
	log.putLog ('Building '+command+' '+args.join(' '));
	var makeProcess = child_process.spawn(command,args,{cwd:path, env:_.extend(process.env,{wyliodrin_project:id,
		wyliodrinport:port, wyliodrin_userid:userid})});
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

function make(id, command, args, address, userid, sendOutput)
{
	log.putLog ('Validating path for project '+id);
	validatePath(id, function(buildPath,id)
	{
		if(buildPath)
		{
			log.putLog ('Building project in '+buildPath);
			log.putLog ('Running rm -rf '+buildPath);
			child_process.exec('rm -rf '+buildPath, {maxBuffer:10*1024, cwd:buildFile},
				function(error, stdout, stderr){
					if(files.canMount())
					{
						log.putLog ('Running cp -rfv '+mountPath+'/'+id+' '+buildFile+' && chmod -R u+w '+buildFile);
						child_process.exec('cp -rfv '+mountPath+'/'+id+' '+buildFile+' && chmod -R u+w '+buildFile, {maxBuffer: 30*1024, cwd:buildFile}, 
						function(error, stdout, stderr){
							if (!error)
							{
								log.putLog ('Running ln -s Makefile.'+gadget+' Makefile');
								child_process.exec ('ln -s Makefile.'+gadget+' Makefile', {cwd: buildPath}, function (err, stdout, stderr)
								{
									if (!error)
									{
										startBuildProcess(command,args,buildPath,sendOutput, id, userid);
									}
									else
									{
										sendOutput ("ln error: "+err, "system", error.code);
									}
								});
							}
							else
							{
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
						child_process.exec('wget --no-check-certificate '+address, {maxBuffer:30*1024, cwd:buildFile},function(error,stdout,stderr){
							if(!error)
							{
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
													startBuildProcess(command,args,buildPath,sendOutput, id, userid);
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
	log.putLog ('Stopping project '+id);
	var process = processArray[id];
	if(process)
	{
		log.putLog ('Stopping process '+process.pid);
		process.kill(process.pid, 'SIGTERM');
		setTimeout(function(){
			if(processArray[id])
				processArray[id].kill(processArray[id].pid, 'SIGKILL');
		},signalTimeout);
	}
}

exports.make = make;
exports.killProcess = killProcess;
exports.buildArray = processArray;
