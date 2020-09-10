import React, { useState } from 'react';
import NextLink from 'next/link';
import { Flex, IconButton, Box, Heading, Text, Link } from '@chakra-ui/core';

import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface PostProps {
  post: PostSnippetFragment;
}

type ActionType = {
  up?: boolean;
  down?: boolean;
};

type LoadingType = 'not-loading' | 'up-loading' | 'down-loading';

export const PostComponent: React.FC<PostProps> = ({
  post: {
    id,
    voteStatus,
    points,
    title,
    creator: { username },
    textSnippet,
  },
}) => {
  const [voteLoading, setVoteLoading] = useState<LoadingType>('not-loading');
  const [, vote] = useVoteMutation();

  const onVote = async (action: ActionType) => {
    if (action.up) {
      setVoteLoading('up-loading');
      await vote({
        postId: id,
        value: 1,
      });
      setVoteLoading('not-loading');
    } else {
      setVoteLoading('down-loading');
      await vote({
        postId: id,
        value: -1,
      });
      setVoteLoading('not-loading');
    }
  };

  return (
    <Flex key={id} p={5} mb={8} shadow="md" borderWidth="1px">
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        mr={4}
      >
        <IconButton
          onClick={() => onVote({ up: true })}
          icon="chevron-up"
          aria-label="Up Vote"
          variant="outline"
          variantColor="green"
          isLoading={voteLoading === 'up-loading'}
          isDisabled={voteStatus !== 1 || voteStatus === null ? false : true}
        />
        {points}
        <IconButton
          onClick={() => onVote({ down: true })}
          icon="chevron-down"
          aria-label="Down Vote"
          variant="outline"
          variantColor="red"
          isLoading={voteLoading === 'down-loading'}
          isDisabled={voteStatus !== -1 || voteStatus === null ? false : true}
        />
      </Flex>
      <Box>
        <NextLink href={`/post/[id]`} as={`/post/${id}`}>
          <Link>
            <Heading fontSize="xl">{title}</Heading>{' '}
          </Link>
        </NextLink>

        <Text color="gray.500">posted by: {username}</Text>
        <Text mt={4}>{textSnippet}</Text>
      </Box>
    </Flex>
  );
};
