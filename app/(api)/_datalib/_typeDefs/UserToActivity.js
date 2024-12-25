import gql from 'graphql-tag';

const typeDefs = gql`
  type UserToActivity {
    id: ID!
    userId: String!
    activityId: String!
    activity: Activity!
    user: User!
  }

  input UserToActivityInput {
    userId: String!
    activityId: String!
  }

  input AuthInput {
    token: String
    userId: String
  }

  type Query {
    userToActivity(id: ID!, auth: AuthInput): UserToActivity
    userToActivities(ids: [ID!]!, auth: AuthInput): [UserToActivity]
    activitiesByUser(userId: String!, auth: AuthInput): [Activity!]!
  }

  type Mutation {
    createUserToActivity(
      input: UserToActivityInput!
      auth: AuthInput
    ): UserToActivity
    updateUserToActivity(
      id: ID!
      input: UserToActivityInput!
      auth: AuthInput
    ): UserToActivity
    deleteUserToActivity(id: ID!, auth: AuthInput): Boolean
  }
`;

export default typeDefs;
