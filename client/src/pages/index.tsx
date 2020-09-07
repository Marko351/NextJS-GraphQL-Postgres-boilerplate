import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';
import { Layout } from '../components/Layout';
import {
  Stack,
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Spinner,
} from '@chakra-ui/core';
import { useState } from 'react';

type Variables = {
  limit: number;
  cursor: string | null;
};

const Index = () => {
  const [variables, setVariables] = useState<Variables>({
    limit: 10,
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
      <Stack spacing={8}>
        {data &&
          data.posts.posts.map((post) => (
            <Box key={post.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>{post.textSnippet}</Text>
            </Box>
          ))}
      </Stack>
      {data && data.posts.hasMore && (
        <Button
          onClick={onLoadMoreClick}
          isLoading={fetching}
          width="100%"
          size="sm"
          variant="outline"
          background="tan"
          my={4}
        >
          Load More
        </Button>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
