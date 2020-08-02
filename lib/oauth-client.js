const { HttpClient } = require('base-http-client')
const querystring = require('querystring')
const ClientCredentials = require('./client-credentials')
const UserCredentials = require('./user-credentials')
const StaqAccount = require('./staq-account')
const { AUTH_STAQ_OAUTH_HOST } = require('./constants')

class OauthClient extends HttpClient {
  constructor(authHost=AUTH_STAQ_OAUTH_HOST, options) {
    super(authHost, options)
  }

  /**
   * @returns {Promise<UserCredentials>}
   */
  async register(body, clientId, clientSecret) {
    const resp = await this.post('/v1/account', querystring.stringify({
      ...body,
      grant_type: 'password',
      client_id: clientId,
      client_secret: clientSecret
    }))
    return new UserCredentials(resp.body)
  }

  /**
   * @returns {Promise<UserCredentials>}
   */
  async passwordAuth(body, clientId, clientSecret) {
    const resp = await this.post('/v1/token', querystring.stringify({
      ...body,
      grant_type: 'password',
      client_id: clientId,
      client_secret: clientSecret
    }))
    return new UserCredentials(resp.body)
  }

  /**
   * @returns {Promise<UserCredentials>}
   */
  async refreshToken(refreshToken, clientId, clientSecret) {
    const resp = await this.post('/v1/token', querystring.stringify({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret
    }))
    return new UserCredentials(resp.body)
  }

  /**
   * @returns {Promise<StaqAccount>}
   */
  async getUserInfo() {
    const resp = await this.get(`/v1/userinfo`)
    return new StaqAccount(resp.body.data)
  }

  /**
   * @returns {Promise<ClientCredentials>}
   */
  async clientAuth(clientId, clientSecret) {
    const resp = await this.post('/v1/token', querystring.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    }))
    return new ClientCredentials(resp.body.access_token)
  }

  /**
   * @returns {Promise<UserCredentials>}
   */
  async authCodeExchange(code, clientId, clientSecret) {
    const resp = await this.post('/v1/token', querystring.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
    }))
    return new UserCredentials(resp.body)
  }

  async authCode(body) {
    return this.post('/v1/auth', body)
  }

  async registerWithAuthCode(body) {
    return this.post('/v1/account', body)
  }
}

module.exports = OauthClient
