'use strict';

var config = require('config');
var app = require('./express_config/express')();
var serverPort = config.get('serverPort');
var httpServer = require('http').createServer(app);

httpServer.listen(serverPort, function () {
    console.log('[SERVER] Listening on port ' + serverPort);
});

module.exports = httpServer;

//# sourceMappingURL=server-compiled.js.map