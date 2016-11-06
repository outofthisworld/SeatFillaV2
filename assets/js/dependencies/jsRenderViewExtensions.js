/*
    Extends jsRender helper functions with custom methods
    that can be used within jsRender templates.

    All methods here will be defined globally for all views
    so should be as generic as possible.

    created by Dale.
*/
$(window).ready(function(){
   (function($){
    if($ && $.views){
        $.views.helpers({
            range:function(from,to){
                return Array.apply(null, Array( to-from < 0? 0:to-from )).map(function (_, i) {return i + from;});
            },
            floor:function(num){
                return Math.floor(num);
            },
            add:function(value1,value2){
                return value1+value2;
            },
            sub:function(value1,value2){
                return value1-value2;
            },
            mul:function(value1,value2){
                return value1*value2;
            },
            div:function(value1,value2){
                return value1/value2;
            },
            abs:function(value){
                return Math.abs(value);
            }
        });
    }else{
        console.log('Could not extend view helpers, $ / $.views was not defined');
    }
   })(jQuery)
});