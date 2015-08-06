'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var QuerySchema = new Schema({
  term: String
});

module.exports = mongoose.model('Query', QuerySchema);
