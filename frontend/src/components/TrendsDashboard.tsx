'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Eye, Heart, Share2, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendData {
  platform: string;
  trends: {
    keyword: string;
    volume: number;
    growth: number;
    sentiment: number;
  }[];
}

interface MetricsData {
  views: number;
  likes: number;
  shares: number;
  revenue: number;
}

export default function TrendsDashboard() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockTrends: TrendData[] = [
      {
        platform: 'TikTok',
        trends: [
          { keyword: 'AI Music Generation', volume: 45000, growth: 23.5, sentiment: 0.8 },
          { keyword: 'Virtual Avatars', volume: 32000, growth: 18.2, sentiment: 0.7 },
          { keyword: 'Content Automation', volume: 28000, growth: 15.6, sentiment: 0.6 },
        ]
      },
      {
        platform: 'YouTube',
        trends: [
          { keyword: 'AI Content Creation', volume: 67000, growth: 31.4, sentiment: 0.9 },
          { keyword: 'Music Video Generation', volume: 43000, growth: 22.1, sentiment: 0.8 },
          { keyword: 'Automated Publishing', volume: 39000, growth: 19.3, sentiment: 0.7 },
        ]
      }
    ];

    const mockMetrics: MetricsData = {
      views: 1250000,
      likes: 89000,
      shares: 12000,
      revenue: 5600
    };

    setTimeout(() => {
      setTrendData(mockTrends);
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
  }, []);

  const chartData = [
    { name: 'Jan', views: 4000, engagement: 2400 },
    { name: 'Feb', views: 3000, engagement: 1398 },
    { name: 'Mar', views: 2000, engagement: 9800 },
    { name: 'Apr', views: 2780, engagement: 3908 },
    { name: 'May', views: 1890, engagement: 4800 },
    { name: 'Jun', views: 2390, engagement: 3800 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Content Factory - Trends Dashboard
          </h1>
          <p className="text-gray-600">
            Track trending topics, analyze performance, and optimize your content strategy
          </p>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.views.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Likes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.likes.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Shares</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.shares.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Share2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${metrics.revenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Views"
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Engagement"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trending Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {trendData.map((platform, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                {platform.platform} Trends
              </h2>
              <div className="space-y-4">
                {platform.trends.map((trend, trendIndex) => (
                  <div key={trendIndex} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{trend.keyword}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        trend.growth > 20 
                          ? 'bg-green-100 text-green-800' 
                          : trend.growth > 10 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        +{trend.growth}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Volume: {trend.volume.toLocaleString()}</span>
                      <span>Sentiment: {(trend.sentiment * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}