'use strict';

var mongoose = require('mongoose'),
    url = require('url'),
    Schema = mongoose.Schema,
    Q = require('q');

var ItemSchema = new Schema({
  url: { type: String, index: { unique: true }},
  type : Number,
  crawled : {
    type : Boolean,
    default : false
  }
});


var ItemModel = mongoose.model('Item', ItemSchema);
module.exports = ItemModel;

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
        console.log('parser for ' + urlInfo.hostname + ' is not defined');
        return [];
      }
      var crawler = new Crawler(this.url, this.type);
      return crawler.getOneThing();
    } catch(e) {
      console.log(parserModule + ' not exists, omit ' + this.url);
      //
      //var defer = Q.defer();
      //Item.findOneAndUpdate({url: this.url}, {$set: {crawled: true}}, function (err, item) {
      //  if (err || !item) {
      //    console.log('fail to set item crawled true' + item);
      //  }
      //
      //  defer.reject()
      //});
      //
      //return defer.promise;

      return Q.reject(parserModule + ' not exists, omit ' + this.url);
    }
  }
};


