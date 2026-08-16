import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function EntrarPeladaScreen() {
  const currentPlayerId = useAppStore((s) => s.currentPlayerId);
  const joinPeladaByCode = useAppStore((s) => s.joinPeladaByCode);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleJoin() {
    if (!code.trim()) return;
    const pelada = joinPeladaByCode(code, currentPlayerId);
    if (!pelada) {
      setError('Código não encontrado. Confira com quem te convidou.');
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="people-circle" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>Entrar em uma pelada</Text>
        <Text style={styles.subtitle}>Cole ou digite o código de convite que você recebeu.</Text>

        <TextInput
          value={code}
          onChangeText={(v) => {
            setCode(v);
            setError(null);
          }}
          placeholder="Ex: AMIGOS-QUI"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="characters"
          style={styles.input}
        />
        {error && <Text style={styles.error}>{error}</Text>}

        <Button label="Entrar" onPress={handleJoin} disabled={!code.trim()} style={{ marginTop: spacing.lg }} />
        <Button label="Voltar" variant="ghost" onPress={() => router.back()} style={{ marginTop: spacing.sm }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
