import UserToTrip from '../_services/UserToTrip.js';
import Trips from '../_services/Trips.js';
import Users from '../_services/Users.js';

const resolvers = {
  Query: {
    userToTrip: async (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return UserToTrip.find({ id });
    },
    userToTrips: async (_, { filter }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      if (!filter?.userId && !filter?.tripId) {
        throw new Error('Must provide either userId or tripId in the filter');
      }
      return UserToTrip.findMany(filter);
    },
    tripMembers: async (_, { tripId }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return UserToTrip.findMembersByTrip({ tripId });
    },
  },
  UserToTrip: {
    trip: async (parent) => {
      return Trips.find({ id: parent.tripId });
    },
    user: async (parent) => {
      return Users.find({ id: parent.userId });
    },
  },
  Mutation: {
    createUserToTrip: async (_, { input }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return UserToTrip.create({ input });
    },
    updateUserToTrip: async (_, { id, input }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return UserToTrip.update({ id, input });
    },
    deleteUserToTrip: async (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return UserToTrip.delete({ id });
    },
    joinTrip: async (_, { tripId, userId }, { auth }) => {
      if (!auth?.userId || auth.userId !== userId)
        throw new Error('Unauthorized');
      let existingCopy = await UserToTrip.findMany({tripId , userId})
      if(existingCopy.length>=0){
        return existingCopy[0]
      }
      return UserToTrip.create({ tripId, userId, role: 'USER' });
    },
  },
};

export default resolvers;
