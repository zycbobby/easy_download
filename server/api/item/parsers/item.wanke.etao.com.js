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

function etaoCrawler(url, type) {
  commonCrawler.call(this, url);
  this.type = type;
}

util.inherits(etaoCrawler, commonCrawler);

etaoCrawler.prototype.getOneThing = function() {
  var defer = Q.defer();
  var self = this;

  self.fetchWithRetry(5, function(res){

    if (res.error) {
      defer.reject({
        error : error
      });
      return;
    }

    var $ = res.jquery;
    var thing = new Thing();
    var article =  $('div.col.sec-content');

    if (article.find('a.wk-btn.btn-normal.inn-detail-btn').length > 0) {

      thing.title = article.find('h1.title').first().text().trim();
      thing.source = self.url;
      thing.info = {
        price : {
          price : article.find('h1.title').first().text().trim()
        },
        tags : [],
        images : []
      };

      article.find('#J_content img').each(function(idx, ele) {
        thing.info.images.push( {
          url :ele.attribs.src
        });
      });
      defer.resolve(thing);
    } else {
      defer.reject();
    }

  });
  return defer.promise;
};

module.exports = etaoCrawler;



