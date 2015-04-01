db.oldItems.mapReduce(
    function(){ 
        if ( this.url.indexOf('shihuo') > -1) {
            emit(this.url.substring(0, this.url.indexOf('#')), this);    
        } else {
            emit(this.url, this);    
        }
        
    }, 
    function(key, values){ 
        if ( key.indexOf('shihuo') > -1) {
            return values[0];
        } else {
            console.log('it should never reach');
            return values[0];
        }
    }, 
    { 
        query : {}, 
        out : "newItems"
    }
)