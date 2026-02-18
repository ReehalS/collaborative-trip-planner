import Users from '../_services/Users.js';

const resolvers = {
  Query: {
    user: (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Users.find({ id });
    },
    users: (_, { ids }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Users.findMany({ ids });
    },
  },
  Mutation: {
    createUser: (_, { input }) => {
      return Users.create({ input });
    },
    updateUser: async (_, { id, input }, { auth }) => {
      if (!auth?.userId || auth.userId !== id) {
        throw new Error('Unauthorized');
      }

      const updatedUser = await Users.update({ id, input });

      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      return updatedUser;
    },
    deleteUser: (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Users.delete({ id });
    },
  },
};

export default resolvers;
