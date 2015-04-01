var cursor = db.dupItems.find({});

var map = {};

cursor.forEach(function(cur) {
    var newurl = cur.url.indexOf('#') > -1?cur.url.substring(0, cur.url.indexOf('#')):cur.url
    if (!map[newurl])
    {
        db.items.insert({
            url : newurl,
            crawled : false,
            __v:cur.__v,
            type : cur.type
            });    
            
        map[newurl] = true;
        }
    
    });





