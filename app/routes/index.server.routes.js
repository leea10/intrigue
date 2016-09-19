module.exports = function(app) {

    var landing = require('../controllers/landing.server.controller');

    //Pages
    app.get('/', landing.render);
};
