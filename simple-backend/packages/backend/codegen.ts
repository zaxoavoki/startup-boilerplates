import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '**/*.graphql',
  generates: {
    'generated/graphql.ts': {
      config: {
        contextType: '../server/lib/context#ApolloContext',
        mappers: {
          User: '.prisma/client#User as UserType',
          Post: '.prisma/client#Post as PostType',
          Comment: '.prisma/client#Comment as CommentType',
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
