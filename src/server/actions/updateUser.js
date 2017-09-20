import getUser from 'src/server/actions/getUser'
import {Member, Phase} from 'src/server/services/dataService'
import {updateUser as idmUpdateUser} from 'src/server/services/idmService'

export default async function updateUser(userId, values) {
  const {phaseNumber, roles} = values || {}

  const user = await getUser(userId)

  if (typeof phaseNumber !== 'undefined') {
    const phase = phaseNumber === null ? null : (await Phase.filter({number: phaseNumber}))[0]
    await Member.get(values.id).update({phaseId: phase.id})
  }

  if (Array.isArray(roles) && !_identicalRoles(user.roles, roles)) {
    await idmUpdateUser({
      id: userId,
      email: user.email,
      name: user.name, // FIXME: should not have to include unchanged values
      roles,
    })
  }

  return getUser(userId)
}

function _identicalRoles(oldRoles, newRoles) {
  if (!Array.isArray(oldRoles)) {
    return false
  }
  return oldRoles.sort().join('') === newRoles.sort().join('')
}
