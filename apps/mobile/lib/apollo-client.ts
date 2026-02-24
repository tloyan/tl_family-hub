import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';
import { SetContextLink } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistCache } from 'apollo3-cache-persist';

import { authClient } from './auth-client';

const API_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL ?? 'http://localhost:4000/graphql';

export async function initApolloClient() {
  const cache = new InMemoryCache();

  try {
    await persistCache({
      cache,
      storage: AsyncStorage,
    });
  } catch {
    // Cache restoration failed — start with empty cache
  }

  const httpLink = new HttpLink({ uri: API_URL });

  const authLink = new SetContextLink((prevContext) => {
    const cookie = authClient.getCookie();
    return {
      headers: {
        ...(prevContext.headers as Record<string, string> | undefined),
        ...(cookie ? { cookie } : {}),
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
}
