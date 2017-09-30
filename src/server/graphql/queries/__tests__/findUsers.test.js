/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import factory from 'src/test/factories'
import {resetDB, runGraphQLQuery, useFixture} from 'src/test/helpers'

import findUsers from '../findUsers'

const fields = {findUsers}
const query = `
  query($identifiers: [String]) {
    findUsers(identifiers: $identifiers) {
      id name handle avatarUrl
      chapter { id name }
    }
  }
`

describe(testContext(__filename), function () {
  beforeEach(resetDB)

  beforeEach('Create current user', async function () {
    this.currentUser = await factory.build('user')
    this.users = await factory.buildMany('user', 3)
    this.member = await factory.create('member', {id: this.users[0].id})
    await factory.createMany('member', 5) // extra members
  })

  it('returns correct users with resolved chapters for identifiers', async function () {
    const member = this.member
    const user = this.users[0]
    useFixture.nockIDMFindUsers([user])
    const context = {currentUser: this.currentUser}
    const variables = {identifiers: [member.id]}
    const result = await runGraphQLQuery(fields, query, context, variables)
    expect(result.data.findUsers.length).to.equal(1)
    const [returned] = result.data.findUsers
    expect(returned.id).to.equal(user.id)
    expect(returned.name).to.equal(user.name)
    expect(returned.avatarUrl).to.equal(user.avatarUrl)
    expect(returned.chapter.id).to.equal(member.chapterId)
  })

  it('throws an error if user is not signed-in', function () {
    const context = {currentUser: null}
    const result = runGraphQLQuery(fields, query, context)
    return expect(result).to.eventually.be.rejectedWith(/not authorized/i)
  })
})
