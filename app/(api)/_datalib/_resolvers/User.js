import Users from '../_services/Users.js';
import jwt from 'jsonwebtoken';

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

      const tokenPayload = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        profilePic: updatedUser.profilePic,
      };

      const newToken = jwt.sign(tokenPayload, process.env.NEXTAUTH_SECRET, {
        expiresIn: '30d',
      });

      return {
        user: updatedUser,
        token: newToken,
      };
    },
    deleteUser: (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Users.delete({ id });
    },
  },
};

export default resolvers;
