/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import nock from 'nock'

import {resetDB, runGraphQLQuery, useFixture, mockIdmUsersById} from 'src/test/helpers'
import factory from 'src/test/factories'

import findRetrospectiveSurveys from '../findRetrospectiveSurveys'

const fields = {findRetrospectiveSurveys}
const query = `
  query {
    findRetrospectiveSurveys {
      id
      project {
        id
        name
        chapter { id name }
        cycle { id cycleNumber }
      }
      questions {
        id subjectType responseType body
        subjects { id name handle }
        response {
          values {
            subjectId
            value
          }
        }
      }
    }
  }
`

describe(testContext(__filename), function () {
  useFixture.buildSurvey()

  beforeEach(resetDB)

  beforeEach('Setup Retrospective Survey Data', async function () {
    nock.cleanAll()
    await this.buildSurvey()
    this.currentUser = await factory.build('user', {id: this.project.memberIds[0]})
    await mockIdmUsersById(this.project.memberIds)
  })

  it('throws an error if user is not signed-in', function () {
    const context = {currentUser: null}
    const variables = {id: 'fake.id'}
    const result = runGraphQLQuery(fields, query, context, variables)
    return expect(result).to.eventually.be.rejectedWith(/not authorized/i)
  })

  it('returns the survey for the correct cycle and project for the current user', async function () {
    const context = {currentUser: this.currentUser}
    const result = await runGraphQLQuery(fields, query, context)
    const data = result.data.findRetrospectiveSurveys
    expect(data.length).to.eq(1)
    expect(data[0].id).to.eq(this.survey.id)
    expect(data[0].project.name).to.eq(this.project.name)
    expect(data[0].project.cycle.id).to.eq(this.cycleId)
    expect(data[0].project.cycle.cycleNumber).to.exist
    expect(data[0].project.chapter.id).to.eq(this.project.chapterId)
    expect(data[0].project.chapter.name).to.exist
  })
})
