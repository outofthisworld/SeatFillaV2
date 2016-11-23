const fs = require('fs'),
    temp = require('temp'),
    path = require('path')

module.exports = {
    readJsonFileAsync(path) {
        const self = this
        return new Promise(function(resolve, reject) {
            self.readFileUTF8Async(path, function(err, data) {
                if (err) {
                    sails.log.error(err)
                    return reject(err)
                } else {
                    return resolve(self.safeParseJsonAsync(data))
                }
            })
        })
    },
    writeJsonFileAsync(path, data) {
        return this.writeFileUTF8Async(path, JSON.stringify(data))
    },
    createTempDir(dirName) {
        return new Promise(function(resolve, reject) {
            temp.mkdir(dirName, function(err, dirPath) {
                if (err) {
                    sails.log.error(err)
                    reject(err)
                } else {
                    resolve(dirPath)
                }
            })
        })
    },
    writeToDir(dirPath, fileName, data) {
        return new Promise(function(resolve, reject) {
            var inputPath = path.join(dirPath, fileName)
            fs.writeFile(inputPath, data, function(err) {
                if (err) {
                    sails.log.error(err)
                    reject(err)
                } else {
                    resolve({
                        dirPath,
                        fileName,
                        fullpath: inputPath
                    })
                }
            })
        })
    },
    createTempDirAndWrite(dirName, fileName, data) {
        const _self = this

        return _self.createTempDir(dirName).then(function(dirPath) {
            return _self.writeToDir(dirPath, fileName, data).then(function(obj) {
                return Promise.resolve(obj)
            }).catch(function(err) {
                sails.log.error(err)
                return Promise.reject(err)
            })
        })
    },
    createTempDirAndWriteJson(dirName, fileName, data) {
        const _self = this
        return _self.createTempDirAndWrite(dirName, fileName, JSON.stringify(data))
    },
    readFromDir(dirPath, fileName) {
        const _self = this
        var inputPath = path.join(dirPath, fileName)
        return _self.readFileUTF8Async(inputPath);
    },
    readFileUTF8Async: function(path) {
        return this.readFileAsync(path, 'utf8')
    },
    readFileAsync: function(path, fileEncoding) {
        return new Promise(function(resolve, reject) {
            fs.readFile(path, fileEncoding, function(err, data) {
                if (err) {
                    sails.log.debug('Error reading ' + path + ' error: ' + err)
                    sails.log.error(err)
                    return reject(err)
                } else {
                    return resolve(data)
                }
            })
        })
    },
    writeFileUTF8Async: function(path, data) {
        return this.writeFileAsync(path, data, 'utf8')
    },
    writeFileAsync: function(path, data, encoding) {
        return new Promise(function(resolve, reject) {
            fs.writeFile(path, data, encoding, function(err) {
                if (err) {
                    sails.log.debug('Error writing ' + path + ' error: ' + err)
                    sails.log.error(err)
                    return reject(err)
                }
                return resolve(true)
            })
        })
    },
    safeParseJsonAsync: function(json) {
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.parse(json))
            } catch (err) {
                sails.log.error(err)
                reject(err)
            }
        })
    },
    writeBinaryFile(path, data, callback) {
        const wstream = fs.createWriteStream(path)
        wstream.on('finish', function() {
            callback(path)
        })
        wstream.write(data)
        wstream.end()
    },
    /* Convenience method to read a JSON file, parse the JSON as a javascript object,
  *  pass it to a callback, allow the object to be modified by the callee
  *  and passed back via a callback. The passed back json file then gets stringified
  *  and written to disk. Should an error occur when writing to disk an error callback is triggered,
  *  otherwise the operation completes succesfully.

    Example...
    require('../../FileUtils').modJson('/File', function(err, jsonObject, done) {
        if (err) { //Error logging to file
            sails.log.error(err);
        } else {
            jsonObj.something.append(errorDetails);
            return done(jsonObject, function done(err){

            })
        }
    })
  */
    modJson(path, callback) {
        const _this = this;

        function triggerCallback(func, args) {
            if (func && typeof func == 'function') func.apply(null, args)
        }
        _this.readJsonFileAsync(path)
            .then(function(jsonObject) {
                return triggerCallback(callback, [null, jsonObject, function done(object, done) {
                    _this.writeJsonFileAsync(path, object).then(function(result) {
                        return triggerCallback(done, [null, result]);
                    }).catch(function(err) {
                        return triggerCallback(done, [err, null]);
                    })
                }])
            }).catch(function(err) {
                return triggerCallback(callback, [err, null, function() {}])
            })
    }
}