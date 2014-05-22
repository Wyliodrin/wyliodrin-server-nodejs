/*function handles error messages*/

function putLog(log)
{
	console.log(log);
}

function putError(error)
{
	console.log("error = "+error);
}

exports.putLog = putLog;
exports.putError = putError;