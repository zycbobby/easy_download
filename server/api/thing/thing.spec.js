'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var co = require('co');
var Thing = require('./thing.model');
var config = require('../../config/environment');

var thing = {
  "title" : "MYHABIT、SHOPBOP、Ruelala、GILT 每日更新20日23时、0时",
  "source" : "http://haitao.smzdm.com/p/342519",
  "indexed" : false,
  "active" : true,
  "info" : {
    "images" : [
      {
        "url" : "http://ym.zdmimg.com/201508/20/55d5885daa0049940.png_e600.jpg"
      },
      {
        "url" : "http://ym.zdmimg.com/201508/20/55d5885ebb0be2020.png_e600.jpg"
      }
    ],
    "thumbs" : {
      "down" : 0,
      "up" : 0
    },
    "tags" : [
      "每日更新",
      "服饰鞋包",
      "MYHABIT",
      "Shopbop",
      "Ruelala"
    ],
    "price" : {
      "unit" : "rmb",
      "guessprice" : 0,
      "price" : "20日23时、0时"
    }
  }
};

describe('Thing Mongoose API', function(){
  beforeEach(function(done){
    //add some test data
    co(function* () {
      var doc = yield Thing.create(thing);
    }).then(done).catch(err => {
      done(err);
    });
  });

  afterEach(function(done) {
    co(function* (){
      yield Thing.remove({}).exec();
    }).then(done).catch(err => {
      done(err);
    });
  });


  it('set indexed', function(done){
    co(function* (){
      var doc = yield Thing.findOne({"source" : thing.source}).exec();
      doc.should.have.property('indexed', false);
      yield doc.setIndexed();
      doc = yield Thing.findOne({"source" : thing.source}).exec();
      doc.should.have.property('indexed', true);
    }).then(done).catch(err => {
      done(err);
    })
  });

  it('save to elastic search', function(done){
    co(function* (){

    }).then(done).catch(err => {
      done(err);
    })
  });
});

describe('GET /api/things', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/things')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});
