'use strict';

var express = require('express');
var controller = require('./user.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:registerId', controller.show);
router.post('/', controller.create);
router.put('/', controller.createOrUpdate);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
