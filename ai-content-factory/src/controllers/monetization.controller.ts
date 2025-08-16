import { Request, Response } from 'express';
import { PatreonManager } from '../services/monetization/patreon-manager';
import { MerchGenerator } from '../services/monetization/merch-generator';
import { RevenueTracker } from '../services/monetization/revenue-tracker';

export class MonetizationController {
    private patreonManager: PatreonManager;
    private merchGenerator: MerchGenerator;
    private revenueTracker: RevenueTracker;

    constructor() {
        this.patreonManager = new PatreonManager();
        this.merchGenerator = new MerchGenerator();
        this.revenueTracker = new RevenueTracker();
    }

    public async getPatreonData(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.patreonManager.getPatreonData();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving Patreon data', error });
        }
    }

    public async createMerch(req: Request, res: Response): Promise<void> {
        try {
            const { design } = req.body;
            const merch = await this.merchGenerator.createMerch(design);
            res.status(201).json(merch);
        } catch (error) {
            res.status(500).json({ message: 'Error creating merchandise', error });
        }
    }

    public async trackRevenue(req: Request, res: Response): Promise<void> {
        try {
            const revenueData = await this.revenueTracker.trackRevenue();
            res.status(200).json(revenueData);
        } catch (error) {
            res.status(500).json({ message: 'Error tracking revenue', error });
        }
    }
}