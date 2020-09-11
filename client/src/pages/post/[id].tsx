import React from 'react';
import { withUrqlClient } from 'next-urql';

import { createUrqlClient } from '../../utils/createUrqlClient';
import { Layout } from '../../components/Layout';
import { Heading, Box } from '@chakra-ui/core';
import { useGetPostFromUrl } from '../../utils/useGetPostFromURL';
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';

const Post = ({}) => {
  const [{ data, error, fetching }] = useGetPostFromUrl();

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
        <Box display="flex" justifyContent="flex-end" mt="4">
          <EditDeletePostButtons
            id={data.post.id}
            creatorId={data.post.creator.id}
          />
        </Box>
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
