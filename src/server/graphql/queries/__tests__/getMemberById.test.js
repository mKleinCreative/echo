/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import factory from 'src/test/factories'
import {resetDB, runGraphQLQuery} from 'src/test/helpers'

import getMemberById from '../getMemberById'

const fields = {getMemberById}
const query = `
  query($id: ID!) {
    getMemberById(id: $id) {
      id chapter { id }
    }
  }
`

describe(testContext(__filename), function () {
  beforeEach(resetDB)

  it('returns correct member', async function () {
    const member = await factory.create('member')
    const variables = {id: member.id}
    const result = await runGraphQLQuery(fields, query, undefined, variables)
    expect(result.data.getMemberById.id).to.equal(member.id)
    expect(result.data.getMemberById.chapter.id).to.equal(member.chapterId)
  })

  it('throws an error if no matching user found', function () {
    const variables = {id: 'not.a.real.id'}
    const result = runGraphQLQuery(fields, query, undefined, variables)
    return expect(result).to.eventually.be.rejectedWith(/no such member/i)
  })

  it('throws an error if user is not signed-in', function () {
    const context = {currentUser: null}
    const variables = {id: 'not.a.real.id'}
    const result = runGraphQLQuery(fields, query, context, variables)
    return expect(result).to.eventually.be.rejectedWith(/not authorized/i)
  })
})
