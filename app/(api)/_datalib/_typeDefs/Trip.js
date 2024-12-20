import gql from 'graphql-tag';

const typeDefs = gql`
  type Trip {
    id: ID!
    userIds: [String!]!
    joinCode: String!
    activities: [ActivityToTrip]
    country: String!
    city: String
    latitude: Float!
    longitude: Float!
    timezone: String!
    users: [UserToTrip]
  }

  input TripInput {
    userIds: [String!]!
    joinCode: String!
    country: String!
    city: String
    latitude: Float!
    longitude: Float!
    timezone: String!
  }

  type Query {
    trip(id: ID!): Trip
    trips(ids: [ID!]!): [Trip]
  }

  type Mutation {
    createTrip(input: TripInput!): Trip
    updateTrip(id: ID!, input: TripInput!): Trip
    deleteTrip(id: ID!): Boolean
  }
`;

export default typeDefs;
