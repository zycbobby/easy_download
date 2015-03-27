'use strict';

var util = require('util');
var commonCrawler = require('./common');
var Thing = require('../thing.model');
var Q = require('q');

function tmallCrawler(url) {
  commonCrawler.call(this, url);
}

util.inherits(tmallCrawler, commonCrawler);

tmallCrawler.prototype.getThing = function() {
  var defer = Q.defer();
  var self = this;
  this.fetch(function(error, result, $) {
    if (error) {
      console.log(error);
      defer.reject(error);
    } else {
      var thing = new Thing();
      thing.url = self.url;
      console.log(result.uri);
      console.log(self.url);
      if (result.uri !== self.url ) {
        console.log('be redirected');
      }
      thing.name = $('meta[name="keywords"]')[0].attribs.content;
      thing.info = $('meta[name="description"]')[0].attribs.content;
      defer.resolve({
        thing : thing,
        result : result
      });
    }

  });
  return defer.promise;
};

module.exports = tmallCrawler;
