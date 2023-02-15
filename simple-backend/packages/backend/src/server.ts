import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadTypedefsSync } from '@graphql-tools/load';
import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ContextFunction,
} from 'apollo-server-core';
import { ApolloServer, ExpressContext } from 'apollo-server-express';
import responseCachePlugin from 'apollo-server-plugin-response-cache';
import express from 'express';
import { DocumentNode } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import {
  rateLimitDirective,
  defaultPointsCalculator,
} from 'graphql-rate-limit-directive';
import http from 'http';

import { ApolloContext, createContext, dataLoaders } from './lib/context';
import { NodeEnv } from './lib/enums';
import { apolloComplexityPlugin } from './lib/plugins/complexity';
import { apolloSentryPlugin } from './lib/plugins/sentry';
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

export const createServer = (
  {
    context,
  }: {
    context: ApolloContext | ContextFunction<ExpressContext, ApolloContext>;
  } = {
    context: createContext,
  },
) => {
  return new ApolloServer<ExpressContext | Partial<ApolloContext>>({
    schema,
    context,
    introspection: true,
    csrfPrevention: true,
    debug: process.env.NODE_ENV === NodeEnv.Dev,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      responseCachePlugin(),
      apolloComplexityPlugin(schema),
      apolloSentryPlugin,
    ],
    validationRules: [depthLimit(10)],
  });
};

export const createTestServer = () => {
  return createServer({
    context: ctx => {
      return {
        user: null,
        userProfile: null,
        dataLoaders,
        ...ctx,
      };
    },
  });
};

export async function startServer(server: ApolloServer) {
  const app = express();
  const httpServer = http.createServer(app);

  await server.start();
  server.applyMiddleware({ app });

  httpServer.listen({ port: 4000 }, () => {
    // eslint-disable-next-line no-console
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
  });
}

export const startTestServer = async (server: ApolloServer) => {
  const app = express();
  const httpServer = http.createServer(app);

  await server.start();
  server.applyMiddleware({ app });

  httpServer.listen({ port: 0 });
};

export const stopTestServer = async (server: ApolloServer) => {
  await server.stop();
};
