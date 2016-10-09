module.exports = (app) => {

    const landing = require('../controllers/landing.server.controller');
    const dashboard = require('../controllers/dashboard.server.controller');
    const auth = require('../controllers/auth.server.controller');
    const api = require('../controllers/api.server.controller');

    //Pages
    app.get('/', auth.indexRedirect, landing.render);
    app.get('/dashboard', auth.isLoggedIn, dashboard.render);

    //Auth
    app.post('/register', auth.register);
    app.post('/login', auth.login);
    app.post('/logout', auth.isLoggedIn, auth.logout);

    //API
    app.get('/getStories', auth.isLoggedIn, api.getStories);
    app.get('/getStoryDetails', auth.isLoggedIn, api.getStoryDetails);

    app.post('/saveStory', auth.isLoggedIn, api.saveStory);
    app.post('/removeStory', auth.isLoggedIn, api.removeStory);
    app.post('/saveCharacter', auth.isLoggedIn, api.saveCharacter);
    app.post('/removeCharacter', auth.isLoggedIn, api.removeCharacter);
    app.post('/saveSnapshot', auth.isLoggedIn, api.saveSnapshot);
    app.post('/removeSnapshot', auth.isLoggedIn, api.removeSnapshot);
    app.post('/saveNode', auth.isLoggedIn, api.saveNode);
    app.post('/removeNode', auth.isLoggedIn, api.removeNode);
};
