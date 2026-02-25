/// <reference types="nativewind/types" />

import { View } from 'react-native';

import { cn } from '@/lib/utils';

type SeparatorProps = React.ComponentProps<typeof View> & {
  orientation?: 'horizontal' | 'vertical';
};

function Separator({ className, orientation = 'horizontal', ...props }: SeparatorProps) {
  return (
    <View
      className={cn(
        'bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
export type { SeparatorProps };
