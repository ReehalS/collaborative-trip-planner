import { gql } from 'graphql-tag';

const GET_USER_ACTIVITIES = gql`
  query GetUserActivities($userId: String!) {
    activities(filter: { userId: $userId }) {
      id
      activityName
      notes
      startTime
      endTime
      city
      country
      address
      categories
      latitude
      longitude
      avgScore
      numVotes
    }
  }
`;

const GET_TRIP_ACTIVITIES = gql`
  query GetTripActivities($tripId: String!) {
    activities(filter: { tripId: $tripId }) {
      id
      activityName
      notes
      startTime
      endTime
      city
      country
      address
      categories
      latitude
      longitude
      avgScore
      numVotes
    }
  }
`;

const GET_USER_TRIPS = gql`
  query GetUserTrips($userId: String!) {
    userToTrips(filter: { userId: $userId }) {
      id
      trip {
        id
        country
        city
        joinCode
      }
    }
  }
`;

const USER_UPDATE_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UserUpdateInput!) {
    updateUser(id: $id, input: $input) {
      user {
        id
        firstName
        lastName
        email
        profilePic
      }
      token
    }
  }
`;

const GET_ALL_TRIP_DETAILS = gql`
  query GetTripDetails($tripId: ID!) {
    tripWithActivities(id: $tripId) {
      trip {
        id
        country
        city
        joinCode
        latitude
        longitude
        timezone
      }
      activities {
        id
        activityName
        startTime
        endTime
        notes
        categories
        latitude
        longitude
        avgScore
        numVotes
      }
    }
  }
`;

const GET_TRIP_DETAILS = gql`
  query GetTripDetails($tripId: ID!) {
    trip(id: $tripId) {
      id
      country
      city
      joinCode
      latitude
      longitude
      timezone
    }
  }
`;

const DELETE_TRIP_MUTATION = gql`
  mutation DeleteTrip($tripId: ID!) {
    deleteTrip(id: $tripId)
  }
`;

const CAST_VOTE_MUTATION = gql`
  mutation CastVote($activityId: ID!, $input: VoteInput!) {
    castVote(activityId: $activityId, input: $input) {
      id
      avgScore
      numVotes
    }
  }
`;

const CREATE_ACTIVITY_MUTATION = gql`
  mutation CreateActivity($input: ActivityInput!) {
    createActivity(input: $input) {
      id
      tripId
      activityName
      suggesterId
      startTime
      endTime
      notes
      categories
      latitude
      longitude
      avgScore
      numVotes
    }
  }
`;

const GET_TRIP_MEMBERS = gql`
  query GetTripMembers($tripId: ID!) {
    tripMembers(tripId: $tripId) {
      id
      user {
        id
        firstName
        lastName
      }
      role
    }
  }
`;

const VALIDATE_JOIN_CODE_QUERY = gql`
  query ValidateJoinCode($joinCode: String!) {
    validateJoinCode(joinCode: $joinCode) {
      isValid
    }
  }
`;

const CREATE_TRIP_MUTATION = gql`
  mutation CreateTrip($input: TripInput!) {
    createTrip(input: $input) {
      id
      country
      city
      joinCode
      latitude
      longitude
      timezone
    }
  }
`;

const FIND_TRIP_BY_JOIN_CODE = gql`
  query FindTripByJoinCode($joinCode: String!) {
    tripByJoinCode(joinCode: $joinCode) {
      id
      country
      city
    }
  }
`;

const JOIN_TRIP_MUTATION = gql`
  mutation JoinTrip($tripId: String!, $userId: String!) {
    joinTrip(tripId: $tripId, userId: $userId) {
      id
      role
    }
  }
`;

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      message
    }
  }
`;

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      message
    }
  }
`;

export {
  GET_USER_ACTIVITIES,
  GET_USER_TRIPS,
  GET_TRIP_DETAILS,
  GET_ALL_TRIP_DETAILS,
  GET_TRIP_MEMBERS,
  GET_TRIP_ACTIVITIES,
  USER_UPDATE_MUTATION,
  CREATE_ACTIVITY_MUTATION,
  CREATE_TRIP_MUTATION,
  CAST_VOTE_MUTATION,
  VALIDATE_JOIN_CODE_QUERY,
  DELETE_TRIP_MUTATION,
  FIND_TRIP_BY_JOIN_CODE,
  JOIN_TRIP_MUTATION,
  FORGOT_PASSWORD_MUTATION,
  RESET_PASSWORD_MUTATION,
};
