'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Circle,
  ChevronRight,
  Eye
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  startTime?: string;
  endTime?: string;
  error?: string;
  data?: any;
}

interface WorkflowProgress {
  workflowId: string;
  currentStepIndex: number;
  steps: WorkflowStep[];
  overallProgress: number;
  status: 'initializing' | 'running' | 'paused' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  canPause: boolean;
  canResume: boolean;
  allowStepNavigation: boolean;
}

interface InteractiveWorkflowChartProps {
  workflowId?: string;
  onWorkflowControl?: (action: string, stepIndex?: number) => void;
  className?: string;
}

export default function InteractiveWorkflowChart({ 
  workflowId, 
  onWorkflowControl,
  className = '' 
}: InteractiveWorkflowChartProps) {
  const [workflow, setWorkflow] = useState<WorkflowProgress | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration when no workflowId is provided
  const mockWorkflow: WorkflowProgress = {
    workflowId: 'demo_workflow',
    currentStepIndex: 3,
    overallProgress: 45,
    status: 'running',
    startTime: new Date().toISOString(),
    canPause: true,
    canResume: false,
    allowStepNavigation: true,
    steps: [
      {
        id: 'market-analysis',
        name: 'Market Analysis',
        description: 'Scanning trends and analyzing market opportunities',
        status: 'completed',
        progress: 100,
        data: { trendsFound: 15, nichesAnalyzed: 8 }
      },
      {
        id: 'niche-selection',
        name: 'Niche Selection',
        description: 'Selecting optimal niches based on analysis',
        status: 'completed',
        progress: 100,
        data: { selectedNiches: 3 }
      },
      {
        id: 'content-planning',
        name: 'Content Planning',
        description: 'Planning content themes and structure',
        status: 'completed',
        progress: 100,
        data: { contentPlans: 3 }
      },
      {
        id: 'lyric-generation',
        name: 'Lyric Generation',
        description: 'Generating AI-powered lyrics',
        status: 'running',
        progress: 65
      },
      {
        id: 'music-generation',
        name: 'Music Generation',
        description: 'Creating background music with AI',
        status: 'pending',
        progress: 0
      },
      {
        id: 'avatar-creation',
        name: 'Avatar Creation',
        description: 'Generating AI avatar with HeyGen',
        status: 'pending',
        progress: 0
      },
      {
        id: 'video-assembly',
        name: 'Video Assembly',
        description: 'Combining all elements into final video',
        status: 'pending',
        progress: 0
      },
      {
        id: 'publishing',
        name: 'Publishing',
        description: 'Publishing to selected platforms',
        status: 'pending',
        progress: 0
      },
      {
        id: 'analytics-tracking',
        name: 'Analytics Setup',
        description: 'Setting up performance tracking',
        status: 'pending',
        progress: 0
      }
    ]
  };

  useEffect(() => {
    if (workflowId) {
      fetchWorkflowProgress();
      // Set up polling for real-time updates
      const interval = setInterval(fetchWorkflowProgress, 2000);
      return () => clearInterval(interval);
    } else {
      // Use mock data for demonstration
      setWorkflow(mockWorkflow);
    }
  }, [workflowId]);

  const fetchWorkflowProgress = async () => {
    if (!workflowId) return;
    
    try {
      const response = await fetch(`/api/workflow/${workflowId}/progress`);
      if (response.ok) {
        const data = await response.json();
        setWorkflow(data.data);
      }
    } catch (error) {
      console.error('Error fetching workflow progress:', error);
    }
  };

  const handleControl = async (action: string, stepIndex?: number) => {
    if (!workflowId && onWorkflowControl) {
      onWorkflowControl(action, stepIndex);
      return;
    }

    if (!workflowId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/workflow/${workflowId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, stepIndex })
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflow(data.data);
        if (onWorkflowControl) {
          onWorkflowControl(action, stepIndex);
        }
      }
    } catch (error) {
      console.error('Error controlling workflow:', error);
    }
    setIsLoading(false);
  };

  const getStepIcon = (step: WorkflowStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'running':
        return <Clock className="h-6 w-6 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      case 'paused':
        return <Pause className="h-6 w-6 text-yellow-600" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStepColorClass = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'paused':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (!workflow) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-500">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Interactive Workflow</h2>
          <p className="text-sm text-gray-500">
            Progress: {Math.round(workflow.overallProgress)}% • Status: {workflow.status}
          </p>
        </div>
        
        {/* Control buttons */}
        <div className="flex space-x-2">
          {workflow.canPause && (
            <button
              onClick={() => handleControl('pause')}
              disabled={isLoading}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 disabled:opacity-50"
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </button>
          )}
          
          {workflow.canResume && (
            <button
              onClick={() => handleControl('resume')}
              disabled={isLoading}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50"
            >
              <Play className="h-4 w-4 mr-1" />
              Resume
            </button>
          )}
          
          <button
            onClick={() => handleControl('restart')}
            disabled={isLoading}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Restart
          </button>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Overall Progress</span>
          <span>{Math.round(workflow.overallProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${workflow.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Steps flowchart */}
      <div className="space-y-3">
        {workflow.steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connection line */}
            {index < workflow.steps.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300" />
            )}
            
            {/* Step card */}
            <div 
              className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getStepColorClass(step)} ${
                selectedStep === index ? 'ring-2 ring-blue-500' : ''
              } ${
                workflow.currentStepIndex === index ? 'ring-2 ring-blue-400' : ''
              }`}
              onClick={() => setSelectedStep(selectedStep === index ? null : index)}
            >
              <div className="flex items-center">
                {/* Step icon */}
                <div className="flex-shrink-0 mr-4">
                  {getStepIcon(step, index)}
                </div>
                
                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {step.name}
                    </h3>
                    
                    {/* Navigation controls */}
                    {workflow.allowStepNavigation && step.status !== 'running' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleControl('goto', index);
                        }}
                        disabled={isLoading}
                        className="flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 disabled:opacity-50"
                      >
                        <SkipForward className="h-3 w-3 mr-1" />
                        Go to
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                  
                  {/* Progress bar for individual step */}
                  {step.progress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {step.progress}%
                      </div>
                    </div>
                  )}
                  
                  {/* Error message */}
                  {step.error && (
                    <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                      Error: {step.error}
                    </div>
                  )}
                </div>
                
                <ChevronRight 
                  className={`h-4 w-4 text-gray-400 transform transition-transform ${
                    selectedStep === index ? 'rotate-90' : ''
                  }`} 
                />
              </div>
              
              {/* Expanded step details */}
              {selectedStep === index && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {step.startTime && (
                      <div>
                        <span className="font-medium text-gray-700">Started:</span>
                        <p className="text-gray-500">
                          {new Date(step.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                    
                    {step.endTime && (
                      <div>
                        <span className="font-medium text-gray-700">Completed:</span>
                        <p className="text-gray-500">
                          {new Date(step.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                    
                    {step.data && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">Data:</span>
                        <pre className="text-gray-500 bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                          {JSON.stringify(step.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Workflow timing */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Started: {new Date(workflow.startTime).toLocaleString()}</span>
          {workflow.endTime && (
            <span>Completed: {new Date(workflow.endTime).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}