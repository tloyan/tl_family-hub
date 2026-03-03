import { View } from 'react-native';

import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';

interface MemberAvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => (part[0] ?? '').toUpperCase())
    .join('');
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const;

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const;

export function MemberAvatar({ name, color, size = 'md', className }: MemberAvatarProps) {
  const initials = getInitials(name);
  const textColor = isLightColor(color) ? 'text-gray-900' : 'text-white';

  return (
    <View
      className={cn('items-center justify-center rounded-full', sizeClasses[size], className)}
      style={{ backgroundColor: color }}
    >
      <Text className={cn('font-semibold', textSizeClasses[size], textColor)}>{initials}</Text>
    </View>
  );
}
