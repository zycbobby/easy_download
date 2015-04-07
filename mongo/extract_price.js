var cur = db.getCollection('things').find({});
var rmb1 = {
    pattern : /((\d+[\.\d]*)元)/g,
    unit : '元'
    };
    
var rmb2 = {
    pattern : /(￥(\d+))/g,
    unit : '￥'
    };
    
var rmb3 = {
    pattern : /(¥(\d+))/g,
    unit : '¥'
    };

var usd1 = {
    pattern : /(\$(\d+[\.\d]*))/g,
    unit : '$'
    };

cur.forEach(function(thing) {
    printjson("======================================================================");
    if (thing.info.price.price.match(rmb1.pattern))
    {
        var guessPrice = thing.info.price.price.match(rmb1.pattern);
        db.things.update({ "_id" : thing._id}, { $set : { "info.price.guessprice" :  guessPrice[guessPrice.length - 1].replace(rmb1.unit, ''), "info.price.unit" :  "rmb" }});
    }
    else 
    if (thing.info.price.price.match(rmb2.pattern))
    {
        var guessPrice = thing.info.price.price.match(rmb2.pattern);
        db.things.update({ "_id" : thing._id}, { $set : { "info.price.guessprice" :  guessPrice[guessPrice.length - 1].replace(rmb2.unit, ''), "info.price.unit" :  "rmb" }});
    }
    else 
    if (thing.info.price.price.match(rmb3.pattern))
    {
        var guessPrice = thing.info.price.price.match(rmb3.pattern);
        db.things.update({ "_id" : thing._id}, { $set : { "info.price.guessprice" :  guessPrice[guessPrice.length - 1].replace(rmb3.unit, ''), "info.price.unit" :  "rmb" }});
    }    
    else 
    if (thing.info.price.price.match(usd1.pattern))
    {
        var guessPrice = thing.info.price.price.match(usd1.pattern);
        db.things.update({ "_id" : thing._id}, { $set : { "info.price.guessprice" :  guessPrice[guessPrice.length - 1].replace(usd1.unit, ''), "info.price.unit" :  "usd" }});
    }
    else
    {
        db.things.update({ "_id" : thing._id}, { $set : { "info.price.guessprice" :  0, "info.price.unit" :  "rmb" }});
    }
})