import gql from 'graphql-tag';

const typeDefs = gql`
  type ActivityToTrip {
    id: ID!
    activityId: String!
    tripId: String!
  }

  input ActivityToTripInput {
    activityId: String!
    tripId: String!
  }

  type Query {
    activityToTrip(id: ID!): ActivityToTrip
    activityToTrips(ids: [ID!]!): [ActivityToTrip]
  }

  type Mutation {
    createActivityToTrip(input: ActivityToTripInput!): ActivityToTrip
    updateActivityToTrip(id: ID!, input: ActivityToTripInput!): ActivityToTrip
    deleteActivityToTrip(id: ID!): Boolean
  }
`;

export default typeDefs;
