/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import factory from 'src/test/factories'
import {resetDB, runGraphQLQuery, useFixture} from 'src/test/helpers'

import getUser from '../getUser'

const fields = {getUser}
const query = `
  query($identifier: String!) {
    getUser(identifier: $identifier) {
      id name handle email avatarUrl profileUrl
      chapter { id name }
    }
  }
`

describe(testContext(__filename), function () {
  beforeEach(resetDB)

  beforeEach('Create current user', async function () {
    this.currentUser = await factory.build('user')
  })

  it('returns correct user with chapter for identifier', async function () {
    const user = this.currentUser
    const member = await factory.create('member', {id: user.id})
    await factory.createMany('member', 2) // extra members
    useFixture.nockIDMGetUser(user)

    const context = {currentUser: this.currentUser}
    const variables = {identifier: user.handle}

    const result = await runGraphQLQuery(fields, query, context, variables)

    const returned = result.data.getUser
    expect(returned.id).to.equal(user.id)
    expect(returned.handle).to.equal(user.handle)
    expect(returned.email).to.equal(user.email)
    expect(returned.avatarUrl).to.equal(user.avatarUrl)
    expect(returned.profileUrl).to.equal(user.profileUrl)
    expect(returned.chapter.id).to.equal(member.chapterId)
  })

  it('throws an error if user is not found', function () {
    useFixture.nockIDMGetUser(null)
    const context = {currentUser: this.currentUser}
    const variables = {identifier: 'fake.identifier'}
    const result = runGraphQLQuery(fields, query, context, variables)
    return expect(result).to.eventually.be.rejectedWith(/User not found/i)
  })

  it('throws an error if user is not signed-in', function () {
    const context = {currentUser: null}
    const variables = {identifier: ''}
    const result = runGraphQLQuery(fields, query, context, variables)
    return expect(result).to.eventually.be.rejectedWith(/not authorized/i)
  })
})
