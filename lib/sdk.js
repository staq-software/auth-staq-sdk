const OauthClient = require('./oauth-client')
const OauthMachineClient = require('./oauth-machine-client')
const ClientCredentials = require('./client-credentials')
const CredentialFactory = require('./credential-factory')
const Token = require('./token')
const StaqAccount = require('./staq-account')
const CiToken = require('./ci-token')
const { AUTH_STAQ_OAUTH_HOST, AUTH_STAQ_HOST } = require('./constants')

class AuthStaqSdk {
  constructor(options) {
    const { clientId, clientSecret, redirectUri, clientSignature, authHost=AUTH_STAQ_OAUTH_HOST, authStaqHost=AUTH_STAQ_HOST } = options
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.clientSignature = clientSignature
    this.redirectUri = redirectUri
    this.authHost = authHost
    this.authStaqHost = authStaqHost
    this.cachedClientCredentials = null
  }

  authenticateUrl() {
    return `${this.authStaqHost}/authentication/sign-in?clientId=${this.clientId}&redirectUri=${this.redirectUri}`
  }

  /**
   * @returns {Promise<UserCredentials>}
   */
  async authCodeExchange(code) {
    const client = this.getOAuthApiClient()
    return client.authCodeExchange(code, this.clientId, this.clientSecret)
  }

  /**
   * @returns {Promise<UserCredentials>}
   */
  async passwordAuth(email, password) {
    const client = this.getOAuthApiClient()
    return client.passwordAuth({ username: email, password}, this.clientId, this.clientSecret)
  }

  /**
   * @returns {Promise<ClientCredentials>}
   */
  async getClientCredentials() {
    if (this.cachedClientCredentials && this.cachedClientCredentials.isValid) {
      return this.cachedClientCredentials
    }

    const clientCredentials = await this.getOAuthApiClient().clientAuth(this.clientId, this.clientSecret)
    this.cachedClientCredentials = clientCredentials
    return clientCredentials
  }

  /**
   *
   */
  getCredentials({ access_token, refresh_token }) {
    return CredentialFactory.getCredentials({ access_token, refresh_token })
  }

  /**
   * @param {UserCredentials} credentials
   * @returns {Promise<UserCredentials>}
   */
  async maybeRefresh(credentials) {
    if (!credentials.accessToken.isExpired) {
      return credentials
    }

    if (credentials.refreshToken.isExpired) {
      throw new Error("Access and refresh tokens are expireed")
    }

    return this.refreshAccessToken(credentials.refreshToken)
  }

  /**
   * @param {Token} refreshToken
   * @returns {Promise<UserCredentials>}
   */
  async refreshAccessToken(refreshToken) {
    const client = this.getOAuthApiClient()
    return client.refreshToken(refreshToken.value, this.clientId, this.clientSecret)
  }

  /**
   * @param {Token} accessToken
   * @returns {Promise<StaqAccount|*>}
   */
  async getUserInfo(accessToken) {
    if (accessToken.isExpired) {
      throw new Error("Access token is expired")
    }
    const client = this.getOAuthApiClient(accessToken)
    return client.getUserInfo()
  }

  /**
   * @returns {Promise<StaqAccount>}
   */
  async getAccount(accountId) {
    const credentials = await this.getClientCredentials()
    const client = this.getOAuthApiMachineClient(credentials.accessToken.value)
    return client.getAccount(accountId)
  }

  /**
   * @returns {Promise<CiToken>}
   */
  async registerCiToken({ username }) {
    const credentials = await this.getClientCredentials()
    const client = this.getOAuthApiMachineClient(credentials.accessToken.value)
    return client.registerCiToken({ username })
  }

  /**
   * @returns {Promise<UserCredentials>}
   */
  async createAccount({ firstName, lastName, email, password, confirmation}) {
    const client = this.getOAuthApiClient()
    return client.register({ username: email, password, firstName, lastName, confirmation }, this.clientId, this.clientSecret)
  }

  /**
   * @param {Token} token
   * @returns {Token}
   */
  verifyToken(token) {
    if (!this.clientSignature) {
      throw Error("Cannot verify token without clientSignature")
    }
    if (typeof token === "string") {
      token = new Token(token)
    }

    token.verify(this.clientSignature)
    return token
  }

  /**
   * @param {ClientCredentials} credentials
   */
  set clientCredentials(credentials) {
    this.cachedClientCredentials = credentials
  }

  /**
   * @returns {OauthClient}
   */
  getOAuthApiClient(accessToken) {
    let headerOptions = {}
    if (accessToken) {
      headerOptions['Authorization'] = `Bearer ${accessToken.value}`
    }
    const options = { requestOptions: { maxRedirects: 0 }, headerOptions }
    return new OauthClient(this.authHost, options)
  }

  /**
   * @returns {OauthMachineClient}
   */
  getOAuthApiMachineClient(accessToken) {
    if (!accessToken) {
      throw Error("Cannot get client without credentials")
    }
    const headerOptions = { Authorization: `Bearer ${accessToken}` }
    const options = { headerOptions }
    return new OauthMachineClient(this.authHost, options)
  }
}

module.exports = AuthStaqSdk
