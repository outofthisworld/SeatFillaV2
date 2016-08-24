/**
 * Winston logger for debugging.
 * Created by Dale.
 */

const winston = require('winston');

const logger = new(winston.Logger)({
  transports: [
    new (winston.transports.Console)({})
   
  ]
});

module.exports.log = {
   level: 'debug',
   colorize: true,
   //custom: logger
};
