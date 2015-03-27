'use strict';

var Q = require('q');
var Crawler = require('crawler');
var crawler = new Crawler();


function CommonCrawler(url) {
  this.url = url;
}

CommonCrawler.prototype.fetch = function () {
  var defer = Q.defer();
  var self = this;
  crawler.queue({
    uri : self.url,
    jQuery: true,
    forceUTF8 : true,
    // cache : true,
    userAgent : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36',
    callback : function(error, result, $){
      if (error) {
        defer.reject(error);
      } else {
        defer.resolve({
          error : undefined,
          result : result,
          jquery : $
        });
      }
    }
  });
  return defer.promise;
};

CommonCrawler.prototype.fetchWithRetry = function (retryTimes, cb) {
  var self = this;

  function rejectCb() {
    if (0 === retryTimes) {
      cb({
        error: 'retry too many times'
      });
      return;
    }
    console.log('refetch');
    retryTimes -= 1;
    return Q.delay(3000).then(function(){
      return self.fetch();
    }).then(cb, rejectCb);
  }
  self.fetch().then(cb, rejectCb);
};

module.exports = CommonCrawler;
