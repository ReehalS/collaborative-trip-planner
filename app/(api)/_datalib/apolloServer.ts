import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';

import typeDefs from './_typeDefs/index';
import resolvers from './_resolvers/index';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
}) as ApolloServer<object>;

const handler = startServerAndCreateNextHandler<NextRequest>(server);

export default handler;
