#!/bin/bash

cp patch/index.js node_modules/node-xmpp-client/index.js
cp patch/session.js node_modules/node-xmpp-client/lib/session.js
cp patch/websockets.js node_modules/node-xmpp-client/lib/websockets.js

