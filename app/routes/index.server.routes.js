module.exports = function(app) {

    const landing = require('../controllers/landing.server.controller');
    const dashboard = require('../controllers/dashboard.server.controller');
    const session = require('../controllers/session.server.controller');
    const api = require('../controllers/api.server.controller');

    //Pages
    app.get('/', session.indexRedirect, landing.render);
    app.get('/dashboard', session.isLoggedIn, dashboard.render);
    app.get('/addstory', addstory.render);

    //Auth
    app.post('/register', session.register);
    app.post('/login', session.login);
    app.post('/logout', session.isLoggedIn, session.logout);
};
