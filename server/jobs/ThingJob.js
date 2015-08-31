// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('../config/environment');
var CronJob = require('cron').CronJob;
var Promise = require('bluebird');
var Source = require('../api/source/source.model');
var Item = require('../api/item/item.model');
var Thing = require('../api/thing/thing.model');
var _ = require('lodash');
var co = require('co');
var crawler = require('../util/crawler');
var logger = require('../util/logger');
var client = require('../config/esConnection');
var util = require("util");

var Job = require('./JobBase');

function ThingJob(){
  Job.call(this, 'Thing Crawler');
  this.isThingGetting = false;
  var self = this;
  this.job = new CronJob({
    cronTime: config.thingCron,
    timeZone: config.timeZone,
    onTick: self._onTick,
    onComplete: function () {
      logger.info(this.jobName + ' has completed');
    },
    start: false,
    context: self
  });
}

util.inherits(ThingJob, Job);

ThingJob.prototype._onTick = function(){
  var self = this;
  if (!self.isThingGetting) {
    self.isThingGetting = true;
    co(function* () {
      var items = yield Item.find({crawled: false}).limit(2).exec();
      var things = yield crawler.getThings(items);
      var savedThings = yield things.map(function* (thing){
        return Thing.create(thing);
      });

      logger.info( self.jobName + " finished thing crawling, inserted " + savedThings.length + " things");

      // count unIndexed thing
      var count = yield Thing.count({ "indexed" : false, "source" : { "$nin": things.map( t => { return t.source}) }}).exec();
      logger.info(self.jobName +  " unindexed thing : " + count);

      // find unindexed thing
      if (count > 0) {
        things = yield Thing.find({ "indexed" : false, "source" : { "$nin": things.map( t => { return t.source}) }}).limit(2).exec();
        var indexedThings = yield things.map(t => {
          return t.saveEs();
        });
        logger.info(self.jobName + " indexed " + indexedThings.length +" things");
      }
    }).then(function(){
      self.isThingGetting = false;
    }).catch(function (err) {
      self.onError(err);
      self.isThingGetting = false;
    });
  } else {
    logger.info(this.jobName +  ' now getting, ignore this one');
  }
};

module.exports = ThingJob;
