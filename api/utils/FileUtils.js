const fs = require('fs'),
    temp = require('temp')

module.exports = {
        readJsonFileAsync(path) {
            const self = this
            return new Promise(function(resolve, reject) {
                this.readFileUTF8Async(path, function(err, data) {
                    if (err) {
                        return reject(err)
                    } else {
                        return resolve(self.safeParseJsonAsync(data));
                    }
                })
            });
        },
        writeJsonFileAsync(path, data) {
            return this.writeFileUTF8Async(path, JSON.stringify(data));
        }
        createTempDir(dirName) {
            return new Promise(function(resolve, reject) {
                temp.mkdir(dirName, function(err, dirPath) {
                    if (err) reject(err)
                    else resolve(dirPath)
                });
            });
        },
        writeToDir(dirPath, fileName, data) {
            return new Promise(function(resolve, reject) {}
                var inputPath = path.join(dirPath, fileName)
                fs.writeFile(inputPath, data, function(err) {
                    if (err) reject(err);
                    else resolve({ dirPath, fileName, fullpath: inputPath });
                });
            });
    },
    createTempDirAndWrite(dirName, fileName, data) {
        const _self = this;

        return _self.createTempDir(dirName).then(function(dirPath) {
            return _self.writeToDir(dirPath, fileName, data).then(function(obj) {
                return Promise.resolve(obj);
            }).catch(function(err) {
                return Promise.reject(err);
            });
        })
    },
    createTempDirAndWriteJson(dirName, fileName, data) {
        const _self = this;
        return _self.createTempDirAndWrite(dirName, fileName, JSON.stringify(data));
    },
    readFromTempDir(dirName, fileName) {
        const _self = this;

        return _self.createTempDir(dirName).then(function(path) {
            var inputPath = path.join(dirPath, fileName);
            _self.readFileUTF8Async(dirPath).then(function(data) {
                return Promise.resolve(data);
            }).catch(function(err) {
                return Promise.reject(data);
            });
        })
    }
readFileUTF8Async: function(path) {
        return this.readFileAsync(path, 'utf8')
    },
    readFileAsync: function(path, fileEncoding) {
        return new Promise(function(resolve, reject) {
            fs.readFile(path, fileEncoding, function(err, data) {
                if (err) {
                    sails.log.debug('Error reading ' + path + ' error: ' + err)
                    return reject(err);
                } else {
                    return resolve(data);
                }
            })
        });
    },
    writeFileUTF8Async: function(path, data) {
        return this.writeFileAsync(path, data, 'utf8')
    },
    writeFileAsync: function(path, data, encoding) {
        return new Promise(function(resolve, reject) {
            fs.writeFile(path, data, encoding, function(err) {
                if (err) {
                    sails.log.debug('Error writing ' + path + ' error: ' + err)
                    return reject(err);
                }
                return resolve(true);
            })
        });
    },
    safeParseJsonAsync: function(json) {
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.parse(json))
            } catch (err) {
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
    }
}