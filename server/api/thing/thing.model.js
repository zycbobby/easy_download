'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  validate = require('mongoose-validator');

var ThingSchema = new Schema({
  name: String,
  info: String,
  url: {
    type: String,
    validate: validate({
      validator: 'isURL'
    })
  },
  ownerInfo : {
    userId: {
      required : true,
      type : mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  otherInfo : {
    thumbs : {
      up: {
        type: Number,
        'default': 0
      },
      down: {
        type: Number,
        'default': 0
      }
    },
    comments: [{
      userId: mongoose.Schema.Types.ObjectId,
      comment: {
        text : String,
        createdAt : Date,
        valid : {
          type : Boolean,
          'default' : true
        }
      }
    }],
    tags : [
      {
        tagId : mongoose.Schema.Types.ObjectId
      }
    ]
  },
  active: {
    type: Boolean,
    'default': true
  },
  verified: {
    type: Boolean,
    'default': false
  },
  createdAt : Date,
  updatedAt : Date
});

ThingSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  if (this.isNew) {
    this.createdAt = Date.now();
  }

  next();
});

module.exports = mongoose.model('Thing', ThingSchema);
