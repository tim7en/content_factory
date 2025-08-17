'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import TrendsDashboard from '@/components/TrendsDashboard';
import ContentCreator from '@/components/ContentCreator';
import Analytics from '@/components/Analytics';
import WorkflowDashboard from '@/components/WorkflowDashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState('trends');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'trends':
        return <TrendsDashboard />;
      case 'creator':
        return <ContentCreator />;
      case 'workflow':
        return <WorkflowDashboard />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return (
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">API Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">OpenAI API</span>
                        <span className="text-green-600">✓ Connected</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">HeyGen API</span>
                        <span className="text-green-600">✓ Connected</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">Suno AI API</span>
                        <span className="text-green-600">✓ Connected</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">Social Media APIs</span>
                        <span className="text-yellow-600">⚠ Partial</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Content Settings</h2>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span>Auto-publish to platforms</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span>Enable trend notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span>Save content drafts</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Automation</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content Generation Frequency
                        </label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option>Every 6 hours</option>
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Manual only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quality Threshold
                        </label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option>High (80%+)</option>
                          <option>Medium (60%+)</option>
                          <option>Low (40%+)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <TrendsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  );
}
