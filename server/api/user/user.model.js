'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: {
    type: String,
    index: {unique: true}
  },
  token: {
    type: String,
    index: {unique: true}
  },
  platform: String,
  tags: [String],
  queries: [{type: Schema.Types.ObjectId, ref: 'Query'}]

});

module.exports = mongoose.model('User', UserSchema);
