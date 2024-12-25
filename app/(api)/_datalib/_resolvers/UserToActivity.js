import UserToActivity from '../_services/UserToActivity.js';
import Users from '../_services/Users.js';
import Activities from '../_services/Activities.js';

const resolvers = {
  Query: {
    userToActivity: async (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return UserToActivity.find({ id });
    },
    userToActivities: async (_, { ids }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return UserToActivity.findMany({ ids });
    },
    activitiesByUser: async (_, { userId }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      if (userId !== auth.userId)
        throw new Error('Unauthorized to view these activities');

      return UserToActivity.findByUser(userId);
    },
  },
  UserToActivity: {
    user: async (parent) => {
      return Users.find({ id: parent.userId });
    },
    activity: async (parent) => {
      return Activities.find({ id: parent.activityId });
    },
  },
  Mutation: {
    createUserToActivity: async (_, { input }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return UserToActivity.create({ input });
    },
    updateUserToActivity: async (_, { id, input }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return UserToActivity.update({ id, input });
    },
    deleteUserToActivity: async (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return UserToActivity.delete({ id });
    },
  },
};

export default resolvers;
