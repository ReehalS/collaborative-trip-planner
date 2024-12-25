import { mergeResolvers } from '@graphql-tools/merge';

import User from './User.js';
import Trip from './Trip.js';
import Activity from './Activity.js';
import UserToTrip from './UserToTrip.js';
import UserToActivity from './UserToActivity.js';
import ActivityToTrip from './ActivityToTrip.js';

const allResolvers = [];

const modules = [
  User,
  Trip,
  Activity,
  UserToTrip,
  UserToActivity,
  ActivityToTrip,
];

modules.forEach((module) => {
  allResolvers.push(module);
});

const resolvers = mergeResolvers(allResolvers);

export default resolvers;
