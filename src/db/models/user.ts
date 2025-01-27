import {
    Schema, model, Types,
} from "mongoose";

import { mediaSchema, IMedia }from "./media";

interface IUser {
    fullName: string;
    nickname: string;
    email?: string | undefined;
    passwordHash: string;
    posts: Types.ObjectId[];
    avatar?: IMedia | undefined;
    description?: string | undefined;
    website?: string | undefined;
    followers: Types.ObjectId[];
    following: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
    fullName: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: false,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: "post",
        },
    ],
    avatar: {
        type: mediaSchema,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    website: {
        type: String,
        required: false,
    },
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
    ],
    following: [
        {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
    ],
});

const User = model("user", userSchema);

export {
    User,
    IUser,
};
