import {graphql, GraphQLSchema, GraphQLObjectType, GraphQLString} from 'graphql'

const noopQuery = new GraphQLObjectType({name: 'Query', fields: () => ({
  noop: {type: GraphQLString, resolve: () => null},
})})

export function runGraphQLQuery(
  fields,
  query,
  context = {currentUser: true},
  variables,
) {
  const schema = new GraphQLSchema({query: new GraphQLObjectType({name: 'RootQuery', fields})})
  return _graphql(schema, query, context, variables)
}

export function runGraphQLMutation(
  fields,
  mutation,
  context = {currentUser: true},
  variables,
) {
  const schema = new GraphQLSchema({
    query: noopQuery,
    mutation: new GraphQLObjectType({name: 'RootMutation', fields})
  })
  return _graphql(schema, mutation, context, variables)
}

async function _graphql(schema, request, context, variables) {
  const rootValue = {}
  const result = await graphql(schema, request, rootValue, context, variables)
  if (result.errors) {
    throw new Error(result.errors.map(err => err.message).join('\n'))
  }
  return result
}
