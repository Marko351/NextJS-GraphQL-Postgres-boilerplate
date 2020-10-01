import React from 'react';
import { Formik, Form } from 'formik';
import { InputFiled } from '../components/InputFiled';
import { Box, Flex, Button } from '@chakra-ui/core';
import { useCreatePostMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout';
import { useIsAuth } from '../utils/useIsAuth';

interface CreatePostProps {}

const CreatePost: React.FC<CreatePostProps> = ({}) => {
  const router = useRouter();
  useIsAuth();

  const [createPost] = useCreatePostMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ text: '', title: '' }}
        onSubmit={async (values) => {
          const { errors } = await createPost({ variables: { input: values } });
          if (!errors) {
            router.push('/');
          }
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
                Create Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default CreatePost;
