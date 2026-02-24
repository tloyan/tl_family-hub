import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';

const httpLink = new HttpLink({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- provided by Doppler, absence = visible runtime error
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
  credentials: 'include',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
