import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '**/*.graphql',
  generates: {
    'generated/graphql.ts': {
      config: {
        contextType: '../src/lib/context#ApolloContext',
        mappers: {
          User: '.prisma/client#User as UserType',
        },
        scalars: {
          DateTime: 'Date',
        },
      },
      plugins: [
        'typescript',
        'typescript-resolvers',
        'typescript-document-nodes',
      ],
    },
  },
};

export default config;
