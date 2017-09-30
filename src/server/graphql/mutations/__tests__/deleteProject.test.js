/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import factory from 'src/test/factories'
import {resetDB, runGraphQLMutation} from 'src/test/helpers'

import deleteProject from '../deleteProject'

const fields = {deleteProject}
const mutation = `
  mutation($identifier: String!) {
    deleteProject(identifier: $identifier) {
      success
    }
  }
`

describe(testContext(__filename), function () {
  beforeEach(resetDB)

  beforeEach('Create current user', async function () {
    this.currentUser = await factory.build('user', {roles: ['admin']})
  })

  it('returns success for valid identifier', async function () {
    const project = await factory.create('project')
    const context = {currentUser: this.currentUser}
    const variables = {identifier: project.id}
    const result = await runGraphQLMutation(fields, mutation, context, variables)
    expect(result.data.deleteProject.success).to.equal(true)
  })

  it('throws an error if user is not authorized', function () {
    const context = {currentUser: null}
    const variables = {identifier: ''}
    const result = runGraphQLMutation(fields, mutation, context, variables)
    return expect(result).to.eventually.be.rejectedWith(/not authorized/i)
  })
})
