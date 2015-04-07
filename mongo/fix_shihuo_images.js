var cur = db.getCollection('things').find({ "info.images" : { $size : 0}})

cur.forEach(function(thing) {
    db.items.update({ "url" : thing.source}, { $set : { "crawled" : false}});
    db.things.remove( {"source" : thing.source});
})
