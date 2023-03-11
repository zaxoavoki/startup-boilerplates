import {
  ApolloServerPlugin,
  GraphQLRequestContextDidEncounterErrors,
} from '@apollo/server';
import * as Sentry from '@sentry/node';
import { GraphQLError } from 'graphql';

import { ApolloContext } from '../context';
import { NodeEnv } from '../enums';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend: event => {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === NodeEnv.Dev) {
      return null;
    }
    return event;
  },
});

export const apolloSentryPlugin: ApolloServerPlugin = {
  // eslint-disable-next-line @typescript-eslint/require-await -- TS requires this to be async
  async requestDidStart() {
    return {
      // eslint-disable-next-line @typescript-eslint/require-await -- TS requires this to be async
      async didEncounterErrors(
        ctx: GraphQLRequestContextDidEncounterErrors<ApolloContext>,
      ) {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === NodeEnv.Dev) {
          return;
        }

        if (!ctx.operation) {
          return;
        }

        for (const err of ctx.errors) {
          if (err.originalError instanceof GraphQLError) {
            continue;
          }

          Sentry.withScope(scope => {
            scope.setTag('kind', ctx.operation?.operation);
            scope.setTag('environment', process.env.NODE_ENV);
            // Add scope.setUser
            scope.setExtra('query', ctx.request.query);
            scope.setExtra('variables', ctx.request.variables);

            if (err.path) {
              scope.addBreadcrumb({
                category: 'query-path',
                message: err.path.join(' > '),
                level: 'debug',
              });
            }

            Sentry.captureException(err);
          });
        }
      },
    };
  },
};
