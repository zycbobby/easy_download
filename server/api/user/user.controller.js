'use strict';

var _ = require('lodash');
var User = require('./user.model');
var co = require('co');
var jpush = require('../../util/jpush');

// Get list of users
exports.index = function(req, res) {
  User.find(function (err, users) {
    if(err) { return handleError(res, err); }
    return res.json(200, users);
  });
};

// Get a single user
exports.show = function(req, res) {
  User.findOne({ 'name' : req.params.username}, function (err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.send(404); }
    return res.json(user);
  });
};

// Creates a new user in the DB.
exports.create = function(req, res) {
  User.create(req.body, function(err, user) {
    if(err) { return handleError(res, err); }
    return res.json(201, user);
  });
};

// create or update a user
exports.createOrUpdate = function(req, res) {
  User.findOne({ 'name' : req.body.name }, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) {
      // create this user
      User.create(req.body, function(err, user) {
        if(err) { return handleError(res, err); }
        co(jpush.setDeviceTag(user.registerId, user.tags)).then(function(){
          return res.json(201, user);
        }).catch(function(err) {
          handleError(res, err);
        });
      });
    } else {
      var updated = _.merge(user, req.body);
      updated.save(function (err) {
        if (err) { return handleError(res, err); }
        co(jpush.setDeviceTag(user.registerId, user.tags)).then(function(){
          return res.json(200, user);
        }).catch(function(err) {
          handleError(res, err);
        });
      });
    }
  });

  // sync this with jpush server {registerId, tags}
};

// Updates an existing user in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  User.findById(req.params.id, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.send(404); }
    var updated = _.merge(user, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, user);
    });
  });
};

// Deletes a user from the DB.
exports.destroy = function(req, res) {
  User.findById(req.params.id, function (err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.send(404); }
    user.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
