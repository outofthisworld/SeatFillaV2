const fs = require('fs');

modules.exports = {
    port: 443,
    ssl: {
        key: fs.readFileSync('seatfilla.key'),
        cert: fs.readFileSync('seatfilla.crt')
    }
}