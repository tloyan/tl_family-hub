import { useState } from 'react';
import { View } from 'react-native';
import { useMutation } from '@apollo/client/react';
import { Pencil, Check, X } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { updateHouseholdInput } from '@family-hub/shared';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { UPDATE_HOUSEHOLD_MUTATION, MY_HOUSEHOLD_QUERY } from '../graphql';

interface HouseholdNameEditorProps {
  name: string;
}

export function HouseholdNameEditor({ name }: HouseholdNameEditorProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#0a0a0a' : '#fafafa';

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState('');

  const [updateHousehold, { loading }] = useMutation(UPDATE_HOUSEHOLD_MUTATION, {
    refetchQueries: [MY_HOUSEHOLD_QUERY],
  });

  function handleEdit() {
    setValue(name);
    setError('');
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
    setError('');
  }

  async function handleSave() {
    const result = updateHouseholdInput.safeParse({ name: value });
    if (!result.success) {
      setError('Le nom doit contenir entre 1 et 100 caracteres.');
      return;
    }

    try {
      await updateHousehold({ variables: { input: { name: result.data.name } } });
      setEditing(false);
      setError('');
    } catch {
      setError('Impossible de modifier le nom.');
    }
  }

  if (editing) {
    return (
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1"
            value={value}
            onChangeText={setValue}
            autoFocus
            variant={error ? 'error' : 'default'}
          />
          <Button variant="ghost" size="icon" onPress={() => void handleSave()} disabled={loading}>
            <Check size={20} color={iconColor} />
          </Button>
          <Button variant="ghost" size="icon" onPress={handleCancel} disabled={loading}>
            <X size={20} color={iconColor} />
          </Button>
        </View>
        {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-2xl font-bold">{name}</Text>
      <Button variant="ghost" size="icon" onPress={handleEdit}>
        <Pencil size={18} color={iconColor} />
      </Button>
    </View>
  );
}
