import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadTypedefsSync } from '@graphql-tools/load';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import { DocumentNode } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import {
  rateLimitDirective,
  defaultPointsCalculator,
} from 'graphql-rate-limit-directive';
import http from 'http';

import { ApolloContext, createContext } from './lib/context';
import { NodeEnv } from './lib/enums';
import { apolloComplexityPlugin } from './lib/plugins/complexity';
import { apolloSentryPlugin } from './lib/plugins/sentry';
import { connectToDatabase, disconnectFromDatabase } from './prisma';
import { resolvers } from './resolvers';

const { rateLimitDirectiveTypeDefs, rateLimitDirectiveTransformer } =
  rateLimitDirective({
    pointsCalculator: (...args) => {
      // Disable rate limiting for testing
      // https://github.com/ravangen/graphql-rate-limit/issues/113
      if (process.env.NODE_ENV === NodeEnv.Dev) {
        return 0;
      }
      return defaultPointsCalculator(...args);
    },
  });

const sources = loadTypedefsSync('./schema.graphql', {
  loaders: [new GraphQLFileLoader()],
});
const typeDefs = sources
  .map(source => source.document)
  .filter(Boolean) as DocumentNode[];

const schema = rateLimitDirectiveTransformer(
  makeExecutableSchema({
    typeDefs: [rateLimitDirectiveTypeDefs, typeDefs],
    resolvers,
  }),
);

export const createServer = () => {
  const app = express();
  const httpServer = http.createServer(app);

  const apolloServer = new ApolloServer<ApolloContext>({
    schema,
    introspection: true,
    csrfPrevention: true,
    includeStacktraceInErrorResponses: process.env.NODE_ENV === NodeEnv.Dev,
    nodeEnv: process.env.NODE_ENV,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      responseCachePlugin(),
      apolloComplexityPlugin(schema),
      apolloSentryPlugin,
    ],
    validationRules: [depthLimit(10)],
  });

  const startServer = async (port: number) => {
    await apolloServer.start();

    app.use(
      '/graphql',
      cors<cors.CorsRequest>(),
      json(),
      expressMiddleware(apolloServer, {
        context: createContext,
      }),
    );

    await new Promise<void>(resolve => httpServer.listen({ port }, resolve));

    await connectToDatabase();

    if (process.env.NODE_ENV !== NodeEnv.Testing) {
      // eslint-disable-next-line no-console -- start info
      console.log(`Server ready at http://localhost:${port}/graphql`);
    }
  };

  const stopServer = async () => {
    await apolloServer.stop();
    await disconnectFromDatabase();
    httpServer.close();
  };

  return {
    apolloServer,
    startServer,
    stopServer,
  };
};
