var express = require('express'),
    app = express(),
    apiRouter = express.Router(),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    jwt = require('jsonwebtoken'),
    supersecret = 'mysupersecret',
    database = require('./config/database'),
    port = process.env.PORT || 3000;

// Basic app config
app.set('port', port);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

// Hook up to the Db
mongoose.connect(database.url);
var models = require('./config/models')(mongoose, bcrypt);

require('./api')(apiRouter, models, jwt, supersecret);
app.use('/api', apiRouter);

app.listen(port);
console.log('Server is running on ' + port);
