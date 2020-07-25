const Token = require('./token')
const ClientCredentials = require('./client-credentials')
const UserCredentials = require('./user-credentials')

class CredentialFactory {
  static getCredentials({ access_token: accessToken, refresh_token: refreshToken }) {
    const token = new Token(accessToken)
    if (token.sub && token.sub === token.clientId) {
      return new ClientCredentials(accessToken)
    }
    return new UserCredentials({ access_token: accessToken, refresh_token: refreshToken })
  }

}

module.exports = CredentialFactory
