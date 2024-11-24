import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CharacterProfile } from "@/bio/training/MitochondrialProfile"

interface ProfileCardProps {
  profile: CharacterProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{profile.name}'s Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Traits</h4>
            <dl className="space-y-1">
              {profile.traits.map(trait => (
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
                <dd>{profile.specialization}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Experience:</dt>
                <dd>{profile.experience.toFixed(1)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}