import { NavBar } from '../components/NavBar';

import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';
import { Fragment } from 'react';

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <Fragment>
      <NavBar />

      <div>Hellodasdasdasd</div>
      {data && data.posts.map((post) => <div key={post.id}>{post.title}</div>)}
    </Fragment>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
