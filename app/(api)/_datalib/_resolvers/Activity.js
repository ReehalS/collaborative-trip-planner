import Activities from '../_services/Activities.js';
import ActivityToTrip from '../_services/ActivityToTrip.js';

const resolvers = {
  Query: {
    activity: (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Activities.find({ id });
    },
    activities: (_, { ids }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Activities.findMany({ ids });
    },
  },
  Mutation: {
    createActivity: async (_, { input }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');

      const activity = await Activities.create({ input });

      // Link activity to trip
      await ActivityToTrip.create({
        input: { activityId: activity.id, tripId: input.tripId },
      });

      return activity;
    },

    updateActivity: (_, { id, input }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      const allowedFields = ['startTime', 'endTime', 'activityName', 'notes'];
      const restrictedInput = Object.keys(input)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = input[key];
          return obj;
        }, {});
      return Activities.update({ id, input: restrictedInput });
    },
    deleteActivity: (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Activities.delete({ id });
    },
    castVote: (_, { activityId, input }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Activities.castVote({ activityId, input });
    },
  },
};

export default resolvers;
