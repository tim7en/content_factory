import { Schema, model } from 'mongoose';

export interface RevenueModel {
    source: string;
    amount: number;
    type: string;
    date: Date;
    userId?: string;
    description?: string;
}

const revenueSchema = new Schema({
    source: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        default: '',
    },
});

const Revenue = model('Revenue', revenueSchema);

export default Revenue;