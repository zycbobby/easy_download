/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
var mongoose = require('mongoose-q')(require('mongoose'));
var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');

User.findQ().then(function(data) {
  return User.removeQ();
}).then(function(){
  return User.createQ(
    {
      provider: 'local',
      name: 'Test User',
      email: 'test@test.com',
      password: 'test'
    }, {
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin'
    }
  )
}).then(function(){
  return Thing.removeQ();
}).then(function(){
  return User.findOneQ({
    name : 'Admin'
  });
}).then(function(admin) {
  return Thing.createQ({
    name : 'Development Tools',
    info : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.',
    url : 'http://www.baidu.com',
    ownerInfo : {
      userId : admin._id
    }
  });
}).done();
