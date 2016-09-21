const fs = require('fs');

module.exports = {
    port: 443,
    ssl: {
        key: fs.readFileSync(process.cwd() + '/seat-filla.key'),
        cert: fs.readFileSync(process.cwd() + '/2_seat-filla.com.crt'),
        passphrase: 'lifeislife'
    }
}