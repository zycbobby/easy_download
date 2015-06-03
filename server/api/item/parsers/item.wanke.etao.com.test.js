'use strict';

/***
 * This file will try to parse the items from the source
 * @type {exports}
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var etaoThingCrawler = require('./item.wanke.etao.com');

var crawler = new etaoThingCrawler('http://wanke.etao.com/detail/1431547.html?wanke_src=feed', 0);

crawler.getOneThing().then(function(thing) {
  console.log(thing);
  process.exit(0);
}, function(){
  console.log('rejected');
});



