import ActivityToTrip from '../_services/ActivityToTrip.js';

const resolvers = {
  Query: {
    activityToTrip: (_, { id }) => ActivityToTrip.find({ id }),
    activityToTrips: (_, { ids }) => ActivityToTrip.findMany({ ids }),
  },
  Mutation: {
    createActivityToTrip: (_, { input }) => ActivityToTrip.create({ input }),
    updateActivityToTrip: (_, { id, input }) =>
      ActivityToTrip.update({ id, input }),
    deleteActivityToTrip: (_, { id }) => ActivityToTrip.delete({ id }),
  },
};

export default resolvers;
