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
        const vars={}
        $.views.allowCode = true;
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
            abs:function(value,attrMapping){
                return Math.abs(value);
            },
            mulOf:function(value,value2){
                console.log(value);
                console.log(value2)
                console.log(value + ' is multiple of ' + value2 + ' ? '+ ((value % value2) == 0))
                return ((value % value2) == 0);
            },
            //Performs type coercion
            isLike(value1,value2){
                return value1==value2;
            },
            //no type coercion
            isExact(value1,value2){
                return value1===value2;
            },
            minimum:function(arr,attrMapping){
                return Math.min.apply(null, !attrMapping?arr:arr.map(function(item){return item[attrMapping]}));
            },
            maximum:function(arr,attrMapping){
                return Math.max.apply(null,!attrMapping?arr:arr.map(function(item){return item[attrMapping]}));
            },
            currentCurrencySymbol(){
                return $('#seatfilla_currencies option:selected').attr('data-symbol');
            },
            currentCurrencyCode(){
                return $('#seatfilla_currencies option:selected').attr('value');
            },
            log(string){
                console.log(string);
            },
            getvar: function(key) {
              return vars[key];
            }
        });
        $.views.tags({
            setvar: function(key, value) {
                vars[key] = value;
            }
        });
    }else{
        console.log('Could not extend view helpers, $ / $.views was not defined');
    }
   })(jQuery)
});