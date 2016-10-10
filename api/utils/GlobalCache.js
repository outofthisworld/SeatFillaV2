/*
    A basic cache implementation for storing global data accross services.

    Created by Dale.
*/

const cacheObj = cacheObj || {};

const expirationPolicies = {

}

function GlobalCache(options) {
    if (!options) throw new Error('Invalid object passed to GlobalCache.js GlobalCache constructor');

    this.key = options.GlobalCache;
    this.ExpirationSettings = options.ExpirationSettings || {};
    this.Data = options.Data || {}
}

GlobalCache.prototype.getKey = function() {
    return this.key;
}

GlobalCache.prototype.checkKeyExists = function(key) {
    if (!cacheObj || !cacheObj[this.key] || !cacheObj[this.key]['Data'] || !cacheObj[this.key]['Data'][key])
        return false;

    return true;
}

GlobalCache.prototype.setKey = function(key) {
    if (!(this.key in cacheObj)) {
        cacheObj[this.key] = this;
    }

    const obj = cacheObj[this.key];
    delete cacheObj[this.key];

    cacheObj[key] = obj;
}

GlobalCache.prototype.getData = function(key) {
    if (this.checkKeyExists(key)) {
        return cacheObj[this.key]['Data'][key].value;
    } else {
        return null;
    }
}

GlobalCache.prototype.removeData = function(key) {
    if ('Data' in cacheObj[this.key]) {
        if (key in cacheObj[this.key]['Data']) {
            delete cacheObj[this.key]['Data'][key];
            return true;
        }
    } else {
        throw new Error('Invalid object state for GlobalCache in GlobalCache.js/removeData');
    }
}

GlobalCache.prototype.insertData = function(key, data) {
    if (this.ExpirationSettings.runExpirationPolicyOnInserts &&
        this.ExpirationSettings.runExpirationPolicyOnInserts())
        this.runExpirationPolicy();

    if ('Data' in cacheObj[this.key])
        cacheObj[this.key]['Data'][key] = data;
    else
        throw new Error('Invalid object state for GlobalCache in GlobalCache.js/insertData');
}

GlobalCache.prototype.setData = function(key, data) {
    if (this.checkKeyExists(key)) {
        cacheObj[this.key]['Data'][key].value = data;
    } else {
        return this.insertData(key, data);
    }
}

GlobalCache.prototype.deleteCache = function() {
    this.runExpirationPolicy();
    delete cacheObj[this.key];
}

GlobalCache.prototype.setExpirationPolicy = function(obj) {
    if (typeof obj == 'function') {
        this.expirationPolicy = obj;
    } else if (typeof obj == 'string') {
        if (!(obj in expirationPolicies))
            throw new Error('Invalid expiration policy passed to GlobalCache.js/setExpirationPolicy');
        this.expirationPolicy = expirationPolicies[obj];
    } else {
        throw new Error('Invalid type passed to setExpirationPolicy in GlobalCache.js');
    }
}

GlobalCache.prototype.runExpirationPolicy = function() {
    if (this.expirationPolicy && typeof this.expirationPolicy == 'function') {
        this.expirationPolicy();
    }
}

/*
    {
        GlobalCache: 'cacheName'
        Data:{
            dataKey:{
                value:''
            }
        }
        ExpirationPolicy: string || object
        ExpirationSettings:{
            runExpirationPolicyOnInserts:function(){
                return true;
            },
            runExpirationPolicyOnDelations:function(){
                return true;
            }
        }
    }
*/
module.exports = function(object) {
    if (!object || !object.GlobalCache) {
        throw new Error('Invalid params to exported function in GlobalCache.js. Object and Object.globalCache must exist');
    } else if (object.GlobalCache in cacheObj) {
        return cacheObj[object.GlobalCache]
    } else {
        var cache = new GlobalCache(object);
        cacheObj[object.GlobalCache] = cache;

        if (object.ExpirationPolicy) {
            cache.setExpirationPolicy(object.ExpirationPolicy);

            if (object.ScheduledExpirationPolicyTimeUnit) {
                ScheduledExecutorService.execute(object.GlobalCache + '-globalCache',
                    object.ScheduledExpirationPolicyInterval, object.ScheduledExpirationIntialDelay);
            }
        }
    }
}