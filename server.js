const config = require('config');
const app = require('./express_config/express')();
const server = require('http').Server(app);
const serverPort = config.get('serverPort');

server.listen(serverPort, function() {
    console.log('[SERVER] Listening on port ' + serverPort);
});

module.exports = app;