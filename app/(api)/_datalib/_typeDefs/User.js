import gql from 'graphql-tag';

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String
    profilePic: Int!
    trips: [UserToTrip]
    UserToActivity: [UserToActivity]
  }

  input UserInput {
    email: String!
    firstName: String!
    lastName: String
    profilePic: Int!
  }

  type Query {
    user(id: ID!): User
    users(ids: [ID!]!): [User]
  }

  type Mutation {
    createUser(input: UserInput!): User
    updateUser(id: ID!, input: UserInput!): User
    deleteUser(id: ID!): Boolean
  }
`;

export default typeDefs;
