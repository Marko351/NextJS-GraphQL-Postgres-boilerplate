import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { createConnection } from 'typeorm';
import cors from 'cors';
import path from 'path';

import { __prod__, COOKIE_NAME } from './constants';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { Updoot } from './entities/Updoot';

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'reddit',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    synchronize: true,
    port: 6432,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [Post, User, Updoot],
  });
  await conn.runMigrations();
  // const migrations = await conn.undoLastMigration();
  // console.log('MIASJFDJASDLJASDLJ', migrations);

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // ten years,
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__, // cookie only works in http
      },
      saveUninitialized: false,
      secret: 'sghfjgklagkldjfglkjdflsg',
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log('server started on localhost 4000!');
  });
};

main().catch((err) => {
  console.log(err);
});
