import gql from 'graphql-tag';

const typeDefs = gql`
  type UserToTrip {
    id: ID!
    userId: String!
    tripId: String!
    role: Role!
  }

  input UserToTripInput {
    userId: String!
    tripId: String!
    role: Role!
  }

  type Query {
    userToTrip(id: ID!): UserToTrip
    userToTrips(ids: [ID!]!): [UserToTrip]
  }

  type Mutation {
    createUserToTrip(input: UserToTripInput!): UserToTrip
    updateUserToTrip(id: ID!, input: UserToTripInput!): UserToTrip
    deleteUserToTrip(id: ID!): Boolean
  }

  enum Role {
    CREATOR
    USER
  }
`;

export default typeDefs;
