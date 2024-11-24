import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CharacterProfile } from "@/bio/training/MitochondrialProfile"
import { ProfileManager } from "@/bio/training/ProfileManager"
import { useState, useEffect } from "react"
import { Logger } from "@/cogutil/Logger"

interface ProfileSelectorProps {
  onProfileSelect: (profile: CharacterProfile) => void;
  selectedProfile?: CharacterProfile;
}

export function ProfileSelector({ onProfileSelect, selectedProfile }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const profileList = await ProfileManager.listProfiles();
      setProfiles(profileList);
      setLoading(false);
    } catch (err) {
      Logger.error('Failed to load profiles:', err);
      setError('Failed to load profiles');
      setLoading(false);
    }
  };

  const handleProfileSelect = async (name: string) => {
    try {
      const profile = await ProfileManager.loadProfile(name);
      if (profile) {
        onProfileSelect(profile);
      }
    } catch (err) {
      Logger.error('Failed to load profile:', err);
      setError('Failed to load profile');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          Loading profiles...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          {profiles.map(name => (
            <Button
              key={name}
              variant={selectedProfile?.name === name ? 'default' : 'outline'}
              onClick={() => handleProfileSelect(name)}
              className="justify-start"
            >
              {name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}