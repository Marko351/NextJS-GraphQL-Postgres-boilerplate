import React, { useState } from 'react';
import { Wrapper } from '../components/Wrapper';
import { Formik, Form } from 'formik';
import { InputFiled } from '../components/InputFiled';
import { Button, Box } from '@chakra-ui/core';
import { useForgotPasswordMutation } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword({ variables: { email: values.email } });
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>Please check out your email to find reset password link</Box>
          ) : (
            <Form>
              <InputFiled
                name="email"
                placeholder="email"
                label="Email"
                type="email"
              />
              <Button
                type="submit"
                variantColor="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Forgot Password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
