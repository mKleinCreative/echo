/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import nock from 'nock'

import factory from 'src/test/factories'
import {resetDB, runGraphQLQuery, useFixture, mockIdmUsersById} from 'src/test/helpers'
import {Survey} from 'src/server/services/dataService'

import getRetrospectiveSurvey from '../getRetrospectiveSurvey'

const fields = {getRetrospectiveSurvey}

describe(testContext(__filename), function () {
  useFixture.buildSurvey()

  beforeEach(resetDB)

  beforeEach('Setup Retrospective Survey Data', async function () {
    const teamQuestion = await factory.create('question', {
      responseType: 'relativeContribution',
      subjectType: 'team'
    })
    const memberQuestion = await factory.create('question', {
      body: 'What is one thing {{subject}} did well?',
      responseType: 'text',
      subjectType: 'member'
    })
    await this.buildSurvey({questionRefs: [
      {questionId: teamQuestion.id, subjectIds: () => this.project.memberIds},
      {questionId: memberQuestion.id, subjectIds: () => [this.project.memberIds[1]]},
    ]})
    this.currentUser = await factory.build('user', {id: this.project.memberIds[0]})
    await mockIdmUsersById(this.project.memberIds)
  })

  afterEach(function () {
    nock.cleanAll()
  })

  describe('getRetrospectiveSurvey', function () {
    it('returns the survey for the correct cycle and project for the current user', async function () {
      const context = {currentUser: this.currentUser}
      const query = `
        query {
          getRetrospectiveSurvey {
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
      const result = await runGraphQLQuery(fields, query, context)
      expect(result.data.getRetrospectiveSurvey.id).to.eq(this.survey.id)
      expect(result.data.getRetrospectiveSurvey.project.name).to.eq(this.project.name)
      expect(result.data.getRetrospectiveSurvey.project.cycle.id).to.eq(this.cycleId)
      expect(result.data.getRetrospectiveSurvey.project.cycle.cycleNumber).to.exist
      expect(result.data.getRetrospectiveSurvey.project.chapter.id).to.eq(this.project.chapterId)
      expect(result.data.getRetrospectiveSurvey.project.chapter.name).to.exist
    })

    it('treats the question body like a template', async function () {
      const context = {currentUser: this.currentUser}
      const query = `
        query {
          getRetrospectiveSurvey {
            questions {
              body
              subjects { handle }
            }
          }
        }
      `
      const result = await runGraphQLQuery(fields, query, context)
      const question = result.data.getRetrospectiveSurvey.questions[1]
      expect(question.body).to.contain(`@${question.subjects[0].handle}`)
    })

    it('accepts a projectName parameter', async function () {
      const context = {currentUser: this.currentUser}
      const variables = {projectName: this.project.name}
      const query = `
        query($projectName: String) {
          getRetrospectiveSurvey(projectName: $projectName) {
            id
          }
        }
      `
      const result = await runGraphQLQuery(fields, query, context, variables)
      expect(result.data.getRetrospectiveSurvey.id).to.eq(this.survey.id)
    })

    it('returns a meaningful error when lookup fails', async function () {
      await Survey.get(this.survey.id).delete().execute()
      const context = {currentUser: this.currentUser}
      const query = `
        query {
          getRetrospectiveSurvey {
            id
          }
        }
      `
      const promise = runGraphQLQuery(fields, query, context)
      expect(promise).to.be.rejectedWith(/no retrospective survey/)
    })
  })
})
