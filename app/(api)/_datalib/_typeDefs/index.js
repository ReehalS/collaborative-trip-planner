import { mergeTypeDefs } from '@graphql-tools/merge';

import User from './User.js';
import Activity from './Activity.js';
import Trip from './Trip.js';
import UserToActivity from './UserToActivity.js';
import UserToTrip from './UserToTrip.js';
import ActivityToTrip from './ActivityToTrip.js';

const allTypeDefs = [];

const modules = [
  User,
  Activity,
  Trip,
  UserToActivity,
  UserToTrip,
  ActivityToTrip,
];
modules.forEach((module) => {
  allTypeDefs.push(module);
});

const typeDefs = mergeTypeDefs(allTypeDefs);

export default typeDefs;
