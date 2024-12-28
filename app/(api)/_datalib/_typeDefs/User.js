import gql from 'graphql-tag';

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String
    password: String!
    profilePic: Int!
    trips: [UserToTrip]
    UserToActivity: [UserToActivity]
  }

  input UserInput {
    email: String!
    firstName: String!
    lastName: String
    profilePic: Int!
    password: String!
  }

  input UserUpdateInput {
    email: String
    firstName: String
    lastName: String
    profilePic: Int
    password: String
  }

  type UpdateUserResponse {
    user: User!
    token: String!
  }

  type ForgotPasswordResponse {
    message: String!
  }

  type ResetPasswordResponse {
    message: String!
  }

  type Query {
    user(id: ID!): User
    users(ids: [ID!]!): [User]
  }

  type Mutation {
    createUser(input: UserInput!): User
    updateUser(id: ID!, input: UserUpdateInput!): UpdateUserResponse
    deleteUser(id: ID!): Boolean
    forgotPassword(email: String!): ForgotPasswordResponse!
    resetPassword(token: String!, newPassword: String!): ResetPasswordResponse!
  }
`;

export default typeDefs;
