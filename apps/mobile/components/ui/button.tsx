/// <reference types="nativewind/types" />

import { cva, type VariantProps } from 'class-variance-authority';
import { Pressable } from 'react-native';

import { cn } from '@/lib/utils';
import { TextClassContext } from './text';

const buttonVariants = cva('group flex-row items-center justify-center gap-2 rounded-md', {
  variants: {
    variant: {
      default: 'bg-primary active:bg-primary/90',
      destructive: 'bg-destructive active:bg-destructive/90',
      outline: 'border border-border bg-background active:bg-accent',
      secondary: 'bg-secondary active:bg-secondary/80',
      ghost: 'active:bg-accent',
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 gap-1.5 rounded-md px-3',
      lg: 'h-12 rounded-md px-6',
      icon: 'size-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const buttonTextVariants = cva('text-sm font-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      secondary: 'text-secondary-foreground',
      ghost: 'text-foreground',
    },
    size: {
      default: '',
      sm: '',
      lg: '',
      icon: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type ButtonProps = React.ComponentProps<typeof Pressable> & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(props.disabled && 'opacity-50', buttonVariants({ variant, size }), className)}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
