'use strict';
// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var should = require('should');
var Item = require('./item.model.js');
var Thing = require('../thing/thing.model');
var co = require('co');

require('../../config/mongoConnection.js');

var item = {
  "url" : "http://www.shihuo.cn/youhui/126991.html#qk=youhui_list&page=1&order=4",
  "type" : 1,
  "crawled" : false
};

describe('Test Mongoose API', function() {
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

  it("should crawl thing", function(done){
    co(function *() {
      var doc = yield Item.findOne({ url : item.url}).exec();
      var thing = yield doc.getOneThing();
      thing.should.be.instanceOf(Thing);
    }).then(done).catch(function(err){
      done(err);
    });
  });
});

