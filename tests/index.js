const Promise = require('bluebird')
const assert = require('assert')
const request = require('supertest')
const chai = require('chai')
chai.should()
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const path = require('path')
const fs = Promise.promisifyAll(require('fs'))
const server = require('../')
const { describe, it } = require('mocha')
const faker = require('faker')

describe('api', () => {
  describe('user create, confirm, signin, edit, change, reset passord, email, confirm, delete', () => {
    it('should fail for unknown handler', async (done) => {
      const body = {
        firstName: faker.name.firstName,
        lastName: faker.name.lastName,
        email: faker.internet.email(),
        action: 'USER_CREATE'
      }

      request(server).post('/').set('Content-Type', 'application/json').send(body).then((res) => {
        res.status.should.eql(500)
        done()
      }).catch((e) => {
        console.log(e)
      })
    })
  })

  describe('can signin, extend, delete token', () => {
  })

  describe('referral system', () => {
  })
})
