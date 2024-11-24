import { useStore } from '../store';
import { Skill, LearningPath } from '../types';
import { addSkill, updateSkill, getSkills } from '../utils/db';
import { sendMessage } from './openai';

export async function analyzeSkill(skill: Partial<Skill>): Promise<string> {
  const response = await sendMessage(`[Skills] Analyze this skill:
    Command: ${skill.command}
    Description: ${skill.description}
    
    Please provide:
    1. Learning path suggestions
    2. Practice exercises
    3. Metrics for measuring progress
    4. Prerequisites if any`);
  
  return response;
}

export async function generatePracticeExercise(skill: Skill): Promise<string> {
  const response = await sendMessage(`[Practice] Generate a practice exercise for:
    Skill: ${skill.command}
    Current Level: ${skill.level}
    Status: ${skill.status}
    
    Please provide:
    1. Exercise description
    2. Success criteria
    3. Tips for improvement`);
  
  return response;
}

export async function evaluatePractice(skill: Skill, practiceResult: string): Promise<{
  feedback: string;
  experienceGained: number;
  levelUp: boolean;
}> {
  const response = await sendMessage(`[Evaluate] Evaluate practice results for ${skill.command}:
    Practice Result: ${practiceResult}
    Current Level: ${skill.level}
    Experience: ${skill.experience}/${skill.experienceRequired}
    
    Please provide:
    1. Detailed feedback
    2. Experience points gained (0-50)
    3. Whether this warrants a level up`);
  
  // Parse the assistant's response to extract the evaluation
  const experienceGained = Math.min(50, Math.max(0, parseInt(response.match(/Experience gained: (\d+)/)?.[1] || '10')));
  const levelUp = response.toLowerCase().includes('level up: yes');
  
  return {
    feedback: response,
    experienceGained,
    levelUp
  };
}

export async function suggestNextSkill(currentSkills: Skill[]): Promise<string> {
  const skillsList = currentSkills.map(s => 
    `${s.command} (Level ${s.level}, ${s.status})`
  ).join('\n');

  const response = await sendMessage(`[Learn] Based on my current skills:
    ${skillsList}
    
    Please suggest:
    1. Next skill to learn
    2. Why it would be beneficial
    3. How it builds on existing skills`);
  
  return response;
}