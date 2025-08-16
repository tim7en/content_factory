import { RevenueModel } from '../../models/revenue.model';

class RevenueTracker {
    private revenueStreams: RevenueModel[];

    constructor() {
        this.revenueStreams = [];
    }

    addRevenueStream(stream: RevenueModel): void {
        this.revenueStreams.push(stream);
    }

    getTotalRevenue(): number {
        return this.revenueStreams.reduce((total, stream) => total + stream.amount, 0);
    }

    getRevenueByType(type: string): number {
        return this.revenueStreams
            .filter(stream => stream.type === type)
            .reduce((total, stream) => total + stream.amount, 0);
    }

    getRevenueReport(): RevenueModel[] {
        return this.revenueStreams;
    }
}

export default RevenueTracker;