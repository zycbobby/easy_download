/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var History = require('./history.model');

exports.register = function(socket) {
  History.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  History.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('history:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('history:remove', doc);
}