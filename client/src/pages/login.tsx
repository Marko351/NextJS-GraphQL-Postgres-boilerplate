import React from 'react';
import { Formik, Form } from 'formik';
import { Box, Button, Link, Flex } from '@chakra-ui/core';
import { useRouter } from 'next/router';

import { Wrapper } from '../components/Wrapper';
import { InputFiled } from '../components/InputFiled';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import NextLink from 'next/link';
import { withApollo } from '../utils/withApollo';

interface registerProps {}

const Login: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ variables: values });
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push(router.query.next ? `${router.query.next}` : '/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputFiled
              name="usernameOrEmail"
              placeholder="usernameOrEmail"
              label="Username or Email"
            />
            <Box mt={4}>
              <InputFiled
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex justify="space-between">
              <Button
                type="submit"
                variantColor="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Login
              </Button>
              <Box mt={4}>
                <NextLink href="/forgot-password">
                  <Link style={{ color: 'blue' }}>Forgot password?</Link>
                </NextLink>
              </Box>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(Login);
