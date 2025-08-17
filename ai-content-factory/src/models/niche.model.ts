import { Schema, model, Document, Model, Query } from 'mongoose';

export interface INiche extends Document {
    name: string;
    category: string;
    keywords: string[];
    trendScore: number;
    keywordPopularity: number;
    competitionLevel: number;
    engagementMetrics: {
        averageLikes: number;
        averageShares: number;
        averageComments: number;
        averageViews: number;
    };
    platforms: {
        platform: string;
        volume: number;
        growth: number;
        sentiment: number;
    }[];
    marketInsights: {
        topCategories: string[];
        emergingNiches: string[];
        declining: string[];
        seasonality: {
            month: number;
            score: number;
        }[];
    };
    contentOpportunities: {
        suggestedFormats: string[];
        targetAudience: string[];
        contentPillars: string[];
        hashtagSuggestions: string[];
    };
    monetizationPotential: {
        adRevenue: number;
        sponsorshipValue: number;
        merchandiseOpportunity: number;
        subscriptionPotential: number;
        overallScore: number;
    };
    createdAt: Date;
    updatedAt: Date;
    lastAnalyzed: Date;
}

interface INicheModel extends Model<INiche> {
    findByCategory(category: string): Query<INiche[], INiche>;
    findTrending(limit?: number): Query<INiche[], INiche>;
    findByMonetizationPotential(minScore?: number): Query<INiche[], INiche>;
    findStale(hours?: number): Query<INiche[], INiche>;
}

export interface NicheData {
    name: string;
    category: string;
    trendScore: number;
    keywordPopularity: number;
    competitionLevel: number;
    engagementMetrics: number;
    platforms?: any[];
    marketInsights?: any;
}

const nicheSchema = new Schema<INiche>({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'gaming',
            'music',
            'fitness',
            'tech',
            'food',
            'travel',
            'lifestyle',
            'education',
            'entertainment',
            'business',
            'fashion',
            'beauty',
            'sports',
            'art',
            'science',
            'politics',
            'health',
            'finance',
            'automotive',
            'pets',
            'parenting',
            'diy',
            'comedy',
            'news',
            'other'
        ]
    },
    keywords: [{
        type: String,
        required: true
    }],
    trendScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    keywordPopularity: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    competitionLevel: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    engagementMetrics: {
        averageLikes: {
            type: Number,
            default: 0
        },
        averageShares: {
            type: Number,
            default: 0
        },
        averageComments: {
            type: Number,
            default: 0
        },
        averageViews: {
            type: Number,
            default: 0
        }
    },
    platforms: [{
        platform: {
            type: String,
            required: true
        },
        volume: {
            type: Number,
            required: true
        },
        growth: {
            type: Number,
            default: 0
        },
        sentiment: {
            type: Number,
            min: -1,
            max: 1,
            default: 0
        }
    }],
    marketInsights: {
        topCategories: [{
            type: String
        }],
        emergingNiches: [{
            type: String
        }],
        declining: [{
            type: String
        }],
        seasonality: [{
            month: {
                type: Number,
                min: 1,
                max: 12
            },
            score: {
                type: Number,
                min: 0,
                max: 100
            }
        }]
    },
    contentOpportunities: {
        suggestedFormats: [{
            type: String,
            enum: [
                'short-form-video',
                'long-form-video',
                'music-video',
                'tutorial',
                'review',
                'commentary',
                'live-stream',
                'podcast',
                'blog-post',
                'infographic',
                'carousel',
                'story',
                'reel',
                'shorts'
            ]
        }],
        targetAudience: [{
            type: String
        }],
        contentPillars: [{
            type: String
        }],
        hashtagSuggestions: [{
            type: String
        }]
    },
    monetizationPotential: {
        adRevenue: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        sponsorshipValue: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        merchandiseOpportunity: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        subscriptionPotential: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        overallScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastAnalyzed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for performance
nicheSchema.index({ category: 1, trendScore: -1 });
nicheSchema.index({ 'monetizationPotential.overallScore': -1 });
nicheSchema.index({ lastAnalyzed: 1 });
nicheSchema.index({ 'platforms.platform': 1, 'platforms.volume': -1 });

// Pre-save middleware to update overall monetization score
nicheSchema.pre('save', function(next) {
    if (this.monetizationPotential) {
        const { adRevenue, sponsorshipValue, merchandiseOpportunity, subscriptionPotential } = this.monetizationPotential;
        this.monetizationPotential.overallScore = Math.round(
            (adRevenue + sponsorshipValue + merchandiseOpportunity + subscriptionPotential) / 4
        );
    }
    next();
});

// Static methods
nicheSchema.statics.findByCategory = function(category: string) {
    return this.find({ category }).sort({ trendScore: -1 });
};

nicheSchema.statics.findTrending = function(limit: number = 10) {
    return this.find().sort({ trendScore: -1 }).limit(limit);
};

nicheSchema.statics.findByMonetizationPotential = function(minScore: number = 70) {
    return this.find({ 'monetizationPotential.overallScore': { $gte: minScore } })
               .sort({ 'monetizationPotential.overallScore': -1 });
};

nicheSchema.statics.findStale = function(hours: number = 24) {
    const staleDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.find({ lastAnalyzed: { $lt: staleDate } });
};

const Niche = model<INiche, INicheModel>('Niche', nicheSchema);

export default Niche;
