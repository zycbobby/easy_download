'use strict';

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
    debug : true,

    userAgent : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36',
    callback : cb
  });
};

module.exports = CommonCrawler;
