/**
 * @property {String} id
 * @property {String} username
 * @property {String} password
 */
class CiToken {
  constructor({ id, username, password }) {
    this.username = username
    this.password = password
    
    this.id = id
  }
}

module.exports = CiToken
