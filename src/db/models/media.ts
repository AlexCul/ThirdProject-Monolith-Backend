import { Schema } from 'mongoose';

interface IMedia {
    base64: string;
}

const mediaSchema = new Schema<IMedia>({
    base64: {
        type: String,
        required: true,
    },
});

export {
    mediaSchema, IMedia,
};
