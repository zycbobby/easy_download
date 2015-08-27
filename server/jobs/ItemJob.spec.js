'use strict';

var should = require('should');
var co = require('co');
var ItemJob = require('./ItemJob');
var assert = require('assert');
var CronJob = require('cron').CronJob;

var job = new ItemJob('Item Job');


describe('Test Item Job', function () {

  it("should have a cron job", function (done) {
    job.job.should.be.instanceOf(CronJob);
    done();
  });

});


