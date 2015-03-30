'use strict';

var util = require('util');
var commonCrawler = require('../../../parsers/common');
var Thing = require('../thing.model');
var Q = require('q');
var url = require('url');

function tmallCrawler(url) {
  commonCrawler.call(this, url);
}

util.inherits(tmallCrawler, commonCrawler);

tmallCrawler.prototype.getThing = function() {
  var defer = Q.defer();
  var self = this;

  self.fetchWithRetry(5, function(res){

    if (res.error) {
      defer.reject({
        error : error
      });
      return;
    }

    var result = res.result;
    var $ = res.jquery;

    var thing = new Thing();
    thing.url = self.url;
    thing.name = $('meta[name="keywords"]')[0].attribs.content;
    thing.info = $('meta[name="description"]')[0].attribs.content;
    defer.resolve({
      thing : thing,
      result : result
    });
  });
  return defer.promise;
};

tmallCrawler.prototype.isSameHost = function(url1, url2) {
  var urlInfo1 = url.parse(url1, true);
  var urlInfo2 = url.parse(url2, true);
  return urlInfo1.host === urlInfo2.host;
};

module.exports = tmallCrawler;
