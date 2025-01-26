import {
    Schema, model, Types,
} from "mongoose";

interface IUser {
    fullName: string;
    nickname: string;
    email?: string | undefined;
    passwordHash: string;
    posts: Types.ObjectId[];
    avatar?: string | undefined;
    description?: string | undefined;
    website?: string | undefined;
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
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    website: {
        type: String,
        required: false,
    }
});

const User = model("user", userSchema);

export {
    User,
    IUser,
};
