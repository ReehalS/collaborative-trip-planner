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
    activities: [ActivityToTrip]
    users: [UserToTrip]
    activityCount: Int!
    memberCount: Int!
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

  type TripDetailsResponse {
    trip: Trip!
    activities: [Activity!]!
  }

  type Query {
    tripWithActivities(id: ID!): TripDetailsResponse
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
