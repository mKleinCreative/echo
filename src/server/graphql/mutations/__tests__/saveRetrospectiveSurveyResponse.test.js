/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import factory from 'src/test/factories'
import {resetDB, runGraphQLMutation, useFixture} from 'src/test/helpers'
import {Cycle} from 'src/server/services/dataService'
import {COMPLETE, PRACTICE} from 'src/common/models/cycle'

import saveRetrospectiveSurveyResponse from '../saveRetrospectiveSurveyResponse'

const fields = {saveRetrospectiveSurveyResponse}
const mutation = `
  mutation($response: SurveyResponseInput!) {
    saveRetrospectiveSurveyResponse(response: $response) {
      createdIds
    }
  }
`

describe(testContext(__filename), function () {
  useFixture.buildOneQuestionSurvey()
  useFixture.buildSurvey()

  beforeEach(resetDB)

  beforeEach(async function () {
    await this.buildOneQuestionSurvey({
      questionAttrs: {subjectType: 'team', type: 'relativeContribution'},
      subjectIds: () => this.project.memberIds
    })
    this.user = await factory.build('user', {id: this.project.memberIds[0]})
    this.respondentId = this.project.memberIds[0]
    this.subjectId = this.project.memberIds[1]

    this.invokeAPI = function (rccScores) {
      const teamSize = this.project.memberIds.length
      rccScores = rccScores || Array(teamSize).fill(100 / teamSize)
      const response = {
        values: rccScores.map((value, i) => (
          {subjectId: this.project.memberIds[i], value}
        )),
        questionId: this.question.id,
        surveyId: this.survey.id,
        respondentId: this.respondentId,
      }

      const context = {currentUser: this.user}
      const variables = {response}

      return runGraphQLMutation(fields, mutation, context, variables)
    }
  })

  it('returns new response ids for all responses created in REFLECTION state', async function () {
    const result = await this.invokeAPI()
    const createdIds = result.data.saveRetrospectiveSurveyResponse.createdIds
    expect(createdIds).have.length(this.project.memberIds.length)
  })

  it('returns new response ids for all responses created in COMPLETE state', async function () {
    await Cycle.get(this.cycleId).updateWithTimestamp({state: COMPLETE})
    const result = await this.invokeAPI()
    const createdIds = result.data.saveRetrospectiveSurveyResponse.createdIds
    expect(createdIds).have.length(this.project.memberIds.length)
  })

  it('returns error message when missing parts', function () {
    const result = this.invokeAPI(Array(2).fill(50))
    return expect(result).to.be.rejectedWith('Failed to save responses')
  })

  it('returns helpful error messages for invalid values', function () {
    const result = this.invokeAPI(Array(this.project.memberIds.length).fill(101))
    return expect(result).to.be.rejectedWith(/must be less than or equal to 100/)
  })

  it('returns an error when the cycle is in PRACTICE state', async function () {
    await Cycle.get(this.cycleId).updateWithTimestamp({state: PRACTICE})
    const result = this.invokeAPI()
    return expect(result).to.be.rejectedWith(/cycle is in the PRACTICE state/)
  })
})
