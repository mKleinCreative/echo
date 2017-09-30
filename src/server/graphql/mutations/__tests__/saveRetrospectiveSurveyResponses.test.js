/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import factory from 'src/test/factories'
import {resetDB, runGraphQLMutation, useFixture} from 'src/test/helpers'
import {Cycle} from 'src/server/services/dataService'
import {COMPLETE, PRACTICE} from 'src/common/models/cycle'

import saveRetrospectiveSurveyResponses from '../saveRetrospectiveSurveyResponses'

const fields = {saveRetrospectiveSurveyResponses}
const mutation = `
  mutation($responses: [SurveyResponseInput]!) {
    saveRetrospectiveSurveyResponses(responses: $responses) {
      createdIds
    }
  }
`

describe(testContext(__filename), function () {
  useFixture.buildOneQuestionSurvey()
  useFixture.buildSurvey()

  beforeEach(resetDB)

  beforeEach(async function () {
    await this.buildSurvey()
    this.user = await factory.build('user', {id: this.project.memberIds[0]})
    this.respondentId = this.project.memberIds[0]

    this.invokeAPI = function () {
      const responses = this.project.memberIds.slice(1).map(memberId => ({
        values: [{subjectId: memberId, value: 'foo'}],
        questionId: this.surveyQuestion.id,
        surveyId: this.survey.id,
        respondentId: this.respondentId,
      }))
      const context = {currentUser: this.user}
      const variables = {responses}
      return runGraphQLMutation(fields, mutation, context, variables)
    }
  })

  it('returns new response ids for all responses created in REFLECTION state', async function () {
    const result = await this.invokeAPI()
    const createdIds = result.data.saveRetrospectiveSurveyResponses.createdIds
    expect(createdIds).have.length(this.project.memberIds.length - 1)
  })

  it('returns new response ids for all responses created in COMPLETE state', async function () {
    await Cycle.get(this.cycleId).updateWithTimestamp({state: COMPLETE})
    const result = await this.invokeAPI()
    const createdIds = result.data.saveRetrospectiveSurveyResponses.createdIds
    expect(createdIds).have.length(this.project.memberIds.length - 1)
  })

  it('returns an error when in PRACTICE state', async function () {
    await Cycle.get(this.cycleId).updateWithTimestamp({state: PRACTICE})
    const result = this.invokeAPI()
    return expect(result).to.be.rejectedWith(/cycle is in the PRACTICE state/)
  })
})
