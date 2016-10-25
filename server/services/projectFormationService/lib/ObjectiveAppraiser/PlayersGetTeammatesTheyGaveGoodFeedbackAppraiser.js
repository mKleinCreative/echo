import {repeat, flatten, sum} from '../util'
import {getPlayerIds, getFeedbackStats} from '../pool'

export const STAT_WEIGHTS = {
  CULTURE_CONTRIBUTION: 1,
  TEAM_PLAY: 1,
  TECHNICAL_HEALTH: 0.25
}
export const NOVELTY_WEIGHT = 0.1
export const PERFECT_SCORE = sum([...Object.values(STAT_WEIGHTS), NOVELTY_WEIGHT])

export default class PlayersGetTeammatesTheyGaveGoodFeedbackAppraiser {
  constructor(pool) {
    this.pool = pool
    this.feedbackCache = {}
  }

  score(teamFormationPlan) {
    const scoresForUnassignedPlayers = this.getScoresForUnassignedPlayers(teamFormationPlan)
    const scoresForAssignedPlayers = this.getScoresForAssignedPlayers(teamFormationPlan)

    const scores = scoresForAssignedPlayers.concat(scoresForUnassignedPlayers)
    return sum(scores) / scores.length
  }

  getScoresForUnassignedPlayers(teamFormationPlan) {
    const unassignedPlayerIds = new Set(getPlayerIds(this.pool))
    teamFormationPlan.teams.forEach(team =>
      team.playerIds.forEach(subjectId => {
        unassignedPlayerIds.delete(subjectId)
      })
    )
    return repeat(unassignedPlayerIds.size, 1)
  }

  getScoresForAssignedPlayers(teamFormationPlan) {
    const scoresForAssignedPlayers = teamFormationPlan.teams.map(team =>
      team.playerIds.map(subjectId => {
        const teammates = team.playerIds.filter(p => p !== subjectId)

        if (teammates.length === 0) {
          return 1
        }

        return teammates.map(respondentId => {
          return this.getScoreForPairing({respondentId, subjectId})
        })
      })
    )
    return flatten(scoresForAssignedPlayers)
  }

  getScoreForPairing({respondentId, subjectId}) {
    const stats = this.getFeedbackStats({respondentId, subjectId})

    if (!stats) {
      return 1
    }

    const weightedScores = Object.entries(stats).map(([stat, value]) => STAT_WEIGHTS[stat] * value)
    const rawScore = sum(weightedScores)

    return rawScore / PERFECT_SCORE
  }

  getFeedbackStats({respondentId, subjectId}) {
    return getFeedbackStats(this.pool, {respondentId, subjectId})
  }
}