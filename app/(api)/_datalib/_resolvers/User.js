import Users from '../_services/Users.js';

const resolvers = {
  User: {
    playlists: ({ id }) => Users.getPlaylists({ id }),
  },
  Query: {
    user: (_, { id }) => Users.find({ id }),
    users: (_, { ids }) => Users.findMany({ ids }),
  },
  Mutation: {
    createUser: (_, { input }) => Users.create({ input }),
    updateUser: (_, { id, input }) => Users.update({ id, input }),
    deleteUser: (_, { id }) => Users.delete({ id }),
  },
};

export default resolvers;
