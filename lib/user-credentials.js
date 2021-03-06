const Token = require('./token')

/**
 * @property {Token} accessToken
 * @property {Token} refreshToken
 * @property {String} accountId
 */
class UserCredentials {
  constructor({ access_token: accessToken, refresh_token: refreshToken } ) {
    this.accessToken = new Token(accessToken)
    this.refreshToken = null
    if (refreshToken) {
      this.refreshToken = new Token(refreshToken)
    }
    this.accountId = this.accessToken.sub
  }

  get isValid() {
    return !this.accessToken.isExpired
  }

  get isExpired() {
    return this.accessToken.isExpired
  }

}

module.exports = UserCredentials
