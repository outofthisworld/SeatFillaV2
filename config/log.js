/**
 * Winston logger for debugging.
 * Created by Dale.
 */

const winston = require('winston');

const logger = new(winston.Logger)({
  transports: [
    new (winston.transports.Console)({}),
    new (winston.transports.File)({
      filename: 'seatfilla.log',
      level: 'verbose',
      json: false,
      colorize: true
    })
  ]
});

module.exports.log = {
   level: 'silly',
   colorize: true,
   custom: logger
};
