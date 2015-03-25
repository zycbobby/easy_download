'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    validate = require('mongoose-validator');

var ThingSchema = new Schema({
  name: String,
  info: String,
  url : {
    type :String,
    validate : validate({
      validator: 'isURL'
    })
  },
  thumbsUp: {
    type : Number,
    'default' : 0
  },
  thumbsDown: {
    type : Number,
    'default' : 0
  },
  comments : [{
    userId : mongoose.Schema.Types.ObjectId,
    comment : String
  }],
  active: Boolean

});

module.exports = mongoose.model('Thing', ThingSchema);
