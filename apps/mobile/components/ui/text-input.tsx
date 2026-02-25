/// <reference types="nativewind/types" />

import { cva, type VariantProps } from 'class-variance-authority';
import { TextInput as RNTextInput, useColorScheme } from 'react-native';

import { cn } from '@/lib/utils';

const textInputVariants = cva(
  'h-12 rounded-md border px-3 text-base text-foreground native:leading-[1.25]',
  {
    variants: {
      variant: {
        default: 'border-input bg-background',
        error: 'border-destructive bg-background',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type TextInputProps = React.ComponentProps<typeof RNTextInput> &
  VariantProps<typeof textInputVariants>;

function TextInput({ className, variant, placeholderTextColor, ...props }: TextInputProps) {
  const colorScheme = useColorScheme();
  const defaultPlaceholderColor =
    colorScheme === 'dark' ? 'hsl(240, 5%, 65%)' : 'hsl(240, 4%, 46%)';

  return (
    <RNTextInput
      className={cn(textInputVariants({ variant }), className)}
      placeholderTextColor={placeholderTextColor ?? defaultPlaceholderColor}
      {...props}
    />
  );
}

export { TextInput, textInputVariants };
export type { TextInputProps };
