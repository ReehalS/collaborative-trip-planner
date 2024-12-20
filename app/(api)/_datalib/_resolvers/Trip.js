import Trips from '../_services/Trips.js';

const resolvers = {
  Query: {
    trip: (_, { id }) => Trips.find({ id }),
    trips: (_, { ids }) => Trips.findMany({ ids }),
  },
  Mutation: {
    createTrip: (_, { input }) => Trips.create({ input }),
    updateTrip: (_, { id, input }) => Trips.update({ id, input }),
    deleteTrip: (_, { id }) => Trips.delete({ id }),
  },
};

export default resolvers;
