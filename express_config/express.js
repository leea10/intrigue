const express = require('express');
const fileUpload = require('express-fileupload');
module.exports = () => {
    const app = express();

    app.set('views', './app/views');
    app.set('view engine', 'ejs');
    app.use(require('express-ejs-layouts'));


    const session = require('express-session');
    const MongoStore = require('connect-mongo')(session);
    const mongoose = require('mongoose');

    const bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

    app.use(express.static('./public'));
    app.use('/bower_components', express.static('./bower_components'));

    app.use(session({
        secret: 'We so sneaky',
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        })
    }));

    const morgan = require('morgan');
    app.use(morgan('dev'));

    app.use(fileUpload());

    require('../app/db');

    const pageRouter = require('../app/routes/pages.server.router.js');
    const apiRouter = require('../app/routes/api.server.router.js');

    app.use('/', pageRouter);
    app.use('/api', apiRouter);

    //error handling for non-existent pictures
    app.get('/images/stories/*', function(req, res) {
        res.sendfile('./public/assets/coverphoto_00.png');
    });
    app.get('/images/characters/*', function(req, res) {
        res.sendfile('./public/assets/characterIcons/character04.png');
    });

    return app;
};
