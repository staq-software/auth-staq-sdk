const { suite, test } = require('mocha')
const { assert } = require('chai')
const { jwtFactory } = require('./utils/factories')

const { UserCredentials } = require("../index")

suite('userCredentials', function() {
  test('check validity', function() {
    const accessToken = jwtFactory()
    const creds = new UserCredentials({ access_token: accessToken })
    assert.isTrue(creds.isValid)
    assert.isFalse(creds.isExpired)
  })

  test('conditional refresh token', function() {
    const jwt = jwtFactory()
    const credsWithOutRefresh = new UserCredentials({ access_token: jwt })
    const credsWithRefresh = new UserCredentials({ access_token: jwt, refresh_token: jwt })

    assert.isNull(credsWithOutRefresh.refreshToken)
    assert.isNotNull(credsWithRefresh.refreshToken)
  })
})
