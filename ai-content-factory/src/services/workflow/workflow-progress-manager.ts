import { WorkflowProgress, WorkflowStep, WorkflowControlRequest } from '../../types';
import { logger } from '../../utils/logger';

export class WorkflowProgressManager {
    private workflows: Map<string, WorkflowProgress> = new Map();
    private stepDefinitions: WorkflowStep[] = [
        {
            id: 'market-analysis',
            name: 'Market Analysis',
            description: 'Scanning trends and analyzing market opportunities',
            status: 'pending',
            progress: 0
        },
        {
            id: 'niche-selection',
            name: 'Niche Selection',
            description: 'Selecting optimal niches based on analysis',
            status: 'pending',
            progress: 0
        },
        {
            id: 'content-planning',
            name: 'Content Planning',
            description: 'Planning content themes and structure',
            status: 'pending',
            progress: 0
        },
        {
            id: 'lyric-generation',
            name: 'Lyric Generation',
            description: 'Generating AI-powered lyrics',
            status: 'pending',
            progress: 0
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
    ];

    public initializeWorkflow(workflowId: string): WorkflowProgress {
        const workflow: WorkflowProgress = {
            workflowId,
            currentStepIndex: 0,
            steps: [...this.stepDefinitions],
            overallProgress: 0,
            status: 'initializing',
            startTime: new Date(),
            canPause: true,
            canResume: false,
            allowStepNavigation: true
        };

        this.workflows.set(workflowId, workflow);
        logger.info(`Workflow ${workflowId} initialized with ${workflow.steps.length} steps`);
        return workflow;
    }

    public startWorkflow(workflowId: string): WorkflowProgress | null {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return null;

        workflow.status = 'running';
        workflow.steps[0].status = 'running';
        workflow.steps[0].startTime = new Date();
        
        this.workflows.set(workflowId, workflow);
        logger.info(`Workflow ${workflowId} started`);
        return workflow;
    }

    public updateStepProgress(workflowId: string, stepId: string, progress: number, data?: any): WorkflowProgress | null {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return null;

        const step = workflow.steps.find(s => s.id === stepId);
        if (!step) return null;

        step.progress = Math.max(0, Math.min(100, progress));
        if (data) step.data = data;

        // Update overall progress
        workflow.overallProgress = workflow.steps.reduce((sum, s) => sum + s.progress, 0) / workflow.steps.length;

        this.workflows.set(workflowId, workflow);
        return workflow;
    }

    public completeStep(workflowId: string, stepId: string, data?: any): WorkflowProgress | null {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return null;

        const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
        if (stepIndex === -1) return null;

        const step = workflow.steps[stepIndex];
        step.status = 'completed';
        step.progress = 100;
        step.endTime = new Date();
        if (data) step.data = data;

        // Move to next step if available
        if (stepIndex + 1 < workflow.steps.length) {
            workflow.currentStepIndex = stepIndex + 1;
            workflow.steps[stepIndex + 1].status = 'running';
            workflow.steps[stepIndex + 1].startTime = new Date();
        } else {
            // Workflow completed
            workflow.status = 'completed';
            workflow.endTime = new Date();
            workflow.canPause = false;
        }

        // Update overall progress
        workflow.overallProgress = workflow.steps.reduce((sum, s) => sum + s.progress, 0) / workflow.steps.length;

        this.workflows.set(workflowId, workflow);
        logger.info(`Step ${stepId} completed for workflow ${workflowId}`);
        return workflow;
    }

    public failStep(workflowId: string, stepId: string, error: string): WorkflowProgress | null {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return null;

        const step = workflow.steps.find(s => s.id === stepId);
        if (!step) return null;

        step.status = 'failed';
        step.error = error;
        step.endTime = new Date();

        workflow.status = 'failed';

        this.workflows.set(workflowId, workflow);
        logger.error(`Step ${stepId} failed for workflow ${workflowId}: ${error}`);
        return workflow;
    }

    public controlWorkflow(workflowId: string, request: WorkflowControlRequest): WorkflowProgress | null {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return null;

        switch (request.action) {
            case 'pause':
                if (workflow.canPause && workflow.status === 'running') {
                    workflow.status = 'paused';
                    workflow.canPause = false;
                    workflow.canResume = true;
                    const currentStep = workflow.steps[workflow.currentStepIndex];
                    if (currentStep && currentStep.status === 'running') {
                        currentStep.status = 'paused';
                    }
                }
                break;

            case 'resume':
                if (workflow.canResume && workflow.status === 'paused') {
                    workflow.status = 'running';
                    workflow.canPause = true;
                    workflow.canResume = false;
                    const currentStep = workflow.steps[workflow.currentStepIndex];
                    if (currentStep && currentStep.status === 'paused') {
                        currentStep.status = 'running';
                    }
                }
                break;

            case 'goto':
                if (workflow.allowStepNavigation && request.stepIndex !== undefined) {
                    const targetIndex = request.stepIndex;
                    if (targetIndex >= 0 && targetIndex < workflow.steps.length) {
                        // Pause current step
                        const currentStep = workflow.steps[workflow.currentStepIndex];
                        if (currentStep && currentStep.status === 'running') {
                            currentStep.status = 'paused';
                        }

                        // Set new current step
                        workflow.currentStepIndex = targetIndex;
                        const targetStep = workflow.steps[targetIndex];
                        targetStep.status = 'running';
                        targetStep.startTime = new Date();
                        
                        workflow.status = 'running';
                    }
                }
                break;

            case 'restart':
                // Reset all steps
                workflow.steps = [...this.stepDefinitions];
                workflow.currentStepIndex = 0;
                workflow.overallProgress = 0;
                workflow.status = 'running';
                workflow.startTime = new Date();
                workflow.endTime = undefined;
                workflow.canPause = true;
                workflow.canResume = false;
                workflow.steps[0].status = 'running';
                workflow.steps[0].startTime = new Date();
                break;
        }

        this.workflows.set(workflowId, workflow);
        logger.info(`Workflow ${workflowId} control action: ${request.action}`);
        return workflow;
    }

    public getWorkflowProgress(workflowId: string): WorkflowProgress | null {
        return this.workflows.get(workflowId) || null;
    }

    public getAllWorkflows(): WorkflowProgress[] {
        return Array.from(this.workflows.values());
    }

    public deleteWorkflow(workflowId: string): boolean {
        return this.workflows.delete(workflowId);
    }
}

export const workflowProgressManager = new WorkflowProgressManager();