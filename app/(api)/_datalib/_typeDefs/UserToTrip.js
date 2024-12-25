import gql from 'graphql-tag';

const typeDefs = gql`
  type UserToTrip {
    id: ID!
    userId: String!
    tripId: String!
    role: Role!
    trip: Trip!
    user: User!
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String
  }

  type Trip {
    id: ID!
    userIds: [String!]!
    joinCode: String!
    activities: [ActivityToTrip]
    country: String!
    city: String
    latitude: Float!
    longitude: Float!
    timezone: String
    users: [UserToTrip!]!
  }

  enum Role {
    CREATOR
    USER
  }

  input UserToTripInput {
    userId: String!
    tripId: String!
    role: Role!
  }

  type Query {
    userToTrip(id: ID!): UserToTrip
    userToTrips(filter: UserToTripFilter): [UserToTrip]
    tripMembers(tripId: ID!): [UserToTrip]
  }

  input UserToTripFilter {
    userId: String
    tripId: String
  }

  type Mutation {
    createUserToTrip(input: UserToTripInput!): UserToTrip
    updateUserToTrip(id: ID!, input: UserToTripInput!): UserToTrip
    deleteUserToTrip(id: ID!): Boolean
    joinTrip(tripId: String!, userId: String!): UserToTrip
  }
`;

export default typeDefs;
