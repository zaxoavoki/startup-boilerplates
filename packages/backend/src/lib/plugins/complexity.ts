import { ValidationError } from 'apollo-server';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { GraphQLSchema } from 'graphql';
import {
  directiveEstimator,
  fieldExtensionsEstimator,
  simpleEstimator,
  getComplexity,
} from 'graphql-query-complexity';

import { NodeEnv } from '../enums';

const MAX_QUERY_COMPLEXITY = 200;

export const apolloComplexityPlugin: (
  schema: GraphQLSchema,
) => ApolloServerPlugin = (schema: GraphQLSchema) => {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await -- TS requires this to be async
    async requestDidStart() {
      return {
        // eslint-disable-next-line @typescript-eslint/require-await -- TS requires this to be async
        async didResolveOperation({ request, document }) {
          const complexity = getComplexity({
            schema,
            operationName: request.operationName,
            query: document,
            variables: request.variables,
            estimators: [
              directiveEstimator(),
              fieldExtensionsEstimator(),
              simpleEstimator({ defaultComplexity: 1 }),
            ],
          });

          if (complexity > MAX_QUERY_COMPLEXITY) {
            throw new ValidationError(
              `Too complicated query! ${complexity} is over ${MAX_QUERY_COMPLEXITY} that is the max allowed complexity.`,
            );
          }

          if (
            process.env.NODE_ENV === NodeEnv.Dev &&
            request.operationName !== 'IntrospectionQuery'
          ) {
            // eslint-disable-next-line no-console -- This is a development only log
            console.log(
              `${request.operationName ?? 'Unnamed'} query complexity points:`,
              complexity,
            );
          }
        },
      };
    },
  };
};
