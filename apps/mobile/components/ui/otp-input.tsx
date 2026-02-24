/// <reference types="nativewind/types" />

import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { cn } from '@/lib/utils';
import { Text } from './text';

const OTP_LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
};

function OtpInput({ value, onChangeText, hasError, disabled }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);

  function handlePress() {
    inputRef.current?.focus();
  }

  function handleChange(text: string) {
    const cleaned = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChangeText(cleaned);
  }

  return (
    <View className="items-center">
      <Pressable onPress={handlePress} className="flex-row gap-3">
        {Array.from({ length: OTP_LENGTH }, (_, i) => {
          const char = value[i];
          const isActive = i === value.length && !disabled;

          return (
            <View
              key={i}
              className={cn(
                'h-14 w-12 items-center justify-center rounded-lg border-2',
                hasError
                  ? 'border-destructive'
                  : isActive
                    ? 'border-foreground'
                    : char
                      ? 'border-foreground/30'
                      : 'border-input',
                disabled && 'opacity-50',
              )}
            >
              <Text className="text-center text-2xl font-bold">{char ?? ''}</Text>
              {isActive && (
                <View className="absolute bottom-2.5 h-5 w-0.5 rounded-full bg-foreground" />
              )}
            </View>
          );
        })}
      </Pressable>

      {/* Real TextInput overlaid — visible to iOS for autofill but transparent */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus
        maxLength={OTP_LENGTH}
        editable={!disabled}
        caretHidden
        style={styles.hiddenInput}
        accessibilityLabel="Code de verification"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    color: 'transparent',
    backgroundColor: 'transparent',
    fontSize: 1,
  },
});

export { OtpInput, OTP_LENGTH };
export type { OtpInputProps };
