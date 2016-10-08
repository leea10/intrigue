const config = require('config');
const app = require('./express_config/express')();
const serverPort = config.get('serverPort');

app.listen(serverPort, function() {
    console.log('[SERVER] Listening on port ' + serverPort);
});

module.exports = app;