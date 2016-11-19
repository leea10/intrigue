const config = require('config');

// Bring Mongoose into the app
const mongoose = require('mongoose');
mongoose.promise = global.Promise;

let mongoPort = config.get('mongo.mongoPort');
let dbName = config.get('mongo.dbName');
let dbLoc = config.get('mongo.dbLoc');
let dbURI = 'mongodb://' + dbLoc + ':' + mongoPort + '/' + dbName;

// Create the database connection
mongoose.connect(dbURI);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
    console.log('[DB] Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
    console.log('[DB] Mongoose connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('[DB] Mongoose connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('[DB] Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});


require('./schema');

