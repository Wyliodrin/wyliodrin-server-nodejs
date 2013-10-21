
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

function build(id)
{
	validatePath(id, function(path){
		console.log(path);
		child_process.exec('make build', {maxBuffer: 200*1024,cwd: path},
			function (error, stdout, stderr) {
					console.log('forked');
				    console.log('stdout: ' + stdout);
				    console.log('stderr: ' + stderr);
				    if (error !== null) {
				      console.log('exec error: ' + error);
				    }});
	});
}

build('123');
