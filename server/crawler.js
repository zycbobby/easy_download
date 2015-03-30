/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('mongoose-q')(require('mongoose'));
var config = require('./config/environment');
var CronJob = require('cron').CronJob;
var Source =require('./api/source/source.model');
var Item =require('./api/item/item.model');
var Thing =require('./api/thing/thing.model');
var Q = require('q');
var _ = require('lodash');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var isItemGetting = false;

//
var getItemJob = new CronJob({
  cronTime: config.itemCron,
  onTick: function() {
    if (!isItemGetting) {
      isItemGetting = true;
      Source.findQ({ active : true } ).then(function(sources) {
        var results = [];
        console.log('begin get item task ' + new Date());
        sources.forEach(function(source) {
          results.push(source.getItems());
        });
        return results;
      }).then(Q.all)
        .then(function(itemsArray){
          var results = [];
          var flatten = _.flatten(itemsArray);
          console.log('get ' + flatten.length + ' items');
          flatten.forEach(function(item) {
            results.push(Item.createQ(item));
          });
          return results;
      }).then(Q.allSettled)
        .then(function(results){
          var count = _.filter(results, function(r) {
            return r.state != 'rejected'
          }).length;
          console.log('finish inserting ' + count + ' items');

          isItemGetting = false;
      }).catch(function(err) {
        console.log(err);
        isItemGetting = false;
      }).done();
    } else {
      console.log('item is now getting, ignore this one : ' + new Date());
    }

  },
  onComplete : function(){
    console.log('item job has completed');
  },
  start: false
});

getItemJob.start();


var isThingGetting = false;
//
var getThingJob = new CronJob({
  cronTime: config.thingCron,
  onTick: function() {

    if (!isThingGetting) {
      isThingGetting = true;
      Item.findQ({ crawled : false } ).then(function(items) {
        var results = [];
        console.log('begin get thing task ' + new Date());
        items.forEach(function(item) {
          results.push(item.getOneThing());
        });
        return results;
      }).then(Q.all)
        .then(function(things){
          var results = [];
          things.forEach(function(thing) {
            results.push(Thing.createQ(thing));
          });
          return results;
        }).then(Q.allSettled)
        .then(function(results){
          var count = _.filter(results, function(r) {
            return r.state != 'rejected'
          }).length;
          console.log('finish inserting ' + count + ' things');
          isThingGetting = false;
        }).catch(function(err) {
          console.log(err);
          isThingGetting = false;
        }).done();
    } else {
      console.log('thing is now getting, ignore this one : ' + new Date());
    }
  },
  onComplete : function(){
    console.log('thing job has completed');
  },
  start: false
});
//
getThingJob.start();


