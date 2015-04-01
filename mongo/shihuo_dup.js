db.oldItems.mapReduce(
    function(){ 
        this.crawled = false;
        if ( this.url.indexOf('shihuo') > -1) {
            emit(this.url.substring(0, this.url.indexOf('#')), this);
        } else {
            emit(this.url, this);    
            
        }
        
    }, 
    function(key, values){ 
        return values[0];
    }, 
    { 
        query : {}, 
        out : "newItems"
    }
)