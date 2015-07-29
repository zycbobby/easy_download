'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('../config/environment');
var co = require('co');
var Promise = require('bluebird');
var JPush = require('jpush-sdk');
var client = JPush.buildClient(config.jpush.appKey, config.jpush.masterSecret);

function push(tags, thing) {
  client.push().setPlatform('android')
    .setAudience(JPush.tag(tags))
    .setNotification('Hi, JPush', JPush.android('android alert', null, 1))
    .send(function (err, res) {
      if (err) {
        console.log(err.message);
      } else {
        console.log('Sendno: ' + res.sendno);
        console.log('Msg_id: ' + res.msg_id);
      }
    });
}

function getDeviceTagAlias(registerId) {
  return new Promise((resolve, reject) => {
    client.getDeviceTagAlias(registerId, function(err, body) {
      err?reject(err):resolve(body);
    })
  });
}

function* clearDeviceTags(registerId) {
  return new Promise((resolve, reject) => {
    client.updateDeviceTagAlias(registerId, null, true, [],[], function(err, statusCode){
      err?reject(err):resolve(statusCode);
    });
  });
}

function* setDeviceTag(registerId, tags) {
  var deleteTagsStatusCode = yield clearDeviceTags(registerId);
  return new Promise((resolve, reject) => {
    client.updateDeviceTagAlias(registerId, null, false, tags, [], function(err, body){
      err?reject(err):resolve(body);
    });
  })
}


/**
 * send notification use RegisterId
 * @param registerId
 * @param thing
 */
function* sendWithRegisterId(registerId, thing) {

}

/**
 * send notification use tag
 * @param tag
 * @param thing
 */
function* sendWithTag(tag, thing) {

}

/**
 * This function is just for testing, set tags
 * @param registerId
 * @param tags
 */
//function* testSetTag(registerId, tags) {
//  var tagsBeforeAdded = yield getDeviceTagAlias(registerId);
//  console.log(tagsBeforeAdded);
//  var ret = yield setDeviceTag(registerId, tags);
//  console.log(ret);
//  var tagsAfterAdded = yield getDeviceTagAlias(registerId);
//  console.log(tagsAfterAdded);
//}
//
//
//co(testSetTag('0702d6fe4a6', ['tag1'])).catch(function(err) {
//  console.log(err);
//});


// 0702d6fe4a6

module.exports = {
  setDeviceTag: setDeviceTag
};
