'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var Promise = require('bluebird');

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
  subscribtions: [{type: Schema.Types.ObjectId, ref: 'Query'}]
});

var UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;

UserModel.findByToken = function* (token) {
  return new Promise(function(resolve, reject) {
    UserModel.findOne({ "token" : token}).exec(function(err, user) {
      if (err || !user) { reject(err)}
      resolve(user);
    })
  });
}
