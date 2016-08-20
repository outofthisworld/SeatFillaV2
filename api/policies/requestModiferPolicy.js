
module.exports = function(req,res,next){
    req.isPOST = function(){
        return req.method === "POST";
    }
    req.isGET = function(){
        return req.method === "GET";
    }
    req.isPUT = function(){
        return req.method === "PUT";
    }
    req.isDELETE = function(){
        return req.method === "DELETE";
    }
    next();
}