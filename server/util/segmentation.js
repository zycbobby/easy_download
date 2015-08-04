'use strict';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var Promise = require('bluebird');
var co = require('co');
var es = Promise.promisifyAll(require('elasticsearch'));
var config = require('../config/environment');
var esConfig = config.elasticSearch;

var client = new es.Client({
  host: esConfig.host,
  log: esConfig.loglevel
});

function* doSegment(str) {
  var response = yield client.indices.validateQuery({
      index: 'mongoindex',
      explain: true,
      body: {
        query: {
          match: { title: str}
        }
      }
    });
  var explainations = response['explanations'][0]['explanation'];
  var l = 'title:'.length;
  return explainations.split(' ').map(token => {
    return  token.substring(l);
  })

}

//co(doSegment('meiji 明治 SMART BODY 明治营养代餐蛋白粉 14餐1473日元')).then(words => {
//  console.log(words);
//});

module.exports = {
  doSegment: doSegment
}
