'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var HistorySchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  query: {type: Schema.Types.ObjectId, ref: 'Query'},
  updated_at: { type: Date }
});

module.exports = mongoose.model('History', HistorySchema);

HistorySchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});
