import { Request, Response } from 'express';
import { PatreonManager } from '../services/monetization/patreon-manager';
import { MerchGenerator } from '../services/monetization/merch-generator';
import { RevenueTracker } from '../services/monetization/revenue-tracker';
import { Avatar } from '../models/content.model';

export class MonetizationController {
    private patreonManager: PatreonManager;
    private revenueTracker: RevenueTracker;

    constructor() {
        this.patreonManager = new PatreonManager();
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
            const { avatar } = req.body;
            // Create a default avatar if none provided
            const defaultAvatar: Avatar = {
                id: '1',
                name: 'Default Avatar',
                description: 'A default avatar for merchandise',
                properties: {
                    gender: 'neutral',
                    age: 'adult',
                    style: 'modern'
                }
            };
            
            const merchGenerator = new MerchGenerator(avatar || defaultAvatar);
            const merch = await merchGenerator.createMerchandise();
            res.status(201).json({ design: merch });
        } catch (error) {
            res.status(500).json({ message: 'Error creating merchandise', error });
        }
    }

    public async trackRevenue(req: Request, res: Response): Promise<void> {
        try {
            const revenue = this.revenueTracker.getTotalRevenue();
            const report = this.revenueTracker.getRevenueReport();
            res.status(200).json({ totalRevenue: revenue, report });
        } catch (error) {
            res.status(500).json({ message: 'Error tracking revenue', error });
        }
    }

    public async getRevenue(req: Request, res: Response): Promise<void> {
        try {
            const revenue = this.revenueTracker.getTotalRevenue();
            const report = this.revenueTracker.getRevenueReport();
            res.status(200).json({ 
                totalRevenue: revenue, 
                breakdown: report,
                timestamp: new Date()
            });
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving revenue data', error });
        }
    }

    public async setupMonetization(req: Request, res: Response): Promise<void> {
        try {
            const { platforms, settings } = req.body;
            // Setup monetization for various platforms
            const setupResult = {
                patreon: await this.patreonManager.getPatreonData(),
                revenue: this.revenueTracker.getTotalRevenue(),
                platforms: platforms || ['patreon', 'merch'],
                settings: settings || {},
                status: 'configured'
            };
            
            res.status(200).json(setupResult);
        } catch (error) {
            res.status(500).json({ message: 'Error setting up monetization', error });
        }
    }
}