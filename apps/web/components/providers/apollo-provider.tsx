'use client';

import { HttpLink } from '@apollo/client';
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';

function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- provided by Doppler, absence = visible runtime error
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
      credentials: 'include',
    }),
  });
}

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}
