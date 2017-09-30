import getUser from 'src/server/actions/getUser'

export default async function updateUser(userId, values) {
  const {Member, Phase} = require('src/server/services/dataService')
  const {updateUser: idmUpdateUser} = require('src/server/services/idmService')

  const {phaseNumber, roles} = values || {}

  const user = await getUser(userId)

  if (typeof phaseNumber !== 'undefined') {
    const phase = phaseNumber === null ? null : (await Phase.filter({number: phaseNumber}))[0]
    await Member.get(userId).update({phaseId: phase ? phase.id : null})
  }

  if (Array.isArray(roles) && !_identicalRoles(user.roles, roles)) {
    await idmUpdateUser({
      id: userId,
      email: user.email,
      name: user.name,
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
