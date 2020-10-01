import React from 'react';
import { Box, Link, Flex, Button, Icon, Text, Heading } from '@chakra-ui/core';
import NextLink from 'next/link';

import { useMeQuery, useLogoutMutation } from '../generated/graphql';
import { isServer } from '../utils/isServer';
// import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/client';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  // const router = useRouter();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const apollo = useApolloClient();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  let body = null;

  if (loading) {
  }
  body = (
    <Box mx="auto" w="100%" display="flex" justifyContent="space-between">
      <Box display="flex" alignItems="center">
        <NextLink href="/">
          <Link mr={4}>
            <Heading as="h5" size="lg">
              {' '}
              Reddit
            </Heading>
          </Link>
        </NextLink>
        <NextLink href="/create-post">
          <Link>
            Add Post <Icon name="plus-square" size="20px" color="green.500" />
          </Link>
        </NextLink>
      </Box>
      {!data?.me ? (
        <Box>
          <NextLink href="/login">
            <Link color="black" mr={4}>
              Login
            </Link>
          </NextLink>
          <NextLink href="/register">
            <Link color="black">Register</Link>
          </NextLink>
        </Box>
      ) : (
        <Box>
          <Text mr={4} display="inline-block">
            {data.me.username}
          </Text>
          <Button
            onClick={async () => {
              await logout();
              await apollo.resetStore();
            }}
            isLoading={logoutFetching}
            variant="link"
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Flex
      zIndex={1}
      position="sticky"
      top={0}
      bg="tan"
      p={4}
      justify="space-between"
    >
      {/* <Box ml={'auto'}>{body}</Box>
       */}
      {body}
    </Flex>
  );
};
