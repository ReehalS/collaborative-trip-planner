import ActivityToTrip from '../_services/ActivityToTrip.js';
import Activities from '../_services/Activities.js';
import Trips from '../_services/Trips.js';

const resolvers = {
  Query: {
    activityToTrip: async (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return ActivityToTrip.find({ id });
    },
    activityToTrips: async (_, { ids, tripId }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');

      if (tripId) {
        return ActivityToTrip.findByTrip({ tripId });
      }

      if (ids) {
        return ActivityToTrip.findMany({ ids });
      }

      throw new Error('Must provide either ids or tripId');
    },
  },
  ActivityToTrip: {
    activity: async (parent) => {
      return Activities.find({ id: parent.activityId });
    },
    trip: async (parent) => {
      return Trips.find({ id: parent.tripId });
    },
  },
  Mutation: {
    createActivityToTrip: async (_, { input }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return ActivityToTrip.create({ input });
    },
    updateActivityToTrip: async (_, { id, input }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return ActivityToTrip.update({ id, input });
    },
    deleteActivityToTrip: async (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return ActivityToTrip.delete({ id });
    },
  },
};

export default resolvers;
