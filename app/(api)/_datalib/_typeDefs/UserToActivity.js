import gql from 'graphql-tag';

const typeDefs = gql`
  type UserToActivity {
    id: ID!
    userId: String!
    activityId: String!
  }

  input UserToActivityInput {
    userId: String!
    activityId: String!
  }

  type Query {
    userToActivity(id: ID!): UserToActivity
    userToActivities(ids: [ID!]!): [UserToActivity]
  }

  type Mutation {
    createUserToActivity(input: UserToActivityInput!): UserToActivity
    updateUserToActivity(id: ID!, input: UserToActivityInput!): UserToActivity
    deleteUserToActivity(id: ID!): Boolean
  }
`;

export default typeDefs;
