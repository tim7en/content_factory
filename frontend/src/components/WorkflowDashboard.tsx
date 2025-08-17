'use client';

import { useState, useEffect } from 'react';
import { Play, Plus, List, BarChart3 } from 'lucide-react';
import InteractiveWorkflowChart from './InteractiveWorkflowChart';

interface WorkflowConfig {
  platforms: string[];
  contentTypes: string[];
  contentPerDay: number;
  nicheSelection: 'trending' | 'emerging' | 'stable' | 'custom';
  customNiches?: string[];
}

interface ActiveWorkflow {
  workflowId: string;
  status: string;
  startTime: string;
  overallProgress: number;
}

export default function WorkflowDashboard() {
  const [activeWorkflows, setActiveWorkflows] = useState<ActiveWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowConfig, setNewWorkflowConfig] = useState<WorkflowConfig>({
    platforms: [],
    contentTypes: ['music-video'],
    contentPerDay: 1,
    nicheSelection: 'trending'
  });

  const platforms = ['TikTok', 'YouTube', 'Instagram', 'Twitter', 'Spotify'];
  const contentTypes = ['music-video', 'audio-only', 'lyrics-post', 'promotional'];

  useEffect(() => {
    fetchActiveWorkflows();
    const interval = setInterval(fetchActiveWorkflows, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveWorkflows = async () => {
    try {
      const response = await fetch('/api/workflow/all');
      if (response.ok) {
        const data = await response.json();
        setActiveWorkflows(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const createWorkflow = async () => {
    try {
      const response = await fetch('/api/workflow/interactive/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkflowConfig)
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedWorkflow(data.data.workflowId);
        setShowCreateModal(false);
        fetchActiveWorkflows();
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setNewWorkflowConfig(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleWorkflowControl = (action: string, stepIndex?: number) => {
    console.log(`Workflow control: ${action}`, stepIndex);
    // This would trigger a refresh of the workflow data
    fetchActiveWorkflows();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Monitor and control your AI content creation workflows
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Workflows Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <List className="h-5 w-5 mr-2" />
                Active Workflows
              </h2>
              
              {activeWorkflows.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No active workflows</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Create your first workflow
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeWorkflows.map((workflow) => (
                    <div
                      key={workflow.workflowId}
                      onClick={() => setSelectedWorkflow(workflow.workflowId)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedWorkflow === workflow.workflowId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {workflow.workflowId.split('_')[0]}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          workflow.status === 'running' 
                            ? 'bg-green-100 text-green-800'
                            : workflow.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {workflow.status}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-2">
                        Started: {new Date(workflow.startTime).toLocaleString()}
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${workflow.overallProgress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(workflow.overallProgress)}% complete
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Interactive Workflow Chart */}
          <div className="lg:col-span-2">
            {selectedWorkflow ? (
              <InteractiveWorkflowChart
                workflowId={selectedWorkflow}
                onWorkflowControl={handleWorkflowControl}
                className="h-full"
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Workflow Selected
                </h3>
                <p className="text-gray-500 mb-6">
                  Select an active workflow from the sidebar or create a new one to get started.
                </p>
                
                {/* Demo workflow chart */}
                <div className="text-left">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Demo Interactive Workflow:</h4>
                  <InteractiveWorkflowChart
                    onWorkflowControl={handleWorkflowControl}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Workflow Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Create New Workflow
              </h2>
              
              <div className="space-y-4">
                {/* Platforms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Platforms
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {platforms.map((platform) => (
                      <label key={platform} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newWorkflowConfig.platforms.includes(platform)}
                          onChange={() => handlePlatformToggle(platform)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Content per day */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content per Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newWorkflowConfig.contentPerDay}
                    onChange={(e) => setNewWorkflowConfig(prev => ({
                      ...prev,
                      contentPerDay: parseInt(e.target.value) || 1
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Niche selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niche Selection Strategy
                  </label>
                  <select
                    value={newWorkflowConfig.nicheSelection}
                    onChange={(e) => setNewWorkflowConfig(prev => ({
                      ...prev,
                      nicheSelection: e.target.value as any
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="trending">Trending Niches</option>
                    <option value="emerging">Emerging Niches</option>
                    <option value="stable">Stable Niches</option>
                    <option value="custom">Custom Niches</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createWorkflow}
                  disabled={newWorkflowConfig.platforms.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Workflow
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}