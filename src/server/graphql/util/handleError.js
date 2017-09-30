import {GraphQLError} from 'graphql/error'

import {parseQueryError} from 'src/server/util/error'

export default function handleError(unparsedError, defaultMsg) {
  const err = parseQueryError(unparsedError)
  if (err.name === 'LGBadRequestError' || err.name === 'LGCustomQueryError') {
    throw err
  }
  throw new GraphQLError(defaultMsg || err.message || err)
}
