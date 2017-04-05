import {CYCLE_STATES, COMPLETE} from 'src/common/models/cycle'
import {PROJECT_DEFAULT_EXPECTED_HOURS} from 'src/common/models/project'
import {
  Cycle,
  getLatestCycleForChapter,
} from 'src/server/services/dataService'

export default async function createNextCycleForChapter(chapterId, projectDefaultExpectedHours = PROJECT_DEFAULT_EXPECTED_HOURS) {
  const latestCycle = await _completeLatestCycle(chapterId)
  const newCycleNumber = (latestCycle && latestCycle.cycleNumber + 1) || 1
  return Cycle.save({
    chapterId,
    projectDefaultExpectedHours,
    startTimestamp: new Date(),
    cycleNumber: newCycleNumber,
    state: CYCLE_STATES[0],
  })
}

async function _completeLatestCycle(chapterId) {
  const latestCycle = await getLatestCycleForChapter(chapterId, {default: null})
  if (!latestCycle) {
    return
  }

  return Cycle
    .get(latestCycle.id)
    .updateWithTimestamp({
      endTimestamp: new Date(),
      state: COMPLETE,
    })
}
