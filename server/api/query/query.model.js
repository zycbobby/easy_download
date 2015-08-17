'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var Promise = require('bluebird');

var QuerySchema = new Schema({
  parsedTerm: {
    type: String,
    index: {unique: true}
  },

  count: {
    type: Number,
    'default': 0
  }
});

var QueryModel = mongoose.model('Query', QuerySchema);
module.exports = QueryModel;

QueryModel.createOrUpdate = function* (q) {
  return new Promise(function(resolve, reject) {
    QueryModel.findOne(q, function(err, query) {
      if (!query) {
        // create
        QueryModel.create(q, function(err, query){
          if (err) { reject(err); }
          resolve(query);
        });
      } else {
        // update count
        query.count = query.count + 1;
        query.save(function (err) {
          if (err) { reject(err); }
          resolve(query);
        });
      }
    });
  });
}
