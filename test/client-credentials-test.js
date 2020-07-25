const { suite, test } = require('mocha')
const { assert } = require('chai')

const { jwtFactory } = require('./utils/factories')

const { ClientCredentials } = require("../index")

suite('clientCredentials', function() {
  test('check validity', function() {
    const accessToken = jwtFactory()
    const creds = new ClientCredentials(accessToken)
    assert.isTrue(creds.isValid)
    assert.isFalse(creds.isExpired)
  })
})
