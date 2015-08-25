'use strict';
// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var should = require('should');
var Item = require('./item.model.js');
var co = require('co');

require('../../config/mongoConnection.js');

describe('Test Mongoose API', function() {
  var item = {
    "url" : "http://wanke.etao.com/detail/1612628-fake.html?wanke_src=feed",
    "type" : 1,
    "crawled" : false
  };

  beforeEach(function(done){
    //add some test data
    co(function* () {
      var doc = yield Item.create(item);
    }).then(done);
  });

  afterEach(function(done) {
    co(function* (){
      yield Item.remove({ "url" : item.url}).exec();
    }).then(done);
  });

  it("should be retrieve by url", function(done){
    co(function *() {
      var doc = yield Item.findOne({ url : item.url}).exec();
      doc.should.have.property('url', item.url);
    }).then(done).catch(function(err){
      done(err);
    });
  });
});
