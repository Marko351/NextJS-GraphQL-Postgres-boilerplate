import React from 'react';

import { Layout } from '../../components/Layout';
import { Heading, Box } from '@chakra-ui/core';
import { useGetPostFromUrl } from '../../utils/useGetPostFromURL';
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';
import { withApollo } from '../../utils/withApollo';

const Post = ({}) => {
  const { data, error, loading } = useGetPostFromUrl();

  if (loading) {
    return <Layout>{loading}</Layout>;
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

export default withApollo({ ssr: true })(Post);
