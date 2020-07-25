const jwt = require('jsonwebtoken')
const { addHour } = require('./helpers')

const DEFAULT_SIGNATURE = 'abc'

const jwtFactory = ({ sub=1, scope, clientId=2, exp }={}, signature= DEFAULT_SIGNATURE) => {
  const defaultExp = addHour(new Date(), 1)
  return jwt.sign({
    iss: 'test.staqsoftware.com',
    sub,
    scope,
    client_id: clientId,
    exp: (exp || defaultExp) / 1000
  }, signature)
}

module.exports = { jwtFactory, DEFAULT_SIGNATURE }
