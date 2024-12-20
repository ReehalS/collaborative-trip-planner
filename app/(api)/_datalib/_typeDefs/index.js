import { mergeTypeDefs } from '@graphql-tools/merge';

import User from './User.js';
import Playlist from './Playlist.js';
import Song from './Song.js';

const allTypeDefs = [];

const modules = [User, Playlist, Song];
modules.forEach((module) => {
  allTypeDefs.push(module);
});

const typeDefs = mergeTypeDefs(allTypeDefs);

export default typeDefs;
