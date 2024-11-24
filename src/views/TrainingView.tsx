import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrainingModule, TrainingScenario, TrainingResult } from '../training/TrainingModule'
import { MitochondrialProfile, CharacterProfile } from '../training/MitochondrialProfile'
import { Logger } from '@/cogutil/Logger'
import { ProfileSelector } from '@/components/bio/training/ProfileSelector'
import { ProfileCard } from '@/components/bio/training/ProfileCard'
import { ScenarioList } from '@/components/bio/training/ScenarioList'
import { ResultsList } from '@/components/bio/training/ResultsList'
import { ActiveScenario } from '@/components/bio/training/ActiveScenario'
import { TrainingStats } from '@/components/bio/training/TrainingStats'

export function TrainingView() {
  const [trainingModule] = useState(() => new TrainingModule());
  const [profile, setProfile] = useState<MitochondrialProfile>();
  const [scenarios, setScenarios] = useState<TrainingScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<TrainingScenario | null>(null);
  const [results, setResults] = useState<TrainingResult[]>([]);
  const [characterData, setCharacterData] = useState<CharacterProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setScenarios(trainingModule.getScenarios());
  }, []);

  const handleProfileSelect = (selectedProfile: CharacterProfile) => {
    const newProfile = new MitochondrialProfile(selectedProfile.name);
    setProfile(newProfile);
    setCharacterData(selectedProfile);
  };

  const startScenario = async (scenarioId: string) => {
    if (!profile) {
      setError('Please select a profile first');
      return;
    }

    try {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (!scenario) {
        throw new Error(`Scenario ${scenarioId} not found`);
      }

      setActiveScenario(scenario);
      const result = await trainingModule.startTraining(scenarioId, profile);
      setResults(prev => [...prev, result]);
      setCharacterData(profile.getProfile());
      Logger.info(`Completed scenario: ${scenario.name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Logger.error('Failed to start scenario:', { error: errorMessage, scenarioId });
      setActiveScenario(null);
      setError(errorMessage);
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Mitochondrial Training Centre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ProfileSelector 
              onProfileSelect={handleProfileSelect}
              selectedProfile={characterData}
            />
            {characterData && <ProfileCard profile={characterData} />}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ScenarioList
              scenarios={scenarios}
              activeScenario={activeScenario}
              onStartScenario={startScenario}
              error={error}
            />
            <ResultsList results={results} />
          </div>

          {activeScenario && <ActiveScenario scenario={activeScenario} />}

          <TrainingStats
            stats={{
              totalSessions: results.length,
              averageScore: results.reduce((acc, r) => acc + r.score, 0) / Math.max(1, results.length),
              achievements: results.flatMap(r => r.achievements),
              topScenarios: scenarios
                .map(s => ({
                  id: s.id,
                  score: results
                    .filter(r => r.scenarioId === s.id)
                    .reduce((acc, r) => Math.max(acc, r.score), 0)
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}