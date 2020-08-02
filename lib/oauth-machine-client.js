const { HttpClient } = require('base-http-client')
const StaqAccount = require('./staq-account')
const { AUTH_STAQ_OAUTH_HOST } = require('./constants')

class OauthMachineClient extends HttpClient {
  constructor(authHost=AUTH_STAQ_OAUTH_HOST, options) {
    super(authHost, options)
  }

  /**
   * @returns {Promise<StaqAccount>}
   */
  async getAccount(accountId) {
    const resp = await this.get(`/v1/account/${accountId}`)
    return new StaqAccount(resp.body.data)
  }

  /**
   * @returns {Promise<Array<StaqAccount>>}
   */
  async getAccounts(query={}) {
    const resp = await this.get(`/v1/accounts`, query)
    return resp.data.map(account => new StaqAccount(account))
  }
}

module.exports = OauthMachineClient
