/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import factory from 'src/test/factories'
import {resetDB, runGraphQLMutation} from 'src/test/helpers'
import {Member} from 'src/server/services/dataService'
import {ADMIN} from 'src/common/models/user'

import reassignMembersToChapter from '../reassignMembersToChapter'

const fields = {reassignMembersToChapter}
const mutation = `
  mutation($memberIds: [ID]!, $chapterId: ID!) {
    reassignMembersToChapter(memberIds: $memberIds, chapterId: $chapterId) { id }
  }
`

describe(testContext(__filename), function () {
  beforeEach(resetDB)

  it('updates member chapter', async function () {
    const chapter = await factory.create('chapter')
    const members = await factory.createMany('member', 2)
    const memberIds = members.map(p => p.id)

    const context = {currentUser: {roles: [ADMIN]}}
    const variables = {memberIds: members.map(p => p.id), chapterId: chapter.id}

    const result = await runGraphQLMutation(fields, mutation, context, variables)

    expect(
      result.data.reassignMembersToChapter.map(p => p.id).sort()
    ).to.deep.equal(
      memberIds.sort()
    )

    const updatedMembers = await Member.getAll(...memberIds)
    updatedMembers.forEach(p => (
      expect(p.chapterId).to.equal(chapter.id)
    ))
  })
})
