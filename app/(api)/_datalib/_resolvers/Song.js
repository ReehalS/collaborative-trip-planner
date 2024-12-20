import Songs from '../_services/Songs.js';

const resolvers = {
  Song: {
    playlists: () => null,
  },
  Query: {
    song: (_, { id }) => Songs.find({ id }),
    songs: () => Songs.findAll(),
  },
  Mutation: {
    createSong: (_, { input }) => Songs.create({ input }),
  },
};
export default resolvers;
