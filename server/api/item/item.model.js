'use strict';

var mongoose = require('mongoose'),
    url = require('url'),
    Schema = mongoose.Schema;

var ItemSchema = new Schema({
  url: { type: String, index: { unique: true }},
  type : Number,
  crawled : {
    type : Boolean,
    default : false
  }
});


ItemSchema.methods = {

  getOneThing : function(){
    var urlInfo = url.parse(this.url);

    var Crawler = require('./parsers/item.'+ urlInfo.hostname);
    if (!Crawler) {
      console.log('parser for ' + urlInfo.hostname + ' is not defined');
      return [];
    }
    var crawler = new Crawler(this.url);

    return crawler.getOneThing();
  }
};

var ItemModel = mongoose.model('Item', ItemSchema);
module.exports = ItemModel;

ItemSchema.path('url').validate(function (value, cb) {
  return ItemModel.findOne( { url : value }).exec( function(err, model) {
    return cb(!model);
  });
}, 'item.url already exists, ignore');

