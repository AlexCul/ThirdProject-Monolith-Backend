import { IResolvers } from '@graphql-tools/utils';
import { PubSub } from "graphql-subscriptions";

// Я клянусь, я перебровал все способы настроить 
// TypeScript, чтобы работал абсолютный путь,
// уже просто на клавиатуре танцевал,
// настраивая outDir, rootDir, rootDirs,
// baseUrl, paths, но ничего не помогло.
// Сегодня 25 января, у меня осталось 2 дня до сдачи
// проекта, а я пишу бэкенд. Надо торопиться.
// Так что я просто тут относительный путь пропишу,
// но упомяну, что можно настроить TypeScript на 
// абсолютные пути (это просто я дурак, что не смог)
import { Post } from "../../db/models/post";

import { createMinIOClient, getMedia } from "../../utils/minio/helper";

const client = createMinIOClient({});
const pubSub = new PubSub();

const postResolver: IResolvers = {
    Query: {
        post: async (_: any, { id }: { id: string }) => {
            try {
                const foundPost = await Post.findById(id);
                if (!foundPost) throw new Error("Post is not found");
                return foundPost;
            } catch (error) {
                throw new Error(
                    `Post with id ${id} not found: ${(error as Error).message}`,
                );
            }
        },

        randomPosts: async (_: any, { count }: { count: number }) => {
            try {
                const posts = await Post.aggregate([
                    { $sample: { size: count } },
                ]);

                return posts
                    .map(post => ({
                        ...post,
                        id: post._id.toString(),
                    }));
            } catch (error) {
                throw new Error(
                    `Random posts loading error: ${(error as Error).message}`,
                );
            }
        },

        likesCount: async (_: any, { id }: { id: string }) => {
            try {
                const foundPost = await Post.findById(id);
                if (!foundPost) return null;

                return foundPost.likes.length;
            } catch (error) {
                throw new Error(
                    `Likes count loading error: ${(error as Error).message}`,
                );
            }
        },
        commentsCount: async (_: any, { id }: { id: string }) => {
            try {
                const foundPost = await Post.findById(id);
                if (!foundPost) return null;

                return foundPost.comments.length;
            } catch (error) {
                throw new Error(
                    `Comments count loading error: ${(error as Error).message}`,
                );
            }
        },
        firstMedia: async (_: any, { id }: { id: string }) => {
            try {
                const foundPost = await Post.findById(id);
                if (!foundPost) return null;

                if (!foundPost.media[0]) return null;
                return foundPost.media[0];
            } catch (error) {
                throw new Error(
                    `First media loading error: ${(error as Error).message}`,
                );
            }
        },
        firstMediaForPosts: async (_: any, {
            ids,
        }: { ids: string[] }) => {
            try {
                let result = [];
                for (let id of ids) {
                    const foundPost = await Post.findById(id);
                    if (!foundPost) {
                        result.push({
                            base64: null,
                        });
                        continue;
                    }

                    if (!foundPost.media[0]) {
                        result.push({
                            base64: null,
                        });
                        continue;
                    }

                    result.push(
                        foundPost.media[0],
                    );
                }

                return result;
            } catch (error) {
                throw new Error(
                    `First media for posts loading error: ${(error as Error).message}`,
                );
            }
        },
    },

    Subscription: {
        postsByTags: async (_: any, { tags }: { tags: string[] }) => {
            return pubSub.asyncIterableIterator(
                `postsByTags-${tags.join("-")}`,
            );
        },
    },
};

export default postResolver;
