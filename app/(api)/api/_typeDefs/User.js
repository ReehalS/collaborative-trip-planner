import gql from 'graphql-tag';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    playlists: [Playlist]
  }

  input UserInput {
    name: String!
  }

  type Query {
    user(id: ID!): User
    users(ids: [ID]!): [User]
  }

  type Mutation {
    createUser(input: UserInput!): User
    updateUser(id: ID!, input: UserInput!): User
    deleteUser(id: ID!): Boolean
  }
`;
export default typeDefs;
