import React, { Fragment } from 'react';
import { IconButton } from '@chakra-ui/core';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';
import { useRouter } from 'next/router';

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const { data: meData } = useMeQuery();
  const [deletePost] = useDeletePostMutation();
  const router = useRouter();

  const onDeletePost = async (id: number) => {
    await deletePost({
      variables: { id },
      update: (cache) => {
        cache.evict({ id: 'Post:' + id });
      },
    });
  };

  const onUpdatePostClick = (id: number) => {
    router.push('/post/edit/' + id);
  };
  if (meData?.me?.id === creatorId) {
    return (
      <Fragment>
        <IconButton
          onClick={() => onUpdatePostClick(id)}
          icon="edit"
          aria-label="edit-post"
          variantColor="orange"
        />
        <IconButton
          onClick={() => onDeletePost(id)}
          icon="delete"
          aria-label="delete-post"
          variantColor="red"
          ml="2"
        />
      </Fragment>
    );
  } else {
    return null;
  }
};
