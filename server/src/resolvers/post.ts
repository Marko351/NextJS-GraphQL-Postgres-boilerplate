import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Field,
  Ctx,
  InputType,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from 'type-graphql';
import { Post } from '../entities/Post';
import { MyContext } from '../types';
import { isAuth } from '../meddleware/isAuth';
import { getConnection } from 'typeorm';
import { Updoot } from '../entities/Updoot';
import e from 'express';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;
    const isUpdoot = value > -1;
    const realValue = isUpdoot ? 1 : -1;

    const updoot = await Updoot.findOne({ where: { postId, userId } });

    //the users voted before and theyare changing their vote
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tr) => {
        await tr.query(`
        UPDATE updoot
        SET value = ${realValue}
        WHERE "postId" = ${postId} and "userId" = ${userId}`);

        await tr.query(`
        UPDATE post
        SET points = points + ${realValue}
        WHERE "id" = ${postId}`);
      });
    } else if (!updoot) {
      // have never voted before
      await getConnection().transaction(async (tr) => {
        await tr.query(`
          INSERT INTO updoot ("userId", "postId", value)
          VALUES (${userId}, ${postId}, ${realValue})`);

        await tr.query(`
          UPDATE post
          SET points = points + ${realValue} 
          WHERE id = ${postId}
        `);
      });
    }

    // SQL Transaction
    // await getConnection().query(`
    //   START TRANSACTION;

    //   INSERT INTO updoot ("userId", "postId", value)
    //   VALUES (${userId}, ${postId}, ${realValue});

    //   UPDATE post
    //   SET points = points + ${realValue}
    //   WHERE id = ${postId};

    //   COMMIT;
    // `);
    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPluOne = realLimit + 1;
    const { userId } = req.session;

    const posts = await getConnection().query(
      `
      select p.*, 
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
      ) creator,
      ${
        userId
          ? `(select value from updoot where "userId" = ${userId} and "postId" = p.id) "voteStatus"`
          : 'null as "voteStatus"'
      }
      from post p 
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < ${cursor}` : ''} 
      order by p."createdAt" DESC 
      limit ${realLimitPluOne}`
    );
    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder('p')
    //   .innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', 'DESC')
    //   .take(realLimitPluOne);

    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const posts = await qb.getMany();

    return {
      posts: posts.slice(0, realLimitPluOne),
      hasMore: posts.length === realLimitPluOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ['creator'] });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const { userId } = req.session;
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({
        title,
        text,
      })
      .where('id = :id and "creatorId" = :creatorId', { id, creatorId: userId })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const { userId } = req.session;
    // const post = await Post.findOne(id);
    // if (!post) {
    //   return false;
    // }
    // if (post.creatorId !== userId) {
    //   throw new Error('not authorized');
    // }
    // await Updoot.delete({ postId: id });
    await Post.delete({ id, creatorId: userId });
    return true;
  }
}
