'use strict';


var Q = require('q');
var esConfig = require('../../config/environment').elasticSearch;

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
    console.log(response);

    Thing.findOneAndUpdate({ _id : thing._id}, { indexed : true}, function(err, res) {
      handleError(err);
      console.log('[ThingESClient]' + thing._id + ' was indexed');
      defer.resolve({
        status : 'ok',
        mongoResult : res,
        esResult : response
      });
    });
  });

  return defer.promise;
};


function handleError(err) {
  if (err) {
    console.log(err);
    throw err;
  }
}


module.exports = ThingESClient;
