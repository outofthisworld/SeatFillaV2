/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 * return res.ok(data, 'auth/login');
 *
 * @param  {Object} data
 * @param  {String|Object} options
 *          - pass string to render specified view
 */

const data2xml = require('data2xml');
const convert = data2xml({});

module.exports = function sendOK(data, options) {

   

    // Get access to `req`, `res`, & `sails`
    var req = this.req;
    var res = this.res;
    var sails = req._sails;


    sails.log.silly('res.ok() :: Sending 200 ("OK") response');

    // Set status code
    res.status(200);

    //Send json repsonse if req.wantsXML
    if(req.wantsXML){
        sails.log.debug('wants xml');
        sails.log.debug(JSON.stringify(data))
        sails.log.debug(convert( 'root', data))
        res.set({'Content-Type':'application/xml'})
        return res.send(200,convert((options && options.xmlRoot) 
        || req.options.controller || req.options.model || 'root',data).replace("\ufeff", ""));
    }

    
    // If second argument is a string, we take that to mean it refers to a view.
    // If it was omitted, use an empty object (`{}`)
    options = (typeof options === 'string') ? { view: options } : options || {};

    // If appropriate, serve data as JSON(P)
    // If views are disabled, revert to json
    if (!options.renderHtml && req.wantsJSON || sails.config.hooks.views === false) {
        return res.jsonx(data);
    }

    if(options.renderHtml){
        req.options.layout = null;
        res.locals.layout = null;
    }

    const final = { data:data, options: options };
    
  
    if (final.options.layout) final.layout = final.options.layout;
    if (final.options.title) final.title = final.options.title;


    // If a view was provided in options, serve it.
    // Otherwise try to guess an appropriate view, or if that doesn't
    // work, just send JSON.
    if (options.view) {
        return res.view(options.view, final);
    }

    // If no second argument provided, try to serve the implied view,
    // but fall back to sending JSON(P) if no view can be inferred.
    else return res.guessView(final, function couldNotGuessView() {
        delete data.userprofile;
        return res.jsonx(data);
    });

};