const { suite, test } = require('mocha')
const { assert } = require('chai')
const { jwtFactory } = require('./utils/factories')

const { CredentialFactory } = require("../index")

suite('credentialFactory', function() {
  test('creates client credentials', function() {
    const accessToken = jwtFactory({ sub: 1, clientId: 1})
    const creds = CredentialFactory.getCredentials({ access_token: accessToken})
    assert.equal(creds.constructor.name, 'ClientCredentials')
  })

  test('creates user credentials', function() {
    const accessToken = jwtFactory()
    const creds = CredentialFactory.getCredentials({ access_token: accessToken})
    assert.equal(creds.constructor.name, 'UserCredentials')
  })
})
