import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import mediaResolver from "./resolvers/media";
import postResolver from "./resolvers/post";
import userResolver from "./resolvers/user";

import mediaSchema from './schemas/media';
import postSchema from './schemas/post';
import userSchema from './schemas/user';

const typeDefs = mergeTypeDefs([
    postSchema, userSchema,
    mediaSchema,
]);
const resolvers = mergeResolvers([
    postResolver, userResolver,
    mediaResolver,
]);

const fullSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const fullHandler = createHandler({
    schema: fullSchema,
});

export default fullHandler;
