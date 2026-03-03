import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberAvatar } from '@/components/member-avatar';
import type { HouseholdMember } from '../graphql';
import { ROLE_LABELS } from '../constants';

interface MembersListProps {
  members: HouseholdMember[];
}

export function MembersList({ members }: MembersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Membres</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <MemberAvatar
                name={member.userName ?? member.userEmail ?? '?'}
                color={member.color}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {member.userName ?? member.userEmail ?? 'Membre'}
                </span>
                <span className="text-muted-foreground text-xs">
                  {ROLE_LABELS[member.role] ?? member.role}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
