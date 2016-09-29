module.exports = function(app) {

    var landing = require('../controllers/landing.server.controller');
    var dashboard = require('../controllers/dashboard.server.controller');
    var session = require('../controllers/session.server.controller');

    //Pages
    app.get('/', session.indexRedirect, landing.render);
    app.get('/dashboard', session.isLoggedIn, dashboard.render);

    //Auth
    app.post('/register', session.register);
    app.post('/login', session.login);
};
