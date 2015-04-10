'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Item = require('../item/item.model'),
  validate = require('mongoose-validator');
var es = require('elasticsearch');
var esConfig = require('../../config/environment').elasticSearch;
var ThingEs = require('./thing.es');


var ThingSchema = new Schema({
  title: {
    type : String,
    es_indexed:true
  },

  source: {
    type : String,
    index : { unique : true}
  },
  info: {
    price : {
      price : String,
      unit : String
    },

    tags : [String],

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

    images : [
      {
        url : {
          type : String,
          validate: validate({
            validator: 'isURL'
          })
        }
      }
    ]
  },

  active: {
    type: Boolean,
    'default': true
  },

  indexed: {
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
  this.wasNew = this.isNew;
  next();
});

ThingSchema.post('save', function(doc){
  var self = this;
  Item.findOneAndUpdate({ url : doc.source}, { $set : { crawled : true} }, function(err, item) {
    if (err || !item) {
      console.log('fail to execute thing post save ');
    }
    console.log('crawl ' + doc.source);
  });
});

var ThingModel = mongoose.model('Thing', ThingSchema);
module.exports = ThingModel;

ThingSchema.path('source').validate(function (value, cb) {
  return ThingModel.findOne( { source : value }).exec( function(err, model) {
    return cb(!model);
  });
}, 'thing.source already exists, ignore');

ThingSchema.post('save', function(doc){
  if (doc.wasNew) {
    var client = new es.Client({
      host : esConfig.host,
      log: esConfig.loglevel
    });
    var thingEs = new ThingEs(client);
    thingEs.indexThing(doc).done();
  }
});

function handleError(err) {
  if (err) {
    console.log(err);
    throw err;
  }
}
