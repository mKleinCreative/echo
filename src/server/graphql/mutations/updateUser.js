import {GraphQLNonNull} from 'graphql'

import {userCan} from 'src/common/util'
import {UserProfile, InputUser} from 'src/server/graphql/schemas'
import echoUpdateUser from 'src/server/actions/updateUser'
import getUser from 'src/server/actions/getUser'
import {LGNotAuthorizedError} from 'src/server/util/error'
import {updateUser as idmUpdateUser} from 'src/server/services/idmservice'

export default {
  type: UserProfile,
  args: {
    values: {type: new GraphQLNonNull(InputUser)},
  },
  async resolve(source, {values}, {rootValue: {currentUser}}) {
    if (!userCan(currentUser, 'updateUser')) {
      throw new LGNotAuthorizedError()
    }

    const user = await getUser(values.id)

    await echoUpdateUser({id: values.id, phaseNumber: values.phaseNumber})

    if (!_identicalRoles(user.roles, values.roles)) {
      await idmUpdateUser({
        id: values.id,
        roles: values.roles,
        email: user.email,
        handle: user.handle,
        name: user.name,
      })
    }
    return await getUser(values.id)
  }
}

function _identicalRoles(oldRoles, newRoles) {
  return oldRoles.sort().join('') === newRoles.sort().join('')
}
