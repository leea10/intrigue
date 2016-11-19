const express = require('express');
const fileUpload = require('express-fileupload');
module.exports = () => {
    const app = express();

    //Set up the view engine and layout system
    app.set('views', './app/views');
    app.set('view engine', 'ejs');
    app.use(require('express-ejs-layouts'));

    //Initialize the MongoDB session storage system
    const session = require('express-session');
    const MongoStore = require('connect-mongo')(session);

    //Initialize mongoose
    const mongoose = require('mongoose');

    //Initialize the body parser middleware for HTTP requests
    const bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

    //Configure the static directories
    app.use(express.static('./public'));
    app.use('/bower_components', express.static('./bower_components'));

    //Set the session object config
    app.use(session({
        secret: 'We so sneaky',
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        })
    }));

    //Set up morgan logging
    const morgan = require('morgan');
    app.use(morgan('dev'));

    //Initialize fileupload middleware for HTTP requests
    app.use(fileUpload());

    //Initialize database connection
    require('../app/db');

    //Initialize page routing
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
