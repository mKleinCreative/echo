import config from 'src/config'
import {connect} from 'src/db'
import {Pool} from 'src/server/services/dataService'
import createPoolsForCycle from 'src/server/actions/createPoolsForCycle'

const r = connect()

export function start() {
  const jobService = require('src/server/services/jobService')
  jobService.processJobs('cycleInitialized', processCycleInitialized)
}

export async function processCycleInitialized(cycle) {
  console.log(`Initializing cycle ${cycle.cycleNumber} of chapter ${cycle.chapterId}`)
  await ensurePoolsForCycle(cycle)
  await sendVotingAnnouncement(cycle)
}

async function ensurePoolsForCycle(cycle) {
  const cyclePools = await Pool.filter({cycleId: cycle.id})
  if (cyclePools.length === 0) {
    await createPoolsForCycle(cycle)
  }
}

function sendVotingAnnouncement(cycle) {
  const chatService = require('src/server/services/chatService')

  return r.table('chapters').get(cycle.chapterId).run()
    .then(chapter => {
      const banner = `🗳 *Voting is now open for cycle ${cycle.cycleNumber}*.`
      const votingInstructions = `Have a look at <${config.server.goalLibrary.baseURL}|the goal library>, then to get started check out \`/vote --help.\``
      const announcement = [banner, votingInstructions].join('\n')
      return chatService.sendChannelMessage(chapter.channelName, announcement)
    })
}
