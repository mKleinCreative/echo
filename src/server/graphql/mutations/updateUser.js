import {GraphQLNonNull} from 'graphql'

import {userCan} from 'src/common/util'
import {UserProfile, InputUser} from 'src/server/graphql/schemas'
import updateUser from 'src/server/actions/updateUser'
import {LGNotAuthorizedError} from 'src/server/util/error'

export default {
  type: UserProfile,
  args: {
    values: {type: new GraphQLNonNull(InputUser)},
  },
  async resolve(source, {values}, {currentUser}) {
    if (!userCan(currentUser, 'updateUser')) {
      throw new LGNotAuthorizedError()
    }

    return updateUser(values.id, values)
  }
}
