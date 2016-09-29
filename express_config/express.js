const express = require('express');
module.exports = function() {
    const app = express();

    app.set('views', './app/views');
    app.set('view engine', 'ejs');

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


    require('../app/db');
    require('../app/routes/index.server.routes.js')(app);

    return app;
};
