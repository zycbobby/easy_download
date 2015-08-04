'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  validate = require('mongoose-validator');

var Promise = require('bluebird');
var co = require('co');
var ItemP = Promise.promisifyAll(require('../item/item.model'));
var UserP = Promise.promisifyAll(require('../user/user.model'));
var es = Promise.promisifyAll(require('elasticsearch'));
var config = require('../../config/environment');
var esConfig = config.elasticSearch;
var jpush = require('../../util/jpush');

var log4js = require('log4js');
log4js.configure(config.log4js);
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

var seg = require('../../util/segmentation');


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


var ThingModel = mongoose.model('Thing', ThingSchema);
module.exports = ThingModel;

var ThingP = Promise.promisifyAll(ThingModel);

ThingSchema.path('source').validate(function (value, cb) {
  return ThingModel.findOne({source: value}).exec(function (err, model) {
    return cb(!model);
  });
}, 'thing.source already exists, ignore');


// Error handling problem
//
var client = new es.Client({
  host: esConfig.host,
  log: esConfig.loglevel
});

ThingSchema.post('save', function (thing) {
  if (thing.wasNew && !esConfig.notInsert) {
    co(function* () {
      try {
        var response = yield client.index({
          index: esConfig.index,
          type: esConfig.type,
          id: '' + thing._id,
          body: thing
        });

        logger.info(response);
        var res = yield ThingP.findOneAndUpdate({_id: thing._id}, {indexed: true});
        logger.info('[ThingESClient]' + thing._id + ' was indexed');

        var item = yield ItemP.findOneAndUpdate({url: thing.source}, {$set: {crawled: true}});
        logger.info('[ThingESClient]' + item.url + ' was set to crawled');

      } catch (err) {
        logger.error(err);
        logger.info('continue');
      }
    });
  } else {
    logger.info('thing' + thing._id +' was not inserted');
  }
});

// jpush
ThingSchema.post('save', function (thing) {
  if (thing.wasNew) {
    co(function* test(){
      var words = yield seg.doSegment(thing.title);
      var tagsToSend = [];
      for(var i = 0; i < words.length; i++) {
        var tag = words[i];
        var user = yield UserP.findOne({ 'tags' : tag});
        if (user) {
          logger.info('tags ' + tag + ' was included');
          tagsToSend.push(tag);
        }
      }
      if (tagsToSend.length > 0) {
        yield jpush.sendWithTag(tagsToSend, thing);
      }
    }).catch(handleError);
  }
});

function handleError(err) {
  if (err) {
    logger.error(err);
    throw err;
  }
}

