"use strict"

var c = require('./wyliodrin_communication');
c.initCommunication(6379);
c.sendMessage("msg4alex_intel@wyliodrin.com",1, "acesta e un test");
c.closeCommunication();