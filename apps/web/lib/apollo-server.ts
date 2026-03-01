import { cookies } from 'next/headers';
import { HttpLink } from '@apollo/client';
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';

export const { getClient, query, PreloadQuery } = registerApolloClient(async () => {
  const cookieStore = await cookies();
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- provided by Doppler, absence = visible runtime error
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
      headers: {
        Cookie: cookieStore.toString(),
      },
    }),
  });
});
