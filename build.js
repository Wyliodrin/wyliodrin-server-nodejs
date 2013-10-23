
path = require('path');
fs = require('fs');
child_process = require('child_process');

PATH_ERROR = 1;
PATH_OK = 0;

var PATH = '/home/pi/projects';

function validatePath(id, returnPath)
{
	resultPath = path.join(PATH,id);
	//TODO cache for improvement
	var errorCode;
	fs.realpath(resultPath, function(err, resolvedPath){
		if(err)
			returnPath(null);
		else
		{
			if(resolvedPath.indexOf(PATH) == 0)
				returnPath(resolvedPath);
			else
				returnPath(null);
		}
	});
} 

function make(id, command, sendOutput)
{
	validatePath(id, function(path)
	{
		if(path)
		{
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
		else
		{
			sendOutput("Invalid path", "system",null,null);
		}
	});
}

// make("123","make build");
exports.make = make;
