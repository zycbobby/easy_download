'use strict';

var should = require('should');
var co = require('co');
var Job = require('./JobBase');
var assert = require('assert');


var s = 'test job';
var job = new Job(s);


describe('Test Job Base', function () {

  it("should create a object", function (done) {
    job.should.have.property('jobName', '[' + s + ']');
    done();
  });

  it("should not be started", function (done) {
    should(job.start).throw(assert.AssertionError);
    done();
  });
});


