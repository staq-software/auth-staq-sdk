const jwt = require('jsonwebtoken')

/**
 * @property {String} value
 * @property {Date} expiresAt
 */
class Token {
  constructor(value) {
    if (value.startsWith("Bearer ")){
      value = value.substring(7, value.length);
    }
    const decoded = jwt.decode(value)

    this.value = value
    this.expiresAt = new Date(decoded.exp * 1000)
    this.sub = decoded.sub
    this.clientId = decoded.clientId
    this.decoded = decoded
  }

  isValid(signature) {
    return jwt.verify(this.value, signature)
  }

  get isExpired() {
    return this.expiresAt <= new Date()
  }
}

module.exports = Token