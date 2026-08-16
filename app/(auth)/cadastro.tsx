import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { PlayerPosition } from '@/types';

export default function CadastroScreen() {
  const login = useAuthStore((s) => s.login);
  const updateProfile = useAppStore((s) => s.updateCurrentPlayerProfile);

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState<PlayerPosition>('line');

  function handleSubmit() {
    updateProfile({
      name: name.trim() || 'Novo Jogador',
      nickname: nickname.trim() || null,
      phone: phone.trim() || null,
      preferredPosition: position,
    });
    login();
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>Cadastre seu perfil de jogador para entrar nas peladas</Text>

      <Text style={styles.label}>Nome completo</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor={colors.textFaint} style={styles.input} />

      <Text style={styles.label}>Apelido (opcional)</Text>
      <TextInput value={nickname} onChangeText={setNickname} placeholder="Como te chamam na quadra" placeholderTextColor={colors.textFaint} style={styles.input} />

      <Text style={styles.label}>Telefone (opcional)</Text>
      <TextInput value={phone} onChangeText={setPhone} placeholder="(11) 99999-9999" placeholderTextColor={colors.textFaint} keyboardType="phone-pad" style={styles.input} />

      <Text style={styles.label}>Posição preferida</Text>
      <View style={styles.positionRow}>
        <Pressable
          onPress={() => setPosition('line')}
          style={[styles.positionOption, position === 'line' && styles.positionOptionActive]}
        >
          <Text style={[styles.positionText, position === 'line' && styles.positionTextActive]}>Linha</Text>
        </Pressable>
        <Pressable
          onPress={() => setPosition('goalkeeper')}
          style={[styles.positionOption, position === 'goalkeeper' && styles.positionOptionActive]}
        >
          <Text style={[styles.positionText, position === 'goalkeeper' && styles.positionTextActive]}>Goleiro</Text>
        </Pressable>
      </View>

      <Button label="Criar conta e entrar" onPress={handleSubmit} disabled={!name.trim()} style={{ marginTop: spacing.xl }} />
      <Button label="Voltar" onPress={() => router.back()} variant="ghost" style={{ marginTop: spacing.sm }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  positionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  positionOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  positionOptionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  positionText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  positionTextActive: {
    color: colors.primary,
  },
});
