import gql from 'graphql-tag';

const typeDefs = gql`
  type Song {
    id: ID!
    name: String!
    playlists: [Playlist]
  }

  input SongInput {
    name: String!
  }

  type Query {
    song(id: ID!): Song
    songs: [Song]
  }

  type Mutation {
    createSong(input: SongInput!): Song
  }
`;
export default typeDefs;
