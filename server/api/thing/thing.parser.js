'use strict';

var _ = require('lodash');
var url = require('url');
var Thing = require('./thing.model');

// parse the url
exports.parse = function(req, res) {
  var urlInfo = url.parse(req.body.url, true);
  console.log(urlInfo);
  /**
   * { protocol: 'http:',
        slashes: true,
        auth: null,
        host: 'detail.tmall.com',
        port: null,
        c: 'detail.tmall.com',
        hash: null,
        search: '?id=3408565637&spm=a230r.1.14.3.6awLvr&ad_id=&am_id=&cm_id=140105335569ed55e27b&pm_id=',
        query:
         { id: '3408565637',
           spm: 'a230r.1.14.3.6awLvr',
           ad_id: '',
           am_id: '',
           cm_id: '140105335569ed55e27b',
           pm_id: '' },
        pathname: '/item.htm',
        path: '/item.htm?id=3408565637&spm=a230r.1.14.3.6awLvr&ad_id=&am_id=&cm_id=140105335569ed55e27b&pm_id=',
        href: 'http://detail.tmall.com/item.htm?id=3408565637&spm=a230r.1.14.3.6awLvr&ad_id=&am_id=&cm_id=140105335569ed55e27b&pm_id=' }
   */
  var Parser = require('./parsers/' + urlInfo.hostname);
  var parser = new Parser(urlInfo.protocol + '//' + urlInfo.host + urlInfo.pathname + '?id='+ urlInfo.query.id );

  parser.getThing().then(function(thing) {
    res.send(200, thing);
  }, function(error) {
    res.send(500, error);
  });

};
