/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import factory from 'src/test/factories'
import {resetDB, runGraphQLMutation} from 'src/test/helpers'

import saveChapter from '../saveChapter'

const fields = {saveChapter}
const query = `
  mutation($chapter: InputChapter!) {
    saveChapter(chapter: $chapter) {
      id
      name
      channelName
      timezone
      githubTeamId
      inviteCodes
      createdAt
      updatedAt
    }
  }
`

describe(testContext(__filename), function () {
  beforeEach(resetDB)

  describe('saveChapter', function () {
    beforeEach('create member with admin role', async function () {
      this.user = await factory.build('user', {roles: ['admin']})
      this.member = await factory.create('member', {id: this.user.id})
    })

    it('creates a new chapter', async function () {
      const {
        name,
        channelName,
        timezone,
        inviteCodes,
      } = await factory.build('chapter', {name: 'justachaptername'})

      const context = {currentUser: this.user}
      const variables = {chapter: {name, channelName, timezone, inviteCodes}}

      const result = await runGraphQLMutation(fields, query, context, variables)

      const newChapter = result.data.saveChapter
      expect(newChapter).to.have.property('name').eq(name)
      expect(newChapter).to.have.property('channelName').eq(channelName)
      expect(newChapter).to.have.property('timezone').eq(timezone)
    })
  })
})
