const fs = require('fs');

module.exports = {
    readJsonFileAsync(path, callback) {
        const self = this;
        this.readFileUTF8Async(path, function(err, data) {
            if (err) {
                return cb(err, null);
            } else {
                return self.safeParseJsonAsync(data).then(function(jsonData) {
                    return cb(null, jsonData);
                }).catch(callback);
            }
        });
    },
    readFileUTF8Async: function(path, callback) {
        return this.readFileAsync(path, 'utf8', callback);
    },
    readFileAsync: function(path, fileEncoding, callback) {
        fs.readFile(path, fileEncoding, function(err, data) {
            if (err) {
                sails.log.debug('Error reading ' + path + ' error: ' + err)
                return callback(err, null);
            } else {
                return callback(null, data);
            }
        });
    },
    writeFileUTF8Async: function(path, data, callback) {
        return this.writeFileAsync(path, data, 'utf8', callback);
    },
    writeFileAsync: function(path, data, encoding, callback) {
        fs.writeFile(path, data, encoding, function(err) {
            if (err) {
                sails.log.debug('Error writing ' + path + ' error: ' + err)
            }
            return callback(err);
        });
    },
    safeParseJsonAsync: function(json) {
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.parse(json));
            } catch (err) {
                reject(err);
            }
        });
    },
    writeBinaryFile(path, data, callback) {
        const wstream = fs.createWriteStream(path);
        wstream.on('finish', function() {
            callback(path);
        });
        wstream.write(data);
        wstream.end();
    }
}