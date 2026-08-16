import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing } from '@/constants/theme';

const BENEFITS = [
  'Sem anúncios em nenhuma tela',
  'Estilos e fundo com foto exclusivos na sua carta',
  'Apoia o desenvolvimento do app',
];

interface PremiumSectionProps {
  isPremium: boolean;
  premiumSince: string | null;
  onSubscribe: () => void;
  onCancel: () => void;
}

export function PremiumSection({ isPremium, premiumSince, onSubscribe, onCancel }: PremiumSectionProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleConfirm() {
    setLoading(true);
    // Checkout simulado (modo demonstração) — sem gateway de pagamento real conectado.
    setTimeout(() => {
      onSubscribe();
      setLoading(false);
      setCheckoutOpen(false);
    }, 700);
  }

  if (isPremium) {
    return (
      <Card style={[styles.card, styles.cardActive]}>
        <View style={styles.headerRow}>
          <Ionicons name="star" size={18} color={colors.gold} />
          <Text style={styles.titleActive}>Você é Premium</Text>
        </View>
        {premiumSince && (
          <Text style={styles.subText}>Assinante desde {new Date(premiumSince).toLocaleDateString('pt-BR')}</Text>
        )}
        <Pressable onPress={onCancel}>
          <Text style={styles.cancelLink}>Cancelar assinatura</Text>
        </Pressable>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="star-outline" size={18} color={colors.gold} />
        <Text style={styles.title}>Pelada Premium</Text>
      </View>
      {BENEFITS.map((b) => (
        <View key={b} style={styles.benefitRow}>
          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          <Text style={styles.benefitText}>{b}</Text>
        </View>
      ))}

      {!checkoutOpen ? (
        <Button label="Assinar por R$ 9,90/mês" onPress={() => setCheckoutOpen(true)} style={{ marginTop: spacing.sm }} />
      ) : (
        <View style={styles.checkout}>
          <Text style={styles.checkoutTitle}>Confirmar assinatura</Text>
          <Text style={styles.checkoutText}>
            Modo demonstração: nenhum pagamento real será cobrado. Em produção aqui entraria o checkout da loja
            (App Store / Google Play) ou de um gateway como Stripe/Mercado Pago.
          </Text>
          <View style={styles.checkoutActions}>
            <Button label="Voltar" variant="ghost" small onPress={() => setCheckoutOpen(false)} disabled={loading} />
            <Button
              label={loading ? 'Processando...' : 'Confirmar (demo)'}
              small
              onPress={handleConfirm}
              disabled={loading}
              style={{ flex: 1 }}
            />
          </View>
          {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.xs }} />}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
    gap: spacing.xs,
    borderColor: 'rgba(212,175,55,0.4)',
  },
  cardActive: {
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  titleActive: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '800',
  },
  subText: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  cancelLink: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  benefitText: {
    color: colors.textMuted,
    fontSize: 12,
    flex: 1,
  },
  checkout: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
  },
  checkoutTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  checkoutText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: spacing.sm,
  },
  checkoutActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
});
