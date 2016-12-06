import {GraphQLError} from 'graphql/error'

import {parseQueryError} from 'src/server/db/errors'
import {getPlayerById} from 'src/server/db/player'
import {getLatestCycleForChapter} from 'src/server/db/cycle'

export async function assertPlayersCurrentCycleInState(currentUser, state) {
  const player = await getPlayerById(currentUser.id, {mergeChapter: true})
  const cycleInReflection = await getLatestCycleForChapter(player.chapter.id)('state')
    .eq(state)

  if (!cycleInReflection) {
    throw new GraphQLError(`This action is not allowed when the cycle is not in the ${state} state`)
  }
}

export function handleError(unparsedError, defaultMsg) {
  const err = parseQueryError(unparsedError)
  if (err.name === 'BadInputError' || err.name === 'LGCustomQueryError') {
    throw err
  }
  throw new GraphQLError(defaultMsg || err.message || err)
}

export function pruneAutoLoad(loadedModules) {
  if (!loadedModules) {
    return
  }
  return Object.keys(loadedModules).reduce((result, name) => {
    if (!name.startsWith('_') && name !== 'index') {
      result[name] = loadedModules[name]
    }
    return result
  }, {})
}