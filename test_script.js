var terminal = require('./terminal.js');
var xmpp = require('./xmpp.js');

terminal.initTerminals();
xmpp.connect();

console.log ('started');