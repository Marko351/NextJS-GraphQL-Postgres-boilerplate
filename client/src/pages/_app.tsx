import { CSSReset, ThemeProvider } from '@chakra-ui/core';
import theme from '../theme';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { PaginatedPosts } from '../generated/graphql';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
  // fetchOptions: {
  //   credentials: 'include' as const,
  //   // headers: cookie ? { cookie } : undefined,
  // },
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: [],
            merge(
              existing: PaginatedPosts | undefined,
              incoming: PaginatedPosts
            ): PaginatedPosts {
              return {
                __typename: 'PaginatedPosts',
                hasMore: incoming.hasMore,
                posts: [...(existing?.posts || []), ...incoming.posts],
              };
            },
          },
        },
      },
    },
  }),
});

function MyApp({ Component, pageProps }: any) {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        {/* <ColorModeProvider> */}
        <CSSReset />
        <Component {...pageProps} />
        {/* </ColorModeProvider> */}
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default MyApp;
