//Some useful utility methods... 

module.exports = function(req,res,next){
    req.wantsXML = function(){
        return (req.xhr || req.socket) && (req.accepts("xml") || req.accepts("text/xml") ||
         req.accepts("application/xml") || req.allParams().xml);
    }
    req.xml = function(data){
        res.type("text/xml");
        return res.send(data); //here we will encode xml
    }
    res.push = function(view, data, redirect){
        res.status(200);
        if(req.wantsJSON()){
            return res.ok(data);
        }else if(req.wantsXML()){
            return req.xml(data); //Encode to xml here
        }else{
            if(redirect) res.redirect(view);
            return res.view(view, data);
        }
    }
    res.pushBad = function(err,view,options){
        if(err && (req.xhr || req.wantsJSON() || (req.wantsXML() && !view))) return res.negotiate(err);
        else return res.view(view,options);
    }
    next();
}