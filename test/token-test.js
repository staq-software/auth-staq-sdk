const { suite, test } = require('mocha')
const { assert } = require('chai')
const { jwtFactory, DEFAULT_SIGNATURE } = require('./utils/factories')
const { addHour } = require('./utils/helpers')
const jsonwebtoken = require('jsonwebtoken')

const { Token } = require("../index")

suite('token', function() {
  test('isValid returns true for valid token', function() {
    const jwt = jwtFactory({}, DEFAULT_SIGNATURE)
    const token = new Token(jwt)
    assert.isTrue(token.isValid(DEFAULT_SIGNATURE))
  })

  test('isValid returns false for invalid token', function() {
    const jwt = jwtFactory({}, 'random')
    const token = new Token(jwt)
    assert.isFalse(token.isValid(DEFAULT_SIGNATURE))
  })

  test('verify returns jwt contents for valid jwt', function() {
    const jwt = jwtFactory({}, DEFAULT_SIGNATURE)
    const token = new Token(jwt)
    const contents = token.verify(DEFAULT_SIGNATURE)
    assert.equal(contents.sub, 1)
  })

  test('verify throws exception for invalid jwt', function() {
    const jwt = jwtFactory({}, 'random')
    const token = new Token(jwt)
    assert.throws(function() {
      token.verify(DEFAULT_SIGNATURE)
    })
  })

  test('isExpired returns false for valid token', function() {
    const jwt = jwtFactory({}, DEFAULT_SIGNATURE)
    const token = new Token(jwt)
    assert.isFalse(token.isExpired)
  })

  test('isExpired returns true for expired token', function() {
    const exp = addHour(new Date(), -3)
    const jwt = jwtFactory({ exp }, DEFAULT_SIGNATURE)
    const token = new Token(jwt)
    assert.isTrue(token.isExpired)
  })

  test('can decode token with Bearer prefix', function () {
    const jwt = jwtFactory()
    const token = new Token(`Bearer ${jwt}`)
    assert.isTrue(token.isValid(DEFAULT_SIGNATURE))
  })

  test('token contents', function () {
    const exp = addHour(new Date(), 1)
    const jwt = jwtFactory({ exp })
    const token = new Token(jwt)

    assert.equal(token.value, jwt)
    assert.deepEqual(token.expiresAt, new Date(exp))
    assert.equal(token.sub, 1)
    assert.equal(token.clientId, 2)
    assert.deepEqual(token.decoded, jsonwebtoken.decode(jwt))
  })
})
