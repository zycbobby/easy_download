/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
var mongoose = require('mongoose-q')(require('mongoose'));
var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Item = require('../api/item/item.model');
var Source = require('../api/source/source.model');

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
}).then(function(admin) {
  //return Thing.createQ({
  //  title : 'SHARP 夏普 KC-WB6-W 家用型 空气净化器+凑单品',
  //  source : 'http://www.smzdm.com/p/664363',
  //  info : {
  //    price : {
  //      price : 1787,
  //      unit : 'rmb'
  //    },
  //
  //    tags : ['KC-WB6-W', '防污染', '国内优惠','家用空气净化器'],
  //
  //    provider : {
  //      name : '苏宁易购',
  //      host : 'http://product.suning.com/',
  //      productUrl : 'http://product.suning.com/0000000000/102687666.html?utm_source=union&utm_medium=C&utm_campaign=4410&utm_content=4303',
  //    },
  //
  //    thumbs: {
  //      up : 7,
  //      down : 2
  //    },
  //
  //    images : [
  //      {
  //        url : 'http://y.zdmimg.com/201503/10/54fe484c9c86d.jpg_e600.jpg'
  //      },
  //      {
  //        url : 'http://ym.zdmimg.com/201503/30/5518ead1cd04a4898.png_e600.jpg'
  //      }
  //    ]
  //  }
  //
  //});
}).done();

Source.removeQ().then(function(){
  return Source.createQ({
    url : 'http://www.smzdm.com/p1'
  }, {
      url : 'http://www.shihuo.cn'
  }, {
    url : 'http://www.etao.com'
  });
}).done();

Item.removeQ().then(function(){
  // remove this because the crawler can create item now
  // return Item.createQ({
  //  url : 'http://www.smzdm.com/p/664363'
  //});

  return true;
}).done();
