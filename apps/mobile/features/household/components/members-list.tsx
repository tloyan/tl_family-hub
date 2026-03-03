import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Separator } from '@/components/ui/separator';
import { MemberAvatar } from './member-avatar';
import { ROLE_LABELS } from '../constants';
import type { HouseholdMember } from '../graphql';

interface MembersListProps {
  members: HouseholdMember[];
}

export function MembersList({ members }: MembersListProps) {
  return (
    <View className="rounded-lg border border-border bg-card p-4">
      {members.map((member, index) => (
        <View key={member.id}>
          {index > 0 && <Separator className="my-3" />}
          <View className="flex-row items-center gap-3">
            <MemberAvatar
              name={member.userName ?? member.userEmail ?? 'Membre'}
              color={member.color}
              size="sm"
            />
            <View className="flex-1">
              <Text className="text-sm font-medium">
                {member.userName ?? member.userEmail ?? 'Membre'}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {ROLE_LABELS[member.role] ?? member.role}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
