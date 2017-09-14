import * as useFixture from './fixtures'

module.exports = Object.assign({useFixture},
  require('./db'),
  require('./graphql'),
  require('./expectations'),
  require('./idmMocks'),
)
