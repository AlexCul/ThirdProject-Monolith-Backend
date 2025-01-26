import fs from "fs";

import { buildSchema } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import postResolver from "./resolvers/post";
import userResolver from "./resolvers/user";

import postSchema from './schemas/post';
import userSchema from './schemas/user';

const typeDefs = mergeTypeDefs([postSchema, userSchema]);
const resolvers = mergeResolvers([postResolver, userResolver]);

const fullSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const fullHandler = createHandler({
    schema: fullSchema,
});

export default fullHandler;
