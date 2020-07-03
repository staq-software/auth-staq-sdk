const Token = require('./token')

/**
 * @property {Token} accessToken
 */
class ClientCredentials {
  constructor(accessToken) {
    this.accessToken = new Token(accessToken)
  }

  get isValid() {
    return !this.accessToken.isExpired
  }

  get isExpired() {
    return this.accessToken.isExpired
  }
}

module.exports = ClientCredentials