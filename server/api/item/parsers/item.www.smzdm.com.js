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

function smzdmCrawler(item) {
  commonCrawler.call(this, item.url);
  this.item = item;
}

util.inherits(smzdmCrawler, commonCrawler);

smzdmCrawler.prototype.getOneThing = function() {
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
    var article =  $('article');
    var thing = new Thing();
    thing.title = article.find('h1.article_title').first().text().trim();
    thing.source = self.url;
    thing.thumbnail = self.item.thumbnail;
    thing.info = {
      price : {
        price : article.find('h1 > span.red').first().text().trim()
      },
      tags : [],
      images : []
    };

    article.find('.article_meta,.article_meta_nowrap').find('span > a').each(function(idx, ele) {
      thing.info.tags.push($(ele).text().trim());
    });

    article.find('p[itemprop="description"] > img').each(function(idx, ele) {
      thing.info.images.push( {
        url :ele.attribs.src
      });
    });

    defer.resolve(thing);
  });
  return defer.promise;
};

module.exports = smzdmCrawler;



