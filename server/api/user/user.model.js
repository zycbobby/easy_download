'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: {
    type: String,
    index: {unique: true}
  },
  registerId: {
    type: String,
    index: {unique: true}
  },
  tags: [String]
});

module.exports = mongoose.model('User', UserSchema);
