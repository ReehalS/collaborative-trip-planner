import { mergeResolvers } from '@graphql-tools/merge';

import User from './User.js';
import Playlist from './Playlist.js';
import Song from './Song.js';

const allResolvers = [];

const modules = [User, Playlist, Song];
modules.forEach((module) => {
  allResolvers.push(module);
});

const resolvers = mergeResolvers(allResolvers);

export default resolvers;
