'use client';

import { ApolloLink, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';
import { OperationTypeNode } from 'graphql';
import { createClient } from 'graphql-ws';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- provided by Doppler, absence = visible runtime error
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL!;
const WS_URL = GRAPHQL_URL.replace(/^http/, 'ws');

function makeClient() {
  const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
    credentials: 'include',
  });

  const contextLink = new ApolloLink((operation, forward) => {
    const ctx = operation.getContext();
    const ctxHeaders = ctx.headers as Record<string, string> | undefined;
    if (ctxHeaders) {
      operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
        headers: { ...headers, ...ctxHeaders },
      }));
    }
    return forward(operation);
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: WS_URL,
      lazy: true,
    }),
  );

  const link = ApolloLink.split(
    ({ operationType }) => operationType === OperationTypeNode.SUBSCRIPTION,
    wsLink,
    ApolloLink.from([contextLink, httpLink]),
  );

  return new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });
}

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}
