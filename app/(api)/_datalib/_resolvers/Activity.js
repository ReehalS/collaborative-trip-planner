import Activities from '../_services/Activities.js';

const resolvers = {
  Query: {
    activity: (_, { id }) => Activities.find({ id }),
    activities: (_, { ids }) => Activities.findMany({ ids }),
  },
  Mutation: {
    createActivity: (_, { input }) => Activities.create({ input }),
    updateActivity: (_, { id, input }) => Activities.update({ id, input }),
    deleteActivity: (_, { id }) => Activities.delete({ id }),
  },
};

export default resolvers;
