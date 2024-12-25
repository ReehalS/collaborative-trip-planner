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
    updateUser: (_, { id, input }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Users.update({ id, input });
    },
    deleteUser: (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Users.delete({ id });
    },
  },
};

export default resolvers;
