"use strict"
var c = require('./wyliodrin_communication');

c.initCommunication(6379);
c.openConnection(1,function(from, err, data){
	console.log(from + ":" +data);
});