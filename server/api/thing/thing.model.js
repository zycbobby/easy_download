'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  validate = require('mongoose-validator');

var Promise = require('bluebird');
var co = require('co');
var Item = require('../item/item.model');
var config = require('../../config/environment');
var logger = require('../../util/logger');

var ThingSchema = new Schema({
  title: {
    type: String,
    es_indexed: true
  },

  source: {
    type: String,
    index: {unique: true}
  },
  info: {
    price: {
      price: String,
      guessprice: Number,
      unit: String
    },

    tags: [String],

    thumbs: {
      up: {
        type: Number,
        'default': 0
      },
      down: {
        type: Number,
        'default': 0
      }
    },

    images: [
      {
        url: {
          type: String,
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

  createdAt: Date,
  updatedAt: Date
});

ThingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.isNew) {
    this.createdAt = Date.now();
  }
  this.wasNew = this.isNew;
  next();
});

/**
 * extract price
 */
ThingSchema.pre('save', function (next) {
  var rmb1 = {
    pattern: /((\d+[\.\d]*)元)/g,
    unit: '元'
  };

  var rmb2 = {
    pattern: /(￥(\d+))/g,
    unit: '￥'
  };

  var rmb3 = {
    pattern: /(¥(\d+))/g,
    unit: '¥'
  };

  var usd1 = {
    pattern: /(\$(\d+[\.\d]*))/g,
    unit: '$'
  };

  if (this.info.price.price.match(rmb1.pattern)) {
    var guessPrice = this.info.price.price.match(rmb1.pattern);
    this.info.price.guessprice = guessPrice[guessPrice.length - 1].replace(rmb1.unit, '');
    this.info.price.unit = "rmb";
  }
  else if (this.info.price.price.match(rmb2.pattern)) {
    var guessPrice = this.info.price.price.match(rmb2.pattern);
    this.info.price.guessprice = guessPrice[guessPrice.length - 1].replace(rmb2.unit, '');
    this.info.price.unit = "rmb";
  }
  else if (this.info.price.price.match(rmb3.pattern)) {
    var guessPrice = this.info.price.price.match(rmb3.pattern);
    this.info.price.guessprice = guessPrice[guessPrice.length - 1].replace(rmb3.unit, '');
    this.info.price.unit = "rmb";
  }
  else if (this.info.price.price.match(usd1.pattern)) {
    var guessPrice = this.info.price.price.match(usd1.pattern);
    this.info.price.guessprice = guessPrice[guessPrice.length - 1].replace(usd1.unit, '');
    this.info.price.unit = "usd";
  }
  else {
    this.info.price.guessprice = 0;
    this.info.price.unit = "rmb";
  }
  next();
});


/**
 * This should be defined before generate model
 * @type {{saveEs: Function, setIndexed: Function}}
 */
ThingSchema.methods = {
  saveEs : function* (){
    var response = yield client.index({
      index: config.elasticSearch.index,
      type: config.elasticSearch.type,
      id: '' + this._id,
      body: this
    });
    yield this.setIndexed();
  },

  setIndexed: function* (){
    this.indexed = true;
    yield this.save();
  }
};

var ThingModel = mongoose.model('Thing', ThingSchema);

ThingSchema.path('source').validate(function (value, cb) {
  if (!this.wasNew) {
    return cb(true);
  }
  return ThingModel.findOne({source: value}).exec(function (err, model) {
    return cb(!model);
  });
}, 'thing.source already exists, ignore');


var client = require('../../config/esConnection');

ThingSchema.post('save', function (thing) {
  if (thing.wasNew) {
    co(function* () {
      var item = yield Item.findOneAndUpdate({url: thing.source}, {$set: {crawled: true}}).exec();
      logger.info('[ThingESClient]' + item.url + ' was set to crawled');
    })
  }
});

ThingSchema.post('save', function (thing) {
  if (thing.wasNew && !config.elasticSearch.notInsert) {
    co(function* () {
      yield thing.saveEs();
      logger.info('[ThingESClient]' + thing._id + ' was indexed');
    }).catch(function (err) {
      logger.error('Error in saving es: ' + thing._id);
      logger.error(err);
    });
  }
});

function handleError(err) {
  if (err) {
    logger.error(err);
    throw err;
  }
}

module.exports = ThingModel;
