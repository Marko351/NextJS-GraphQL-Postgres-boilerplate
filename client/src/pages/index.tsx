import { PostsQuery, usePostsQuery } from '../generated/graphql';
import { Layout } from '../components/Layout';
import { Button, Flex, Spinner } from '@chakra-ui/core';

import { PostCard } from '../components/PostCard';
import { withApollo } from '../utils/withApollo';

type Variables = {
  limit: number;
  cursor: string | null;
};

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 15,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  const onLoadMoreClick = () => {
    if (data) {
      fetchMore({
        variables: {
          limit: variables?.limit,
          cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
        },
        // updateQuery: (previousValue, { fetchMoreResult }): PostsQuery => {
        //   if (!fetchMoreResult) return previousValue as PostsQuery;

        //   return {
        //     __typename: 'Query',
        //     posts: {
        //       __typename: 'PaginatedPosts',
        //       hasMore: (fetchMoreResult as PostsQuery).posts.hasMore,
        //       posts: [
        //         ...(previousValue as PostsQuery).posts.posts,
        //         ...(fetchMoreResult as PostsQuery).posts.posts,
        //       ],
        //     },
        //   };
        // },
      });
    }
  };

  if (!loading && !data) {
    return (
      <div>
        <div>Error</div>
        <div>{error?.message}</div>
      </div>
    );
  }

  let loader = null;
  if (!data && loading) loader = <Spinner size="xl" />;
  return (
    <Layout>
      <Flex justify="center">{loader}</Flex>
      {data &&
        data.posts.posts.map((post) =>
          !post ? null : <PostCard key={post.id} post={post} />
        )}
      {data && data.posts.hasMore && (
        <Button
          onClick={onLoadMoreClick}
          isLoading={loading}
          width="100%"
          size="sm"
          variant="outline"
          background="tan"
          mb={4}
        >
          Load More
        </Button>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
