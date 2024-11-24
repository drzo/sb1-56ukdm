import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { TrainingModule, TrainingScenario, TrainingResult } from '../training/TrainingModule'
import { MitochondrialProfile, CharacterProfile } from '../training/MitochondrialProfile'
import { Logger } from '@/cogutil/Logger'

export function TrainingView() {
  const [trainingModule] = useState(() => new TrainingModule());
  const [profile, setProfile] = useState<MitochondrialProfile>();
  const [scenarios, setScenarios] = useState<TrainingScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<TrainingScenario | null>(null);
  const [results, setResults] = useState<TrainingResult[]>([]);
  const [characterData, setCharacterData] = useState<CharacterProfile | null>(null);

  useEffect(() => {
    initializeTraining();
  }, []);

  const initializeTraining = () => {
    try {
      const newProfile = new MitochondrialProfile();
      setProfile(newProfile);
      setCharacterData(newProfile.getProfile());
      setScenarios(trainingModule.getScenarios());
      Logger.info('Training view initialized');
    } catch (error) {
      Logger.error('Failed to initialize training:', error);
    }
  };

  const startScenario = async (scenarioId: string) => {
    if (!profile) return;

    try {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (scenario) {
        setActiveScenario(scenario);
        const result = await trainingModule.startTraining(scenarioId, profile);
        setResults(prev => [...prev, result]);
        setCharacterData(profile.getProfile());
        Logger.info(`Completed scenario: ${scenario.name}`);
      }
    } catch (error) {
      Logger.error('Failed to start scenario:', error);
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Mitochondrial Training Centre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {characterData && (
            <Card>
              <CardHeader>
                <CardTitle>{characterData.name}'s Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Traits</h4>
                    <dl className="space-y-1">
                      {characterData.traits.map(trait => (
                        <div key={trait.name} className="flex justify-between">
                          <dt className="text-muted-foreground">{trait.name}:</dt>
                          <dd>{(trait.value * 100).toFixed(1)}%</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Details</h4>
                    <dl className="space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Specialization:</dt>
                        <dd>{characterData.specialization}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Experience:</dt>
                        <dd>{characterData.experience.toFixed(1)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Training Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scenarios.map(scenario => (
                    <div key={scenario.id} className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Difficulty: {scenario.difficulty}
                        </p>
                      </div>
                      <Button
                        onClick={() => startScenario(scenario.id)}
                        disabled={activeScenario !== null}
                      >
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="border-b pb-2">
                      <div className="flex justify-between">
                        <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                          {result.success ? 'Success' : 'Failed'}
                        </span>
                        <span>Score: {(result.score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.achievements.map((achievement, i) => (
                          <div key={i}>{achievement}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {activeScenario && (
            <Card>
              <CardHeader>
                <CardTitle>Active Training: {activeScenario.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Objectives:</Label>
                  <ul className="list-disc pl-4">
                    {activeScenario.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                  <Label>Conditions:</Label>
                  <dl className="grid grid-cols-3 gap-2">
                    {Object.entries(activeScenario.conditions).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-muted-foreground">{key}:</dt>
                        <dd>{(value * 100).toFixed(1)}%</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}