const fs = require('fs');

module.exports = {
    readFileUTF8Async:function(path, callback){
        return this.readFileAsync(callback,'utf8');
    },
    readFileAsync:function(path,fileEncoding,callback){
        fs.readFile(path,fileEncoding, function (err, data) {
        if (err) {
              sails.log.debug('Error reading ' + path + ' error: ' + err)
              return callback(err,null);
        }else {
              return callback(null,JSON.parse(data)); 
         }
        });
    },
    writeFileUTF8Async:function(path,data,callback){
        return this.writeFileAsync(path,data,'utf8',callback);
    },
    writeFileAsync:function(path,data,encoding,callback){
        fs.writeFile(path, data, encoding, function (err) {
            if (err) {
                sails.log.debug('Error writing ' + path + ' error: ' + err)
            }
            return callback(err);
        });
    },
    safeParseJsonAsync:function(json){
        new Promise((resolve,reject)=>{
            try{
                resolve(JSON.parse(json));
            }catch(err){
                reject(err);
            }
        });
    }
}