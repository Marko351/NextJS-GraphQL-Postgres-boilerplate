import React, { Fragment } from 'react';
import { Box, Link, Flex, Button, Icon, Text } from '@chakra-ui/core';
import NextLink from 'next/link';

import { useMeQuery, useLogoutMutation } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  let body = null;

  if (fetching) {
  }
  body = (
    <Fragment>
      <Box>
        <NextLink href="/">
          <Link mr={4}>Home</Link>
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
            onClick={() => {
              logout();
            }}
            isLoading={logoutFetching}
            variant="link"
          >
            Logout
          </Button>
        </Box>
      )}
    </Fragment>
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
