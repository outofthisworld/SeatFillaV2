/*

For production


const fs = require('fs');

module.exports = {
    port: 443,
    ssl: {
        key: fs.readFileSync(process.cwd() + '/seatfilla.key'),
        cert: fs.readFileSync(process.cwd() + '/1_Intermediate.crt'),
    }
}*/