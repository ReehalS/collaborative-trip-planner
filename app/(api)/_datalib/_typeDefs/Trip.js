import gql from 'graphql-tag';

const typeDefs = gql`
  type Trip {
    id: ID!
    userIds: [String!]!
    joinCode: String!
    country: String!
    city: String
    latitude: Float!
    longitude: Float!
    timezone: String!
    activities: [Activity!]!
    users: [UserToTrip]
  }

  input TripInput {
    userIds: [String!]!
    joinCode: String
    country: String!
    city: String
    latitude: Float!
    longitude: Float!
    timezone: String!
  }

  type ValidateJoinCodeResponse {
    isValid: Boolean!
  }

  type Query {
    trip(id: ID!): Trip
    trips(ids: [ID!]!): [Trip]
    validateJoinCode(joinCode: String!): ValidateJoinCodeResponse
    tripByJoinCode(joinCode: String!): Trip
  }

  type Mutation {
    createTrip(input: TripInput!): Trip
    deleteTrip(id: ID!): Boolean
  }
`;

export default typeDefs;
