'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Source = require('./source.model');
var co = require('co');

require('../../config/mongoConnection.js');

var sources = [{
  "url" : "http://www.shihuo.cn"
}, {
  "url" : "http://www.smzdm.com/p1"
}, {
  "url" : "http://www.etao.com"
}];

describe('Test Mongoose API', function() {


  beforeEach(function(done){
    //add some test data
    co(function* () {
      var doc = yield Source.create(sources);
    }).then(done).catch(err => {
      done(err);
    });
  });

  afterEach(function(done) {
    co(function* (){
      yield Source.remove({}).exec();
    }).then(done);
  });

  it("should have 3 sources", function(done){
    co(function *() {
      var docs = yield Source.find({}).exec();
      should([].slice.apply(docs).length).be.equal(3);
    }).then(done).catch(function(err){
      done(err);
    }).catch(err => {
      done(err);
    });
  });

  it("should have host name", function(done){
    co(function *() {
      var url = "http://www.smzdm.com/p1";
      var doc = yield Source.findOne({"url" : url}).exec();
      should(doc.hostname).be.equal("www.smzdm.com");
    }).then(done).catch(function(err){
      done(err);
    }).catch(err => {
      done(err);
    });
  });


  describe('crawl suite', function(){
    it("should crawl items", function(done){
      co(function *() {
        yield sources.map(function* (t){
          var doc = yield Source.findOne({"url" : t.url}).exec();
          var items = yield doc.getItems();
          items.should.be.instanceOf(Array);
        });
      }).then(done).catch(function(err){
        done(err);
      }).catch(err => {
        done(err);
      });
    });
  });

});

describe('GET /api/sources', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/sources')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});
