'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    url = require('url');

var SourceSchema = new Schema({
  url : {
    type : String,
    index : { unique : true }
  },
  active : {
    type : Boolean,
    default : true
  }
});

SourceSchema
  .virtual('hostname')
  .get(function() {
    var urlInfo = url.parse(this.url, true);
    return urlInfo.hostname;
  });

SourceSchema.methods = {

  getItems : function(){
    var urlInfo = url.parse(this.url);
    var Crawler = require('./parsers/'+ urlInfo.hostname);
    if (!Crawler) {
      console.log('parser for ' + urlInfo.hostname + ' is not defined');
      return [];
    }

    var crawler = new Crawler(this.url);

    return crawler.getItems();
  }
};

module.exports = mongoose.model('Source', SourceSchema);
