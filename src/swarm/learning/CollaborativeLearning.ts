import { SwarmAgent } from '../SwarmAgent';
import { TaskWithStatus } from '../types';
import { Logger } from '../../cogutil/Logger';
import { SwarmLearningModel } from './SwarmLearningModel';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ExperienceReplay } from './ExperienceReplay';

interface CollaborativeLearningConfig {
  learningRate: number;
  collaborationThreshold: number;
  experienceBufferSize: number;
  knowledgeSharingInterval: number;
}

export class CollaborativeLearning {
  private learningModel: SwarmLearningModel;
  private knowledgeGraph: KnowledgeGraph;
  private experienceReplay: ExperienceReplay;
  private config: CollaborativeLearningConfig;
  private sharingInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CollaborativeLearningConfig> = {}) {
    this.config = {
      learningRate: 0.01,
      collaborationThreshold: 0.7,
      experienceBufferSize: 1000,
      knowledgeSharingInterval: 5000,
      ...config
    };

    this.learningModel = new SwarmLearningModel();
    this.knowledgeGraph = new KnowledgeGraph();
    this.experienceReplay = new ExperienceReplay(this.config.experienceBufferSize);
    this.startKnowledgeSharing();
  }

  private startKnowledgeSharing(): void {
    if (this.sharingInterval) {
      clearInterval(this.sharingInterval);
    }

    this.sharingInterval = setInterval(
      () => this.shareKnowledge(),
      this.config.knowledgeSharingInterval
    );
  }

  async trainCollaboratively(
    agents: SwarmAgent[],
    tasks: TaskWithStatus[]
  ): Promise<void> {
    try {
      // Update knowledge graph with new experiences
      await this.updateKnowledgeGraph(agents, tasks);

      // Store experiences for replay
      this.storeExperiences(agents, tasks);

      // Train learning model with experience replay
      await this.trainWithExperienceReplay();

      // Share knowledge among agents
      await this.shareKnowledge(agents);

      Logger.info('Collaborative learning completed');
    } catch (error) {
      Logger.error('Collaborative learning failed:', error);
      throw error;
    }
  }

  private async updateKnowledgeGraph(
    agents: SwarmAgent[],
    tasks: TaskWithStatus[]
  ): Promise<void> {
    try {
      // Add agent nodes with enhanced metadata
      agents.forEach(agent => {
        this.knowledgeGraph.addAgentNode(agent, {
          learningProgress: agent.getState().performance.learningProgress,
          specializations: this.identifySpecializations(agent)
        });
      });

      // Add task nodes with detailed metadata
      tasks.forEach(task => {
        this.knowledgeGraph.addTaskNode(task, {
          complexity: task.complexity,
          success: task.status === 'completed',
          duration: task.expectedDuration,
          energy: task.energyCost
        });
      });

      // Update relationships with weighted edges
      this.updateRelationships(agents, tasks);

      Logger.debug('Knowledge graph updated');
    } catch (error) {
      Logger.error('Failed to update knowledge graph:', error);
      throw error;
    }
  }

  private identifySpecializations(agent: SwarmAgent): string[] {
    const specializations: string[] = [];
    const state = agent.getState();
    const capabilities = agent.getCapabilities();

    // Analyze performance patterns
    if (state.performance.successRate > 0.8) {
      specializations.push('high_performer');
    }
    if (state.performance.collaborationScore > 0.8) {
      specializations.push('team_player');
    }
    if (state.performance.learningProgress > 0.7) {
      specializations.push('fast_learner');
    }

    // Analyze capabilities
    capabilities.forEach(cap => {
      if (cap.autonomyLevel > 0.8) {
        specializations.push('autonomous');
      }
      if (cap.successRate > 0.8) {
        specializations.push(cap.name + '_expert');
      }
    });

    return specializations;
  }

  private updateRelationships(
    agents: SwarmAgent[],
    tasks: TaskWithStatus[]
  ): void {
    // Update task relationships
    tasks.forEach(task => {
      const assignedAgents = task.assignedAgents.map(id =>
        agents.find(a => a.getId() === id)
      ).filter((a): a is SwarmAgent => a !== undefined);

      // Create weighted relationships based on contribution
      assignedAgents.forEach(agent => {
        const contribution = this.calculateContribution(agent, task);
        this.knowledgeGraph.addRelationship(
          agent.getId(),
          task.id,
          contribution
        );
      });

      // Update agent-agent relationships
      this.updateAgentCollaborations(assignedAgents, task);
    });
  }

  private calculateContribution(
    agent: SwarmAgent,
    task: TaskWithStatus
  ): number {
    const state = agent.getState();
    const capabilities = agent.getCapabilities();

    // Calculate base contribution
    let contribution = state.performance.successRate;

    // Adjust for task-specific factors
    const relevantCapability = capabilities.find(cap =>
      task.requirements.includes(cap.name)
    );
    if (relevantCapability) {
      contribution *= (1 + relevantCapability.successRate) / 2;
    }

    // Adjust for energy efficiency
    const energyEfficiency = state.energy / task.energyCost;
    contribution *= (1 + Math.min(1, energyEfficiency)) / 2;

    return Math.min(1, contribution);
  }

  private updateAgentCollaborations(
    agents: SwarmAgent[],
    task: TaskWithStatus
  ): void {
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const score = this.calculateCollaborationScore(
          agents[i],
          agents[j],
          task
        );

        if (score >= this.config.collaborationThreshold) {
          this.knowledgeGraph.addAgentCollaboration(
            agents[i].getId(),
            agents[j].getId(),
            score
          );
        }
      }
    }
  }

  private calculateCollaborationScore(
    agent1: SwarmAgent,
    agent2: SwarmAgent,
    task: TaskWithStatus
  ): number {
    const state1 = agent1.getState();
    const state2 = agent2.getState();

    // Base collaboration score
    const baseScore = (
      state1.performance.collaborationScore +
      state2.performance.collaborationScore
    ) / 2;

    // Capability complementarity
    const complementarity = this.calculateComplementarity(
      agent1.getCapabilities(),
      agent2.getCapabilities()
    );

    // Task success contribution
    const taskSuccess = task.status === 'completed' ? 1 : 0;

    return (baseScore + complementarity + taskSuccess) / 3;
  }

  private calculateComplementarity(
    capabilities1: any[],
    capabilities2: any[]
  ): number {
    const allCapabilities = new Set([
      ...capabilities1.map(c => c.name),
      ...capabilities2.map(c => c.name)
    ]);

    let complementaryScore = 0;
    allCapabilities.forEach(capName => {
      const cap1 = capabilities1.find(c => c.name === capName);
      const cap2 = capabilities2.find(c => c.name === capName);

      if (cap1 && cap2) {
        // Different strength levels are complementary
        complementaryScore += Math.abs(cap1.successRate - cap2.successRate);
      } else {
        // Unique capabilities are highly complementary
        complementaryScore += 1;
      }
    });

    return complementaryScore / allCapabilities.size;
  }

  private storeExperiences(
    agents: SwarmAgent[],
    tasks: TaskWithStatus[]
  ): void {
    agents.forEach(agent => {
      const agentTasks = tasks.filter(t =>
        t.assignedAgents.includes(agent.getId())
      );

      agentTasks.forEach(task => {
        this.experienceReplay.addExperience({
          state: this.getAgentState(agent),
          action: task.id,
          reward: this.calculateReward(task),
          nextState: this.getAgentState(agent),
          done: task.status !== 'pending'
        });
      });
    });
  }

  private getAgentState(agent: SwarmAgent): Float32Array {
    const state = agent.getState();
    const features = [
      state.energy / 100,
      state.performance.successRate,
      state.performance.taskCompletion,
      state.performance.collaborationScore,
      state.performance.learningProgress,
      ...agent.getCapabilities().map(c => c.successRate)
    ];
    return new Float32Array(features);
  }

  private calculateReward(task: TaskWithStatus): number {
    let reward = task.status === 'completed' ? 1 : -0.1;
    reward *= task.priority;
    return reward;
  }

  private async trainWithExperienceReplay(): Promise<void> {
    const experiences = this.experienceReplay.sampleBatch(32);
    if (experiences.length === 0) return;

    const states = experiences.map(e => Array.from(e.state));
    const nextStates = experiences.map(e => Array.from(e.nextState));

    await this.learningModel.train(
      states.map(s => ({ getState: () => ({ state: s }) }) as any),
      nextStates.map(s => ({ status: 'completed' }) as any)
    );
  }

  private async shareKnowledge(agents?: SwarmAgent[]): Promise<void> {
    try {
      const recommendations = this.knowledgeGraph.getRecommendations();
      
      if (agents) {
        for (const agent of agents) {
          const agentRecommendations = recommendations.filter(r =>
            r.agentId === agent.getId()
          );

          if (agentRecommendations.length > 0) {
            await this.updateAgentKnowledge(
              agent,
              agentRecommendations
            );
          }
        }
      }

      Logger.debug('Knowledge shared among agents');
    } catch (error) {
      Logger.error('Failed to share knowledge:', error);
    }
  }

  private async updateAgentKnowledge(
    agent: SwarmAgent,
    recommendations: any[]
  ): Promise<void> {
    try {
      const prediction = await this.learningModel.predict(agent);
      const state = agent.getState();

      // Update learning rate based on recommendations
      const learningProgress = recommendations.reduce(
        (acc, rec) => acc + rec.confidence,
        0
      ) / recommendations.length;

      state.performance.learningProgress = Math.min(
        1,
        state.performance.learningProgress + 
        (learningProgress * this.config.learningRate)
      );

      // Update capabilities based on successful experiences
      const capabilities = agent.getCapabilities();
      capabilities.forEach(cap => {
        const relevantRecommendations = recommendations.filter(r =>
          r.requirements.includes(cap.name)
        );

        if (relevantRecommendations.length > 0) {
          cap.successRate = Math.min(
            1,
            cap.successRate + 
            (this.config.learningRate * relevantRecommendations.length)
          );
        }
      });

      Logger.debug(`Updated knowledge for agent ${agent.getId()}`);
    } catch (error) {
      Logger.error('Failed to update agent knowledge:', error);
      throw error;
    }
  }

  dispose(): void {
    if (this.sharingInterval) {
      clearInterval(this.sharingInterval);
    }
    this.learningModel.dispose();
    this.knowledgeGraph.clear();
    this.experienceReplay.clear();
  }
}