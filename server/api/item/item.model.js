'use strict';

var mongoose = require('mongoose'),
    url = require('url'),
    Schema = mongoose.Schema,
    Q = require('q');

var config = require('../../config/environment');
var logger = require('../../util/logger');

var ItemSchema = new Schema({
  url: { type: String, index: { unique: true }},
  type : Number,
  thumbnail: String,
  crawled : {
    type : Boolean,
    'default' : false
  }
});

ItemSchema.path('url').validate(function (value, cb) {
  return ItemModel.findOne( { url : value }).exec( function(err, model) {
    return cb(!model);
  });
}, 'item.url already exists, ignore');


ItemSchema.methods = {

  getOneThing : function(){
    var urlInfo = url.parse(this.url);
    var parserModule = './parsers/item.' + urlInfo.hostname;
    try  {
      var Crawler = require(parserModule);
      if (!Crawler) {
        logger.error('parser for ' + urlInfo.hostname + ' is not defined');
        return [];
      }
      var crawler = new Crawler(this);
      return crawler.getOneThing();
    } catch(e) {
      logger.error(e);
      logger.error('error in parsing ' + this.url);
      return Q.reject(e);
    }
  },

  setCrawled: function* (){
    this.crawled = true;
    yield this.save();
  }
};

var ItemModel = mongoose.model('Item', ItemSchema);
module.exports = ItemModel;
