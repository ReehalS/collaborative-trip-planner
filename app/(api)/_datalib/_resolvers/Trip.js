import Trips from '../_services/Trips.js';
import UserToTrip from '../_services/UserToTrip.js';
import ActivityToTrip from '../_services/ActivityToTrip.js';
import Activities from '../_services/Activities.js';

const resolvers = {
  Query: {
    trip: async (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      const trip = await Trips.find({ id });
      if (!trip) {
        throw new Error('Trip not found.');
      }

      const activityToTripRelations = await ActivityToTrip.findByTrip({
        tripId: id,
      });
      const activities = activityToTripRelations.map((relation) => relation.activity);

      return { trip: trip, activities: activities };
    },
    trips: (_, { ids }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Trips.findMany({ ids });
    },
    validateJoinCode: async (_, { joinCode }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      const isValid = await Trips.validateJoinCode(joinCode);
      return { isValid };
    },
    tripByJoinCode: async (_, { joinCode }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Trips.findByJoinCode({ joinCode });
    },
  },
  Trip: {
    users: async (parent) => {
      return UserToTrip.findMembersByTrip({ tripId: parent.id });
    },
    activities: async (parent) => {
      // Ensure activities are fetched directly when needed
      const activityToTripRelations = await ActivityToTrip.findByTrip({
        tripId: parent.id,
      });

      return Promise.all(
        activityToTripRelations.map((relation) =>
          Activities.find({ id: relation.activityId })
        )
      );
    },
  },
  Mutation: {
    createTrip: (_, { input }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Trips.create({ input });
    },
    deleteTrip: async (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      const isCreator = await Trips.checkCreator({
        tripId: id,
        userId: auth.userId,
      });
      if (!isCreator) throw new Error('Only the creator can delete this trip');
      return Trips.delete({ id });
    },
  },
};

export default resolvers;
