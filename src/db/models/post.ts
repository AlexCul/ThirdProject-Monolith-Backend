import {
    Schema, model, Types,
} from "mongoose";

import { IUser } from "./user";

import { mediaSchema, IMedia } from "./media";


interface IPost {
    owner: Types.ObjectId;
    title: string;
    media: IMedia[];
    description?: string;
    comments: IComment[];
    likes: ILike[];
    user: Types.ObjectId;
    tags: string[];
}

interface IComment {
    writtenBy: Types.ObjectId;
    content: string;
    likes: ILike[];
    replies: IReply[];
}

interface ILike {
    likedBy: Types.ObjectId;
}

interface IReply {
    writtenBy: Types.ObjectId;
    content: string;
    likes: ILike[];
}

const likeSchema = new Schema<ILike>({
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
});

const replySchema = new Schema<IReply>({
    writtenBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    likes: [likeSchema],
});

const commentSchema = new Schema<IComment>({
    writtenBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    likes: [likeSchema],
    replies: [replySchema],
});

const postSchema = new Schema<IPost>({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    media: [mediaSchema],
    description: {
        type: String,
        required: false,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    tags: [{
        type: String,
        required: false,
    }],
    comments: [commentSchema],
    likes: [likeSchema],
});

const Post = model("post", postSchema);

export {
    Post,
    postSchema,
    IPost,
};
