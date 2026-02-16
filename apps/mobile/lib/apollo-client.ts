import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistCache } from "apollo3-cache-persist";

const API_URL =
  process.env.EXPO_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

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

  return new ApolloClient({
    link: httpLink,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
    },
  });
}
