/** Adds new relic instrumentation for graphql field resolvers */
import config from 'src/config'

export default function instrumentResolvers(fields, prefix) {
  if (!config.server.newrelic.enabled) {
    return fields
  }

  const newrelic = require('newrelic')

  return Object.entries(fields).map(([queryName, schema]) => {
    const originalResolver = schema.resolve
    return {
      [queryName]: {
        ...schema,
        resolve: (...args) => {
          newrelic.setTransactionName(`graphql ${prefix} ${queryName}`)
          return originalResolver(...args)
        }
      }
    }
  }).reduce((result, next) => ({...result, ...next}), {})
}
