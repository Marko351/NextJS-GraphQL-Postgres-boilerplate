import React from 'react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';

import { createUrqlClient } from '../../utils/createUrqlClient';
import { usePostQuery } from '../../generated/graphql';
import { Layout } from '../../components/Layout';
import { Heading, Box } from '@chakra-ui/core';

interface PostProps {}

const Post = ({}) => {
  const router = useRouter();
  const intId =
    typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });

  if (fetching) {
    return <Layout>{fetching}</Layout>;
  }
  if (error) {
    return error.message;
  }
  if (!data?.post) {
    return (
      <Layout>
        <Box>Coul not find a post!</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box boxShadow="lg" p={6}>
        <Heading mb={4}>{data.post.title}</Heading>
        {data.post.text}
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
