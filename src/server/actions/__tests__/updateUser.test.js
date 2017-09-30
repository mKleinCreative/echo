/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import factory from 'src/test/factories'
import {resetDB, useFixture} from 'src/test/helpers'

import {LEARNER, STAFF} from 'src/common/models/user'

import updateUser from '../updateUser'

describe(testContext(__filename), function () {
  beforeEach(resetDB)

  beforeEach(function () {
    useFixture.nockClean()
  })

  it('returns correct user for identifier', async function () {
    const {Member} = require('src/server/services/dataService')

    const roles = [LEARNER]
    const user = await factory.build('user', {roles})
    const phase = await factory.build('phase')
    const member = await factory.create('member', {id: user.id, phaseId: phase.id})

    useFixture.nockIDMGetUser(user)

    const updateValues = {phaseNumber: null, roles: [STAFF, LEARNER]}
    const updatedUserValues = Object.assign({}, user, updateValues)
    useFixture.nockIDMUpdateUser(updatedUserValues)
    useFixture.nockIDMGetUser(updatedUserValues)

    const updatedIDMUser = await updateUser(user.id, updateValues)
    expect(updatedIDMUser.roles.sort()).to.deep.eql(updateValues.roles.sort())

    const updatedMember = await Member.get(member.id)
    expect(updatedMember.phaseId).to.eq(null)
  })
})
