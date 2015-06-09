'use strict';


var Q = require('q');
var config = require('../../config/environment');
var esConfig = config.elasticSearch;
var log4js = require('log4js');
log4js.configure(config.log4js);
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

function ThingESClient(esclient) {
  this.client = esclient;
}

ThingESClient.prototype.indexThing = function(thing) {
  var Thing = require('./thing.model');
  var defer = Q.defer();
  this.client.index({
    index: esConfig.index,
    type: esConfig.type,
    id: '' + thing._id,
    body: thing
  }, function (error, response) {
    handleError(error);
    logger.info(response);

    Thing.findOneAndUpdate({ _id : thing._id}, { indexed : true}, function(err, res) {
      handleError(err);
      logger.info('[ThingESClient]' + thing._id + ' was indexed');
      defer.resolve({
        status : 'ok',
        mongoResult : res,
        esResult : response
      });
    });
  });

  return defer.promise;
};


ThingESClient.prototype.exists = function(thingId) {
  var defer = Q.defer();
  var Thing = require('./thing.model');
  this.client.exists({
    index: esConfig.index,
    type: esConfig.type,
    id: '' + thingId // typeof thingId === ObjectId
  }, function (error, exists) {
    handleError(error);
    defer.resolve({
      exists : exists
    })
  });
  return defer.promise;
};


function handleError(err) {
  if (err) {
    logger.error(err);
    throw err;
  }
}


module.exports = ThingESClient;
