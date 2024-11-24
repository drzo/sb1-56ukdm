import React, { useState, useEffect } from 'react';
import { Brain, GitBranch, Target, BookOpen } from 'lucide-react';
import { useStore } from '../store';
import { Skill, LearningPath } from '../types';
import { getSkills, addSkill, updateSkill, initializeDefaultSkills } from '../utils/db';
import { sendMessage } from '../api/openai';
import { analyzeSkill, generatePracticeExercise, evaluatePractice } from '../api/skills';

export default function SkillsView() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practiceResult, setPracticeResult] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const { openaiToken, setShowOpenAITokenModal } = useStore();

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    try {
      setIsLoading(true);
      setError(null);
      const loadedSkills = await getSkills();
      setSkills(loadedSkills);
    } catch (error) {
      console.error('Failed to load skills:', error);
      setError(error instanceof Error ? error.message : 'Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePractice(skill: Skill) {
    if (!openaiToken) {
      setShowOpenAITokenModal(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const exercise = await generatePracticeExercise(skill);
      setSelectedSkill(skill);
      setFeedback(exercise);
      setPracticeResult('');
    } catch (error) {
      console.error('Failed to generate practice exercise:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate practice exercise');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitPractice() {
    if (!selectedSkill || !practiceResult || !openaiToken) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const evaluation = await evaluatePractice(selectedSkill, practiceResult);
      
      const updatedSkill = {
        ...selectedSkill,
        experience: selectedSkill.experience + evaluation.experienceGained
      };

      if (evaluation.levelUp || updatedSkill.experience >= updatedSkill.experienceRequired) {
        updatedSkill.level += 1;
        updatedSkill.experience = 0;
        updatedSkill.experienceRequired = Math.floor(updatedSkill.experienceRequired * 1.5);
      }

      await updateSkill(selectedSkill.id, updatedSkill);
      setSelectedSkill(updatedSkill);
      setFeedback(evaluation.feedback);
      await loadSkills();
    } catch (error) {
      console.error('Failed to evaluate practice:', error);
      setError(error instanceof Error ? error.message : 'Failed to evaluate practice');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Skills Library</h2>
              <button
                onClick={() => initializeDefaultSkills().then(loadSk <boltAction type="file" filePath="src/components/SkillsView.tsx">ills)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Initialize Default Skills
              </button>
            </div>

            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{skill.command}</h3>
                      <p className="text-sm text-gray-600">{skill.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      skill.status === 'mastered'
                        ? 'bg-green-100 text-green-800'
                        : skill.status === 'practicing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {skill.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Level {skill.level}</span>
                      <span>{skill.experience}/{skill.experienceRequired} XP</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(skill.experience / skill.experienceRequired) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handlePractice(skill)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
                    >
                      <Target className="w-4 h-4 mr-1" />
                      Practice
                    </button>
                    <button
                      onClick={() => setSelectedSkill(skill)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center"
                    >
                      <GitBranch className="w-4 h-4 mr-1" />
                      Learning Paths
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {selectedSkill ? (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-semibold">{selectedSkill.command}</h3>
                  <button
                    onClick={() => setSelectedSkill(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                {feedback ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium mb-2">Practice Exercise</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{feedback}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Your Solution
                      </label>
                      <textarea
                        value={practiceResult}
                        onChange={(e) => setPracticeResult(e.target.value)}
                        className="w-full h-32 px-3 py-2 border rounded-md"
                        placeholder="Enter your solution..."
                      />
                    </div>

                    <button
                      onClick={handleSubmitPractice}
                      disabled={!practiceResult.trim() || isLoading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Evaluating...' : 'Submit Solution'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-medium">Learning Paths</h4>
                    {selectedSkill.learningPaths.map((path) => (
                      <div key={path.id} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium">{path.name}</h5>
                            <p className="text-sm text-gray-600">{path.description}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            path.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : path.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {path.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="space-y-2 mt-4">
                          {path.steps.map((step) => (
                            <div
                              key={step.id}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={step.completed}
                                onChange={() => {
                                  // Update step completion logic
                                }}
                                className="rounded text-blue-600"
                              />
                              <span className={step.completed ? 'line-through text-gray-400' : ''}>
                                {step.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a skill to view details and learning paths</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}