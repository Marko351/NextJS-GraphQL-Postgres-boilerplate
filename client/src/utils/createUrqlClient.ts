import { fetchExchange, Exchange, stringifyVariables } from 'urql';
import {
  cacheExchange,
  Cache,
  QueryInput,
  Resolver,
} from '@urql/exchange-graphcache';
import { pipe, tap } from 'wonka';
import gql from 'graphql-tag';

import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
  VoteMutationVariables,
  DeletePostMutationVariables,
} from '../generated/graphql';
import router from 'next/router';
import { isServer } from './isServer';

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes('not authenticated')) {
        router.replace('/login');
      }
    })
  );
};

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    // console.log('All Fields: ', allFields);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    // console.log('Key we created: ', fieldKey);
    // If fieldKey is in the cache than info.partial is false and we do not need to update tha cache, else we will update the cahce to display new paginated data
    // do console.log() on variables if something is unclear in the future
    const isItInTheCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      'posts'
    );
    info.partial = !isItInTheCache;
    let hasMore = true;
    let results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, 'posts') as string[];
      const _hasMore = cache.resolve(key, 'hasMore');
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results,
    };
  };
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = '';
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }
  return {
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
      headers: cookie ? { cookie } : undefined,
    },
    exchanges: [
      // debugExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        // This is used to update cache because URQL doesn't update cache when we register/login/... and we need to do this manually
        updates: {
          Mutation: {
            deletePost: (_result, args, cache, _info) => {
              cache.invalidate({
                __typename: 'Post',
                id: (args as DeletePostMutationVariables).id,
              });
            },
            vote: (_result, args, cache, _info) => {
              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId } as any
              );
              if (data) {
                if (data.voteStatus === args.value) {
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
                cache.writeFragment(
                  gql`
                    fragment _ on Post {
                      id
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value } as any
                );
              }
            },
            createPost: (_result, _args, cache, _info) => {
              // Lookup for all fields you send
              const allFields = cache.inspectFields('Query');
              // console.log('All Fields: ', allFields);
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === 'posts'
              );
              fieldInfos.forEach((field) => {
                cache.invalidate('Query', 'posts', field.arguments || {});
              });
              // Refetch data from the cache
              cache.invalidate('Query', 'posts', {
                limit: 15,
              });
            },
            logout: (_result, _args, cache, _info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
            login: (_result, _args, cache, _info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
            },
            register: (_result, _args, cache, _info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
