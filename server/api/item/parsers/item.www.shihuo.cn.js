'use strict';

/***
 * This file will try to parse the items from the source
 * @type {exports}
 */

var util = require('util');
var commonCrawler = require('../../../parsers/common');
var Thing = require('../../thing/thing.model');
var Q = require('q');
var url = require('url');

function shihuoCrawler(url, type) {
  commonCrawler.call(this, url);
  this.type = type;
}

util.inherits(shihuoCrawler, commonCrawler);

shihuoCrawler.prototype.getOneThing = function() {
  var defer = Q.defer();
  var self = this;

  self.fetchWithRetry(5, function(res){

    if (res.error) {
      defer.reject({
        error : res.error
      });
      return;
    }

    var $ = res.jquery;
    var thing = new Thing();
    if (self.type === 1 || self.type === 5) { // normal youhui
      var article =  $('div.area-prolist');

      thing.title = article.find('h2.article-title').first().text().trim();
      thing.source = self.url;
      thing.info = {
        price : {
          price : article.find('h2.article-title > span').first().text().trim()
        },
        tags : [],
        images : []
      };

      article.find('div.article img').each(function(idx, ele) {
        var url2 = ele.attribs.src;
        if (self.isValidaUrl(url2)) {
          thing.info.images.push( {
                    url : ele.attribs.src
                  });
        }
      });

      defer.resolve(thing);
    } else {
      defer.reject(new Error('cannot find shihuo type ' + self.type + ' for url ' + self.url));
    }

  });
  return defer.promise;
};

module.exports = shihuoCrawler;



