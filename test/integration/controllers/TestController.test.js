const request = require('supertest')
const assert = require('assert')
var parseString = require('xml2js').parseString

describe('TestControllerTests', function () {
  /*describe('GET Test/respondWithXml', function () {
    it('respond with xml', function (done) {
      request(sails.hooks.http.app)
        .post('/test/respondWithXml')
        .set('Accept', 'application/xml')
        .send({})
        .end(function (err, res) {
          if (err) {
            sails.log.error(err)
            return done(err)
          }

          sails.log.debug(res)
          // Try parse the xml to JSON structure
          parseString(res.text.replace('\ufeff', ''), function (err, result) {
            if (err) {
              sails.log.error(err)
              return done(err)
            }

            if (result) {
              sails.log.debug(result)
              // Check we can then stringify
              try {
                JSON.stringify(result)
                return done()
              } catch(err) {
                sails.log.error(err)
                return done(err)
              }
            }
          })
        })
    })
  })*/
})
