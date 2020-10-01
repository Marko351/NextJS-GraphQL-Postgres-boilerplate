import React, { useState } from 'react';
import NextLink from 'next/link';
import { Flex, IconButton, Box, Heading, Text, Link } from '@chakra-ui/core';
import gql from 'graphql-tag';
import { ApolloCache } from '@apollo/client';

import {
  PostSnippetFragment,
  useVoteMutation,
  VoteMutation,
} from '../generated/graphql';
import { EditDeletePostButtons } from './EditDeletePostButtons';

interface PostProps {
  post: PostSnippetFragment;
}

type ActionType = {
  up?: boolean;
  down?: boolean;
};

type LoadingType = 'not-loading' | 'up-loading' | 'down-loading';

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });
  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    console.log('object', data);
    console.log('value', value);
    let newPoints;
    if (data.points === -1) {
      newPoints = data.points + (value < 0 ? -1 : +2);
    } else if (data.points === 1) {
      newPoints = data.points + (value < 0 ? -2 : +1);
    } else {
      newPoints = (data.points as number) + (value < 0 ? -1 : +1);
    }
    cache.writeFragment({
      id: 'Post:' + postId,
      fragment: gql`
        fragment _ on Post {
          id
          points
          voteStatus
        }
      `,
      data: { id: postId, points: newPoints, voteStatus: value },
    });
  }
};

export const PostCard: React.FC<PostProps> = ({
  post: {
    id,
    voteStatus,
    points,
    title,
    creator: { username, id: creatorId },
    textSnippet,
  },
}) => {
  const [voteLoading, setVoteLoading] = useState<LoadingType>('not-loading');
  const [vote] = useVoteMutation();

  const onVote = async (action: ActionType) => {
    if (action.up) {
      setVoteLoading('up-loading');
      await vote({
        variables: {
          postId: id,
          value: 1,
        },
        update: (cache) => updateAfterVote(1, id, cache),
      });
      setVoteLoading('not-loading');
    } else {
      setVoteLoading('down-loading');
      await vote({
        variables: {
          postId: id,
          value: -1,
        },
        update: (cache) => updateAfterVote(-1, id, cache),
      });
      setVoteLoading('not-loading');
    }
  };

  return (
    <Flex shadow="md" borderWidth="1px" p={5} mb={8}>
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
      <Flex ml={'auto'} mt="auto" justifyContent="flex-end">
        {' '}
        <EditDeletePostButtons id={id} creatorId={creatorId} />{' '}
      </Flex>
    </Flex>
  );
};
