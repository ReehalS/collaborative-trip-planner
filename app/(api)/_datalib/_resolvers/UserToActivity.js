import UserToActivity from '../_services/UserToActivity.js';

const resolvers = {
  Query: {
    userToActivity: (_, { id }) => UserToActivity.find({ id }),
    userToActivities: (_, { ids }) => UserToActivity.findMany({ ids }),
  },
  Mutation: {
    createUserToActivity: (_, { input }) => UserToActivity.create({ input }),
    updateUserToActivity: (_, { id, input }) =>
      UserToActivity.update({ id, input }),
    deleteUserToActivity: (_, { id }) => UserToActivity.delete({ id }),
  },
};

export default resolvers;
