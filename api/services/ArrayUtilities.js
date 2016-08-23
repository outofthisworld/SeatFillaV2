/*
    Created by Dale
*/

module.exports = {
   //Flattens an array recursively
    _flatten:function(arr) {
    if (!arr instanceof Array) return arr;

    function flatten(arr, g) {
        for (var i = 0; i < arr.length; i++) {
        if (arr[i] instanceof Array) {
            flatten(arr[i], g);
        } else {
            g.push(arr[i]);
        }
        }
        return g;
    }

    return flatten(arr, []);
    },

    //Flat reduces an array recursilvely
    _flatReduce:function(list){
    return list.reduce(function(prev,cur,indx){
            var prevArray,curArray = false;
            if(Array.isArray(prev)){ prevArray=true; return _flatReduce(prev) +  cur;}
            else if(cur instanceof Array){ curArray=true; return _flatReduce(cur) + prev;}
            else if(prevArray && curArray) return _flatReduce(prev) + _flatReduce(cur);
            else return prev+cur;
        });
    }
}