'use strict';

var Q = require('q');
var Crawler = require('crawler');
var crawler = new Crawler();


function CommonCrawler(url) {
  this.url = url;
}

CommonCrawler.prototype.fetchWithRetry = function (retryTimes, cb) {
  var self = this;
  crawler.queue({
    uri : self.url,
    jQuery: true,
    forceUTF8 : true,
    timeout : 5000,
    retries : retryTimes,
    retryTimeout : 3000,
    // cache : true,
    userAgent : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36',
    callback : function(error, result, $){
      if (error) {
        cb({
          error: error
        })
      } else {
        cb({
          error : undefined,
          result : result,
          jquery : $
        });
      }
    }
  });
};

var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g;
CommonCrawler.prototype.isValidaUrl = function(url) {
  return regexp.test(url);
};

module.exports = CommonCrawler;
