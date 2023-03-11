import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.API_URL,
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...(headers as Record<string, string>),
      authorization: `Bearer ${''}`,
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
