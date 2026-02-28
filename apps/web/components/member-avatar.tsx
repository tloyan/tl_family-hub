import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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

/** Returns true if the color is "light" (use dark text), false if "dark" (use white text). */
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Relative luminance formula (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

const sizeClasses = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
} as const;

export function MemberAvatar({ name, color, size = 'md', className }: MemberAvatarProps) {
  const initials = getInitials(name);
  const textColor = isLightColor(color) ? 'text-gray-900' : 'text-white';

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback className={cn('font-semibold', textColor)} style={{ backgroundColor: color }}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
