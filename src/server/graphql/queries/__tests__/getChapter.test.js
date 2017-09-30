/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import factory from 'src/test/factories'
import {resetDB, runGraphQLQuery} from 'src/test/helpers'

import getChapter from '../getChapter'

const fields = {getChapter}
const query = `
  query($identifier: String!) {
    getChapter(identifier: $identifier) {
      id
      name
      channelName
    }
  }
`

describe(testContext(__filename), function () {
  beforeEach(resetDB)

  beforeEach('Create current user', async function () {
    this.currentUser = await factory.build('user')
  })

  it('returns correct chapter for identifier', async function () {
    const chapters = await factory.createMany('chapter', 2)
    const chapter = chapters[0]
    const context = {currentUser: this.currentUser}
    const variables = {identifier: chapter.id}
    const result = await runGraphQLQuery(fields, query, context, variables)
    const returned = result.data.getChapter
    expect(returned.id).to.equal(chapter.id)
    expect(returned.name).to.equal(chapter.name)
    expect(returned.channelName).to.equal(chapter.channelName)
  })

  it('throws an error if chapter is not found', function () {
    const context = {currentUser: this.currentUser}
    const variables = {identifier: ''}
    const result = runGraphQLQuery(fields, query, context, variables)
    return expect(result).to.eventually.be.rejectedWith(/Chapter not found/i)
  })

  it('throws an error if user is not signed-in', function () {
    const context = {currentUser: null}
    const variables = {identifier: ''}
    const result = runGraphQLQuery(fields, query, context, variables)
    return expect(result).to.eventually.be.rejectedWith(/not authorized/i)
  })
})
