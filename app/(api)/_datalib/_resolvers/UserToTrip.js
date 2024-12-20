import UserToTrip from '../_services/UserToTrip.js';

const resolvers = {
  Query: {
    userToTrip: (_, { id }) => UserToTrip.find({ id }),
    userToTrips: (_, { ids }) => UserToTrip.findMany({ ids }),
  },
  Mutation: {
    createUserToTrip: (_, { input }) => UserToTrip.create({ input }),
    updateUserToTrip: (_, { id, input }) => UserToTrip.update({ id, input }),
    deleteUserToTrip: (_, { id }) => UserToTrip.delete({ id }),
  },
};

export default resolvers;
