'use strict';

var _ = require('lodash');
var History = require('./history.model');
var Query = require('../query/query.model');
var User = require('../user/user.model');
var segmentTool = require('../../util/segmentation');
var co = require('co');

// Get list of historys
exports.index = function (req, res) {
  var userId = req.query.userId;
  if (userId) {


    History.find({ 'user' : userId}).populate('query').exec(function (err, historys) {
        if(err) { return handleError(res, err); }
        return res.json(200, historys);
      });

  } else {
    History.find().populate('query').exec(function (err, historys) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, historys);
    });
  }

};

// Get a single history
exports.show = function (req, res) {
  History.findById(req.params.id, function (err, history) {
    if (err) {
      return handleError(res, err);
    }
    if (!history) {
      return res.send(404);
    }
    return res.json(history);
  });
};

// Creates a new history in the DB.
exports.create = function (req, res) {
  History.create(req.body, function (err, history) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(201, history);
  });
};

// Updates an existing history in the DB.
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  History.findById(req.params.id, function (err, history) {
    if (err) {
      return handleError(res, err);
    }
    if (!history) {
      return res.send(404);
    }
    var updated = _.merge(history, req.body);
    updated.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, history);
    });
  });
};

// Deletes a history from the DB.
exports.destroy = function (req, res) {
  History.findById(req.params.id, function (err, history) {
    if (err) {
      return handleError(res, err);
    }
    if (!history) {
      return res.send(404);
    }
    history.remove(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};


/**
 * findOrCreate query
 * add them to the user queries
 *
 * @param req
 * @param res
 */
exports.performSearch = function (req, res) {

  co(function* () {
    var parsedTerm = yield segmentTool.explain(req.body.keyword);
    var q = {
      parsedTerm: parsedTerm
    };
    var query = yield Query.createOrUpdate(q);
    var user = yield User.findByToken(req.body.user.token);
    var _h = {
      user: user._id,
      query: query._id
    };

    History.findOne(_h).exec(function(err, history){
      if (err) {
        return handleError(res, err);
      }
      if (history) {
        return res.json(200, history);
      }
      History.create(_h, function (err, history) {
        if (err) {
          return handleError(res, err);
        }
        history.populate(['query'], function (err, history) {
          return res.json(201, history);
        });
      });
    })

  }).catch(function (e) {
    console.log(e.stack);
  });

};

function handleError(res, err) {
  return res.send(500, err);
}
