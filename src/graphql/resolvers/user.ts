import { IResolvers } from '@graphql-tools/utils';
import { PubSub } from "graphql-subscriptions";

import bcrypt from "bcrypt";

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
import { User } from "../../db/models/user";
import { Post } from "../../db/models/post";

import { createToken, verifyToken } from "../../utils/auth/jwt";

const pubSub = new PubSub();

type AuthPayload = {
    status: number;
    token: string;
};

const userResolver: IResolvers = {
    Query: {
        users: async (_: any) => {
            try {
                return await User.find();
            } catch (error) {
                throw new Error(
                    `Ошибка при загрузке пользователей: ${(error as Error).message}`,
                );
            }
        },
        user: async (_: any, { id }: { id: string }) => {
            try {
                return await User.findById(id);
            } catch (error) {
                throw new Error(
                    `Пользователь с id ${id} не найден: ${(error as Error).message}`,
                );
            }
        },
        userByNickname: async (_: any, {
            nickname,
        }: { nickname: string }) => {
            try {
                return await User.findOne({ nickname });
            } catch (error) {
                throw new Error(
                    `Find user by nickname error: ${(error as Error).message}`,
                );
            }
        },
        userByToken: async (_: any, { token }: { token: string }) => {
            try {
                const verifiedToken = verifyToken(token);
                if (verifiedToken === null) return null;
                return await User.findById(verifiedToken.userId);
            } catch (error) {
                throw new Error(
                    `User with token ${token} not found: ${(error as Error).message}`,
                );
            }
        },
        posts: async (_: any, { userId }: { userId: string }) => {
            try {
                const user = await User.findById(userId);
                if (!user) throw new Error("User not found");

                return user!.posts;
            } catch (error) {
                throw new Error(
                    `Posts loading error: ${(error as Error).message}`,
                );
            }
        },
        postsCount: async (_: any, { userId }: { userId: string }) => {
            try {
                const user = await User.findById(userId);
                if (!user) throw new Error("User not found");

                return user.posts.length;
            } catch (error) {
                throw new Error(
                    `Post with id ${userId} not found: ${(error as Error).message}`,
                );
            }
        },
        followersCount: async (_: any, { userId }: { userId: string }) => {
            try {
                const user = await User.findById(userId);
                if (!user) throw new Error("User not found");

                return user.followers.length;
            } catch (error) {
                throw new Error(
                    `Followers count error: ${(error as Error).message}`,
                );
            }
        },
        followingCount: async (_: any, { userId }: { userId: string }) => {
            try {
                const user = await User.findById(userId);
                if (!user) throw new Error("User not found");

                return user.following.length;
            } catch (error) {
                throw new Error(
                    `Following count error: ${(error as Error).message}`,
                );
            }
        },
    },

    Mutation: {
        createUser: async (_: any, {
            fullName, nickname,
            email, password,
        }): Promise<AuthPayload> => {
            try {
                const doesUserExist = await User.findOne({ email });
                if (doesUserExist) return {
                    status: 403,
                    token: "",
                };

                const user = new User({
                    fullName: fullName,
                    email: email,
                    nickname: nickname,
                    passwordHash: await bcrypt.hash(password, 10),
                });
                await user.save();

                return {
                    status: 201,
                    token: createToken(user._id.toString()),
                };
            } catch (error) {
                throw new Error(
                    `User create error: ${(error as Error).message}`,
                );
            }
        },
        deleteUser: async (_: any, {
            token,
        }): Promise<boolean> => {
            const verifiedToken = verifyToken(token);
            if (verifiedToken === null) return false;

            const deletedUser = await User.findByIdAndDelete(
                verifiedToken.userId,
            );

            // Автоматически переведётся из любого объекта в
            // boolean:
            // - если это найденный и уже удалённый документ,
            // переведётся в true
            // - если это null, то переведётся в false
            return !!deletedUser;
        },
        updateUser: async (_: any, {
            token, fullName, email, nickname,
            password, avatar, description, website,
        }): Promise<boolean> => {
            const verifiedToken = verifyToken(token);
            if (verifiedToken === null) return false;

            let updating = {};
            const updateIfExists = (key: string, value: any) => {
                if (value !== null) {
                    updating = { ...updating, [key]: value };
                }
            };

            updateIfExists("fullName", fullName);
            updateIfExists("email", email);
            updateIfExists("nickname", nickname);
            updateIfExists("passwordHash", bcrypt.hash(password, 10));
            updateIfExists("description", description);
            updateIfExists("website", website);
            updateIfExists("avatar", avatar);

            const updatedUser = await User.findByIdAndUpdate(
                verifiedToken.userId, updating,
            );
            
            // Автоматически переведётся из любого объекта в
            // boolean:
            // - если это найденный и уже обновлённый документ,
            // переведётся в true
            // - если это null, то переведётся в false
            return !!updatedUser;
        },
        login: async (_: any, {
            nickname, email,
            password,
        }): Promise<AuthPayload> => {
            try {
                const isThereEmail = email !== null;
                const isThereNickname = nickname !== null;

                let user = null;

                if (isThereNickname) {
                    user = await User.findOne({ nickname });
                } else if (isThereEmail) {
                    user = await User.findOne({ email });
                } else return {
                    status: 400,
                    token: "",
                };

                if (user === null ) return {
                    status: 400,
                    token: "",
                };

                const isPasswordCorrect = await bcrypt.compare(
                    password, user.passwordHash,
                );

                if (!isPasswordCorrect) {
                    return {
                        status: 401,
                        token: "",
                    };
                }

                return {
                    status: 200,
                    token: createToken(user!._id.toString()),
                };
            } catch (error) {
                throw new Error(
                    `Login error: ${(error as Error).message}`,
                );
            }
        },

        createPost: async (_: any, {
            token, title,
            media, description,
        }) => {
            try {
                const userId = await verifyToken(token)!.userId;
                if (userId === null) throw new Error("User not found");
                
                const updatedMedia = media.map((element: string) => {
                    return {
                        base64: element,
                    };
                });

                console.log(media);
                const post = new Post({
                    owner: userId,
                    title: title,
                    media: updatedMedia,
                    description: description,
                    user: userId,
                });
                await post.save();

                return {
                    ...post.toObject(),
                    id: post._id.toString(),
                };
            } catch (error) {
                throw new Error(
                    `User create error: ${(error as Error).message}`,
                );
            }
        },
        deletePost: async (_: any, {
            token, postId
        }): Promise<boolean> => {
            try {
                const verifiedToken = verifyToken(token);
                if (verifiedToken === null) return false;

                const foundUser = await User.findById(
                    verifiedToken.userId,
                );
                if (foundUser === null) return false;

                const deletedPost = await Post.findByIdAndDelete(
                    postId,
                );

                // Автоматически переведётся из любого объекта в
                // boolean:
                // - если это найденный и уже удалённый документ,
                // переведётся в true
                // - если это null, то переведётся в false
                return !!deletedPost;
            } catch (error) {
                throw new Error(
                    `Deleting post error: ${(error as Error).message}`,
                );
            }
        },
        updatePost: async (_: any, {
            token, postId, title,
            description, media,
        }): Promise<boolean> => {
            const verifiedToken = verifyToken(token);
            if (verifiedToken === null) return false;

            let updating = {};
            const updateIfExists = (key: string, value: any) => {
                if (value !== null) {
                    updating = { ...updating, [key]: value };
                }
            };

            updateIfExists("title", title);
            updateIfExists("description", description);
            updateIfExists("media", media);

            const updatedPost = await Post.findByIdAndUpdate(
                postId, updating,
            );
            
            // Автоматически переведётся из любого объекта в
            // boolean:
            // - если это найденный и уже обновлённый документ,
            // переведётся в true
            // - если это null, то переведётся в false
            return !!updatedPost;
        },
        follow: async (_: any, {
            token, toUser,
        }: {
            token: string,
            toUser: string,
        }) => {
            try {
                const verifiedToken = verifyToken(token);
                if (verifiedToken === null) return false;

                const foundFromUser = await User.findById(verifiedToken.userId);
                if (foundFromUser === null) return false;

                const foundToUser = await User.findById(toUser);
                if (foundToUser === null) return false;

                foundFromUser.following.push(foundToUser._id);
                await foundFromUser.save();

                foundToUser.followers.push(foundFromUser._id);
                await foundToUser.save();

                pubSub.publish(`${foundToUser._id}-notifications`, {
                    message: `${foundFromUser.nickname} started following you`,
                });

                return true;
            } catch (error) {
                return false;
            }
        },
        unfollow: async (_: any, {
            token, fromUser
        }: {
            token: string,
            fromUser: string,
        }) => {
            const verifiedToken = verifyToken(token);
            if (verifiedToken === null) return false;

            const foundUser = await User.findById(verifiedToken.userId);
            if (foundUser === null) return false;

            const foundFromUser = await User.findById(fromUser);
            if (foundFromUser === null) return false;

            await User.updateOne(
                { _id: fromUser },
                { $pull: { followers: { _id: foundUser._id } } }
            );

            return true;

        },
        comment: async (_: any, {
            token, postId, text,
        }: {
            token: string,
            postId: string,
            text: string,
        }) => {
            try {
                const verifiedToken = verifyToken(token);
                if (verifiedToken === null) return false;

                const foundUser = await User.findById(verifiedToken.userId);
                if (foundUser === null) return false;

                const foundPost = await Post.findById(postId);
                if (foundPost === null) return false;

                foundPost.comments.push({
                    writtenBy: foundUser._id,
                    content: text,
                    likes: [],
                    replies: [],
                });
                await foundPost.save();

                pubSub.publish(`${foundPost.owner}-notifications`, {
                    message: `${foundUser.nickname} commented on your post`,
                });

                return true;
            } catch (error) {
                return false;
            }
        },

        like: async(_: any, {
            token, postId,
        }: {
            token: string,
            postId: string,
        }) => {
            try {
                const verifiedToken = verifyToken(token);
                if (verifiedToken === null) return false;

                const foundUser = await User.findById(verifiedToken.userId);
                if (foundUser === null) return false;

                const foundPost = await Post.findById(postId);
                if (foundPost === null) return false;

                foundPost.likes.push({
                    likedBy: foundUser._id,
                });
                await foundPost.save();

                pubSub.publish(`${foundPost.owner}-notifications`, {
                    message: `${foundUser.nickname} liked your post`,
                });

                return true;
            } catch (error) {
                return false;
            }
        },

    },

    Subscription: {
        newNotification: async (_: any, { userId }: { userId: string }) => {
            return pubSub.asyncIterableIterator(`${userId}-notifications`);
        },
    },
};

export default userResolver;
