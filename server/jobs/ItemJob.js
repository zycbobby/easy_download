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

var Job = require('./JobBase');

function ItemJob(){
  Job.call(this, 'Item Crawler');
  this.isItemGetting = false;
  var self = this;
  this.job = new CronJob({
    cronTime: config.itemCron,
    timeZone: config.timeZone,
    onTick: self._onTick,
    onComplete: function () {
      logger.info(this.jobName + ' has completed');
    },
    start: false,
    context: self
  });
}

ItemJob.prototype = Object.create(Job.prototype);
ItemJob.prototype.constructor = ItemJob;

ItemJob.prototype._onTick = function(){
  var self = this;
  if (!self.isItemGetting) {
    self.isItemGetting = true;
    co(function* () {
      var sources = yield Source.find({active: true}).exec();
      var items = yield crawler.getItems(sources);
      var count = 0;
      for(var idx in items) {
        var item = items[idx];
        var doc = yield Item.findOne({ "url" : item.url }).exec();
        if (!doc) {
          yield Item.create(item);
          count++;
        }
      }
      logger.info(self.jobName + ' finished item crawling, inserted ' + count + ' items');
    }).then(function(){
      self.isItemGetting = false;
    }).catch(function (err) {
      self.onError(err);
      self.isItemGetting = false;
    });
  } else {
    logger.info(this.jobName +  ' now getting, ignore this one');
  }
};

module.exports = ItemJob;
