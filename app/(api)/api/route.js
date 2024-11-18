import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
// import { NextRequest } from 'next/server';

import typeDefs from './_typeDefs/index';
import resolvers from './_resolvers/index';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
});

const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST };
