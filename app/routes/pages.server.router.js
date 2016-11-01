var express = require('express');
var router = express.Router();

const landing = require('../controllers/landing.server.controller');
const dashboard = require('../controllers/dashboard.server.controller');
const auth = require('../controllers/auth.server.controller');
const editor = require('../controllers/editor.server.controller');


//Pages
router.get('/', auth.indexRedirect, landing.render);
router.get('/dashboard', auth.isLoggedIn, dashboard.render);
router.get('/editor', auth.isLoggedIn, editor.render);

//Auth
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.isLoggedIn, auth.logout);

module.exports = router;


