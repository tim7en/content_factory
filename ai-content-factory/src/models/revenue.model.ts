import { Schema, model } from 'mongoose';

const revenueSchema = new Schema({
    source: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
});

const Revenue = model('Revenue', revenueSchema);

export default Revenue;