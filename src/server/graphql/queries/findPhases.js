import {GraphQLList} from 'graphql/type'

import {Phase} from 'src/server/services/dataService'
import {Phase as PhaseSchema} from 'src/server/graphql/schemas'
import {LGNotAuthorizedError} from 'src/server/util/error'

export default {
  type: new GraphQLList(PhaseSchema),
  async resolve(source, args, {currentUser}) {
    if (!currentUser) {
      throw new LGNotAuthorizedError()
    }

    return Phase.run()
  },
}
