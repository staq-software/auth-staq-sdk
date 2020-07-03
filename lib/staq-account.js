/**
 * @property {String} id
 * @property {String} email
 * @property {String} firstName
 * @property {String} lastName
 * @property {Date} lastLogin
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
class StaqAccount {
  constructor({ id, email, firstName, lastName, lastLogin, createdAt, updatedAt }) {
    this.id = id
    this.email = email
    this.firstName = firstName
    this.lastName = lastName
    this.lastLogin = new Date(lastLogin)

    if (createdAt) {
      this.createdAt = new Date(createdAt)
    }
    if (updatedAt) {
      this.updatedAt = new Date(updatedAt)
    }
  }
}

module.exports = StaqAccount