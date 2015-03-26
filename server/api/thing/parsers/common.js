'use strict';

var jsdom = require('jsdom');
var Crawler = require('crawler');
var crawler = new Crawler();


function CommonCrawler(url) {
  this.url = url;
}

CommonCrawler.prototype.fetch = function (cb) {
  var self = this;
  crawler.setMaxListeners(200);
  crawler.queue({
    uri : self.url,
    jQuery: true,
    forceUTF8 : true,
    callback : cb
  });
};

module.exports = CommonCrawler;
