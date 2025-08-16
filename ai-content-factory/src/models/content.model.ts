import { Schema, model } from 'mongoose';

const contentSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['video', 'music', 'avatar', 'lyric'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    metadata: {
        views: {
            type: Number,
            default: 0,
        },
        likes: {
            type: Number,
            default: 0,
        },
        shares: {
            type: Number,
            default: 0,
        },
    },
});

const Content = model('Content', contentSchema);

export default Content;