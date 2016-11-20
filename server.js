const config = require('config');
const app = require('./express_config/express')();
const serverPort = config.get('serverPort');
const httpServer = require('http').createServer(app);

//Launch the server
httpServer.listen(serverPort, function() {
    console.log('[SERVER] Listening on port ' + serverPort);
});

module.exports = httpServer;