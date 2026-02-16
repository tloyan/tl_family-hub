import type { ApolloClient } from "@apollo/client/core";
import { ApolloProvider as BaseApolloProvider } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { initApolloClient } from "@/lib/apollo-client";

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ApolloClient>();
  const [error, setError] = useState<Error>();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    initApolloClient()
      .then((c) => {
        if (!cancelled) setClient(c);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      });

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 16, marginBottom: 12, textAlign: "center" }}>
          Unable to connect to the server
        </Text>
        <Pressable
          onPress={() => {
            setError(undefined);
            setRetryCount((c) => c + 1);
          }}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "#222",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14 }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <BaseApolloProvider client={client}>{children}</BaseApolloProvider>
  );
}
