import gql from 'graphql-tag';

const typeDefs = gql`
  type Activity {
    id: ID!
    tripId: String!
    suggesterId: String!
    activityName: String!
    notes: String
    city: String
    country: String!
    timezone: String!
    startTime: String!
    endTime: String!
    latitude: Float!
    longitude: Float!
    address: String
    categories: [String]
    website: String
    phoneNumber: String
    numVotes: Int!
    voters: [String]
    avgScore: Float!
    createdAt: String!
    trips: [ActivityToTrip]
    UserToActivity: [UserToActivity]
  }

  input ActivityInput {
    tripId: String!
    suggesterId: String!
    activityName: String!
    notes: String
    city: String
    country: String!
    timezone: String!
    startTime: String!
    endTime: String!
    latitude: Float!
    longitude: Float!
    address: String
    categories: [String]
    website: String
    phoneNumber: String
  }

  type Query {
    activity(id: ID!): Activity
    activities(ids: [ID!]!): [Activity]
  }

  type Mutation {
    createActivity(input: ActivityInput!): Activity
    updateActivity(id: ID!, input: ActivityInput!): Activity
    deleteActivity(id: ID!): Boolean
  }
`;

export default typeDefs;
