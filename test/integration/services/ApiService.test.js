const assert = require('assert')



describe('AuthController tests', function () {

  // Note it is really hard to make these independent tests.. so if generate API token fails
  // it is likely that verifying the token will fail too.
  describe('generate and verify API token', function () {

    // Shared among both tests.
    var apiToken = ''
    const secret = 'oursharedsecret'

    it('generates api token', function (done) {
      // Construct our request  
      const req = {}
      req.body = {}
      req.body.sfKey = secret
      ApiService.createApiToken(req, {
        id: 1,
        permissions: ['all'],
        iat: Math.floor(new Date().getTime() / 1000) - 30,
        aud: 'SeatFilla',
        sub: 'SeatfillaApiToken'
      }, function createdToken (err, token) {
        if (err) return done(err)
        apiToken = token
        return done()
      })
    })

    it('verifies api token', function (done) {
      const req = {
        headers: {'x-access-token': apiToken,'x-seatfilla-key': secret},
        param: function (key) {
          return 0
        }
      }
      ApiService.verifyApiToken(req, function decoded (err, decodedToken, token) {
        if (err) return done(err)
        assert(!err)
        assert(apiToken === token)
        sails.log.debug(decodedToken)

        assert(decodedToken.id === 1)
        assert(Array.isArray(decodedToken.permissions))
        assert(decodedToken.permissions[0] === 'all')
        assert(decodedToken.aud === 'SeatFilla')
        assert(decodedToken.sub === 'SeatfillaApiToken')

        return done()
      })
    })
  })
})
