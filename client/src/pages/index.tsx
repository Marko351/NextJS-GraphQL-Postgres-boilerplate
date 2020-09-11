import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';
import { Layout } from '../components/Layout';
import { Button, Flex, Spinner } from '@chakra-ui/core';
import { useState } from 'react';

import { PostCard } from '../components/PostCard';

type Variables = {
  limit: number;
  cursor: string | null;
};

const Index = () => {
  const [variables, setVariables] = useState<Variables>({
    limit: 15,
    cursor: null,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  const onLoadMoreClick = () => {
    if (data) {
      setVariables({
        limit: variables.limit,
        cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
      });
    }
  };

  let loader = null;
  if (!data && fetching) loader = <Spinner size="xl" />;
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
          isLoading={fetching}
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

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
