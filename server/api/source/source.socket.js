/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Source = require('./source.model');

exports.register = function(socket) {
  Source.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Source.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('source:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('source:remove', doc);
}