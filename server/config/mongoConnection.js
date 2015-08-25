'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('mongoose');
var config = require('./environment');
// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
