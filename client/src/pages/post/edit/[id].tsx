import React from 'react';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { Layout } from '../../../components/Layout';
import { Formik, Form } from 'formik';
import { InputFiled } from '../../../components/InputFiled';
import { Box, Flex, Button } from '@chakra-ui/core';
import { useGetPostFromUrl } from '../../../utils/useGetPostFromURL';
import { useUpdatePostMutation } from '../../../generated/graphql';
import { useGetIntId } from '../../../utils/useGetIntId';
import { useRouter } from 'next/router';

const EditPost = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();
  const [{ data, error, fetching }] = useGetPostFromUrl();
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return <Layout>loading....</Layout>;
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
    <Layout variant="small">
      <Formik
        initialValues={{ text: data.post.text, title: data.post.title }}
        onSubmit={async (values) => {
          await updatePost({
            id: intId,
            title: values.title,
            text: values.text,
          });
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputFiled name="title" placeholder="title" label="Title" />
            <Box mt={4}>
              <InputFiled
                textarea
                name="text"
                placeholder="text"
                label="Text"
              />
            </Box>
            <Flex justify="space-between">
              <Button
                type="submit"
                variantColor="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Update Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
