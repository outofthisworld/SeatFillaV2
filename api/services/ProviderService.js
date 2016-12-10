const timeUtils = require('../utils/TimeUtils')

module.exports = {
  login(req, apiKey, apiSecret) {
    if (!req.user)
      Promise.reject(new Error('User must be logged in'))

    if (!apiKey || !apiSecret || !req)
      return Promise.reject(new Error('Invalid params to ProviderService.js/login'))

    if (req.session.providerlogin && req.session.providerlogin.isAuthenticated) {
      return Promise.resolve(req.session.providerlogin)
    }

    sails.log.debug('Checking API key : ' + apiKey + ' for provider login')

    return new Promise(function (resolve, reject) {
      ApiService.verifyApiToken({
        sfKey: apiSecret,
        tokenParam: apiKey
      }, function (err, decoded, token, apiUser) {
        if (!err && apiUser) {
          sails.log.debug('Successfully verified token for api user :' + JSON.stringify(apiUser))
          sails.log.debug('token was ' + JSON.stringify(token))
          sails.log.debug('decoded is : ' + JSON.stringify(decoded))

          req.session.providerlogin = {
            isAuthenticated: true,
            apiKey,
            apiUser,
            decodedToken: decoded,
            token,
            authenticationTime: new Date()
          }
          resolve(req.session.providerlogin)
        } else {
          sails.log.error(err)
          return reject(new Error('Invalid API key'))
        }
      })
    })
  },
  hasPermission(str) {
    return !!(this.getApiUser(req).permissions.find(function (perm) {
      return perm == str
    }))
  },
  isAuthenticated(req) {
    if (!req || !req.session) throw new Error('Invalid params to ProviderService.js/isAuthenticated')

    return req.session.providerlogin &&
      req.session.providerlogin.isAuthenticated
  },
  getApiUser(req) {
    if (!req || !req.session) throw new Error('Invalid params to ProviderService.js/isAutenticated')

    if (!this.isAuthenticated(req)) throw new Error('Invalid params to ProviderService.js/getApiUser, user must be authenticated')

    return (req.session.providerlogin && req.session.providerlogin.apiUser)
  },
  getApiKey(req) {
    if (!req || !req.session) throw new Error('Invalid params to ProviderService.js/getApiKey')

    if (!this.isAuthenticated(req)) throw new Error('Invalid params to ProviderService.js/getApiKey, user must be authenticated')

    return req.session.providerlogin.apiKey
  },
  getAuthenticationTime(req) {
    if (!req || !req.session) throw new Error('Invalid params to ProviderService.js/getAuthenticationTime')

    if (!this.isAuthenticated(req)) throw new Error('Invalid params to ProviderService.js/getAuthenticatedTime, user must be authenticated.')

    return new Date().getTime() - new Date(req.session.providerlogin.authenticationTime).getTime()
  },
  logout(req) {
    if (!req || !req.session)
      throw new Error('Invalid params to ProviderService.js/logout')

    delete req.session.providerlogin
    if (req.user) req.user.logout(req)
  },
  hasSessionExpired(req) {
    if (!req || !req.session) throw new Error('Invalid params to ProviderService.js/hasSessionExpired')

    sails.log.debug('Checking expired:')
    sails.log.debug(JSON.stringify(req.session.providerlogin))

    if (!this.isAuthenticated(req) ||
      timeUtils.millisecondsToMinutes(this.getAuthenticationTime(req)) >= 30) {
      return true
    } else {
      return false
    }
  }
}
