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
import { Server } from 'http';

import { ApolloContext, createContext, dataLoaders } from './lib/context';
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

const createApolloServer = (
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

export const createServer = () => {
  const server = createApolloServer({
    context: ctx => {
      return {
        user: null,
        userProfile: null,
        dataLoaders,
        ...ctx,
      };
    },
  });

  const app = express();
  let expressServer: Server | null = null;

  const startServer = async (port: number) => {
    await server.start();
    server.applyMiddleware({ app });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises -- it's ok
    expressServer = app.listen({ port }, async () => {
      await connectToDatabase();

      if (process.env.NODE_ENV !== NodeEnv.Testing) {
        // eslint-disable-next-line no-console -- start info
        console.log(
          `Server ready at http://localhost:${port}${server.graphqlPath}`,
        );
      }
    });
  };

  const stopServer = async () => {
    await server.stop();
    await disconnectFromDatabase();
    expressServer?.close();
  };

  return {
    server,
    startServer,
    stopServer,
  };
};
