module.exports = function(app) {

    const landing = require('../controllers/landing.server.controller');
    const dashboard = require('../controllers/dashboard.server.controller');
    const session = require('../controllers/session.server.controller');
    const api = require('../controllers/api.server.controller');
    const editor = require('../controllers/editor.server.controller');

    //Pages
    app.get('/', session.indexRedirect, landing.render);
    app.get('/dashboard', session.isLoggedIn, dashboard.render);

    // TODO(Ariel): Make sure the current user has access to the given story.
    app.get('/editor', session.isLoggedIn, editor.render);

    //Auth
    app.post('/register', session.register);
    app.post('/login', session.login);
    app.post('/logout', session.isLoggedIn, session.logout);
};
