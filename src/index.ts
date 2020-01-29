import 'reflect-metadata';

import Koa from 'koa';
import Range from 'koa-range';
import Serve from 'koa-static';
import { ApolloServer, gql } from 'apollo-server-koa';
import {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
} from 'graphql-iso-date';

import { Twitter } from './twitter';
import { createConnection, getManager } from 'typeorm';
import { User } from './entity/User';
import { Status } from './entity/Status';
import { Media } from './entity/Media';

const env = process.env.NODE_ENV || 'development';
const config = require(`../config.${env}.js`);
const app = new Koa();

app.use(Range);

const twitterClient = new Twitter(config.twitter);

const apolloServer = new ApolloServer({
  typeDefs: gql`
    scalar Date
    scalar Time
    scalar DateTime
    
    type Query {
        hello: String!

        statuses: [Status!]!
    }
    
    type Mutation {
        saveTweet(id: ID!): Result!
    }
    
    type Result {
        success: Boolean!
        message: String
    }
    
    type User {
        id: ID!
        name: String!
        screenName: String!

        statuses: [Status!]
    }
    
    type Status {
        id: ID!
        text: String!
        createdAt: DateTime!

        user: User
        media: [Media!]
        
        deletedAt: DateTime
    }
    
    type Media {
        id: String!
        type: MediaType!
        url: String!
        ext: String!
        createdAt: DateTime!
        
        status: Status
    }
    
    enum MediaType {
        photo
        video
    }
  `,
  resolvers: {
    Date: GraphQLDate,
    Time: GraphQLTime,
    DateTime: GraphQLDateTime,
    Query: {
      hello: async () => {
        if (!twitterClient.user) await twitterClient.accountVerifyCredentials();
        return `Hello ${twitterClient.user?.name}(@${twitterClient.user?.screen_name})`;
      },
      statuses: async () => Status.find({
        where: {
          deletedAt: null,
        },
        relations: ['user', 'media'],
      }),
    },
    Mutation: {
      saveTweet: async (parent, { id }) => {
        const status = await twitterClient.getStatus(id)
          .catch(() => {});
        if (!status) return { success: false, message: 'status not found' };
        const dbStatus = Status.fromTwitter(status);
        const user = User.fromTwitter(status.user);
        dbStatus.user = user;
        const media = status.extended_entities.media.map((m) => {
          const me = Media.fromTwitter(m);
          me.status = dbStatus;
          return me;
        });
        await getManager().transaction(async (manager) => {
          if (!(await manager.findOne(User, { where: { id: user.id }}))) {
            await manager.save(user);
          }
          if (!(await manager.findOne(Status, { where: { id: dbStatus.id }}))) {
            await manager.save(dbStatus);
          }
          const dbMedia = (await manager.find(Media, { where: { id: media.map(({ id }) => id ) } }))
            .map(({ id }) => id);
          const saveMedia = media.filter(({ id }) => !dbMedia.includes(id));
          await manager.save(saveMedia);
          await Promise.all(saveMedia.map((s) => s.saveMediaToLocal()));
        });
        return { success: true };
      },
    },
  },
  tracing: env !== 'production',
});

apolloServer.applyMiddleware({ app });

app.use(Serve('public'));

const port = process.env.PORT || 8080;
(async () => {
  await createConnection();

  const server = app.listen(port, () => {
    apolloServer.installSubscriptionHandlers(server);
    console.log(`listen at: http://localhost:${port}`);
    console.log(`graphql  : http://localhost:${port}${apolloServer.graphqlPath}`);
  });
})();
