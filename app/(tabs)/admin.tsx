import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import { colors, spacing } from '@/constants/theme';
import { drawMethodLabel, formatGameDateShort, recurrenceLabel, WEEKDAY_LABELS } from '@/lib/format';
import { computeNextOccurrence } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import type { DrawMethod, RecurrenceType } from '@/types';

export default function AdminScreen() {
  const currentPlayerId = useAppStore((s) => s.currentPlayerId);
  const pelada = useAppStore((s) => s.peladas[0]);
  const isAdmin = useAppStore((s) => s.isAdmin(currentPlayerId, pelada.id));

  if (!isAdmin) {
    return (
      <Screen>
        <View style={styles.notAdmin}>
          <Ionicons name="lock-closed" size={32} color={colors.textFaint} />
          <Text style={styles.notAdminText}>Você não é administrador desta pelada.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Administração</Text>
      <AdminsSection />
      <FieldsSection />
      <SchedulesSection />
      <PunishmentsSection />
    </Screen>
  );
}

function AdminsSection() {
  const pelada = useAppStore((s) => s.peladas[0]);
  const players = useAppStore((s) => s.players);
  const memberships = useAppStore(useShallow((s) => s.memberships.filter((m) => m.peladaId === pelada.id)));
  const addAdmin = useAppStore((s) => s.addAdmin);
  const removeAdmin = useAppStore((s) => s.removeAdmin);

  return (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>Administradores</Text>
      {memberships.map((m) => {
        const player = players.find((p) => p.id === m.playerId);
        if (!player) return null;
        return (
          <View key={m.playerId} style={styles.row}>
            <View style={styles.rowWithAvatar}>
              <Avatar name={player.name} photoUrl={player.avatarUrl} size={28} />
              <Text style={styles.rowText}>{player.name}</Text>
            </View>
            {m.role === 'admin' ? (
              <View style={styles.rowActions}>
                <Badge label="Admin" color={colors.primary} />
                <Pressable onPress={() => removeAdmin(pelada.id, m.playerId)}>
                  <Text style={styles.linkDanger}>remover</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => addAdmin(pelada.id, m.playerId)}>
                <Text style={styles.link}>tornar admin</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </Card>
  );
}

function FieldsSection() {
  const pelada = useAppStore((s) => s.peladas[0]);
  const fields = useAppStore((s) => s.fields);
  const addField = useAppStore((s) => s.addField);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  function handleAdd() {
    if (!name.trim()) return;
    addField(pelada.id, name.trim(), address.trim(), '');
    setName('');
    setAddress('');
    setOpen(false);
  }

  return (
    <Card style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Campos</Text>
        <Pressable onPress={() => setOpen((v) => !v)}>
          <Ionicons name={open ? 'close' : 'add-circle'} size={22} color={colors.primary} />
        </Pressable>
      </View>
      {fields.map((f) => (
        <View key={f.id} style={styles.row}>
          <View>
            <Text style={styles.rowText}>{f.name}</Text>
            {f.address && <Text style={styles.rowSub}>{f.address}</Text>}
          </View>
        </View>
      ))}
      {open && (
        <View style={styles.form}>
          <TextField label="Nome do campo" value={name} onChangeText={setName} placeholder="Arena Society Central" />
          <TextField label="Endereço" value={address} onChangeText={setAddress} placeholder="Rua, número, bairro" />
          <Button label="Adicionar campo" onPress={handleAdd} disabled={!name.trim()} />
        </View>
      )}
    </Card>
  );
}

function SchedulesSection() {
  const pelada = useAppStore((s) => s.peladas[0]);
  const fields = useAppStore((s) => s.fields);
  const schedules = useAppStore((s) => s.schedules);
  const games = useAppStore((s) => s.games);
  const addSchedule = useAppStore((s) => s.addSchedule);
  const addGameFromSchedule = useAppStore((s) => s.addGameFromSchedule);

  const [open, setOpen] = useState(false);
  const [fieldId, setFieldId] = useState(fields[0]?.id ?? '');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState(4);
  const [time, setTime] = useState('20:00');
  const [maxPlayers, setMaxPlayers] = useState(String(pelada.defaultMaxPlayers));
  const [drawMethod, setDrawMethod] = useState<DrawMethod>('rating');

  function handleAdd() {
    if (!fieldId) return;
    addSchedule({
      peladaId: pelada.id,
      fieldId,
      recurrence,
      dayOfWeek: recurrence === 'single' ? null : dayOfWeek,
      time,
      startDate: new Date().toISOString().slice(0, 10),
      maxPlayers: Number(maxPlayers) || pelada.defaultMaxPlayers,
      matchMinutes: pelada.defaultMatchMinutes,
      drawMethod,
    });
    setOpen(false);
  }

  return (
    <Card style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Agenda</Text>
        <Pressable onPress={() => setOpen((v) => !v)}>
          <Ionicons name={open ? 'close' : 'add-circle'} size={22} color={colors.primary} />
        </Pressable>
      </View>

      {schedules.map((s) => {
        const field = fields.find((f) => f.id === s.fieldId);
        const next = computeNextOccurrence(s, games);
        return (
          <View key={s.id} style={styles.scheduleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowText}>
                {recurrenceLabel(s.recurrence)} {s.recurrence !== 'single' && `· ${WEEKDAY_LABELS[s.dayOfWeek ?? 0]}`} · {s.time}
              </Text>
              <Text style={styles.rowSub}>
                {field?.name} · até {s.maxPlayers} vagas · {drawMethodLabel(s.drawMethod)}
              </Text>
              <Text style={styles.rowSub}>Próximo: {formatGameDateShort(next.toISOString())}</Text>
            </View>
            <Button
              label="Gerar jogo"
              small
              variant="secondary"
              onPress={() => addGameFromSchedule(s.id, next.toISOString())}
            />
          </View>
        );
      })}

      {open && (
        <View style={styles.form}>
          <SegmentedControl
            label="Recorrência"
            value={recurrence}
            onChange={setRecurrence}
            options={[
              { value: 'single', label: 'Único' },
              { value: 'weekly', label: 'Semanal' },
              { value: 'biweekly', label: 'Quinzenal' },
            ]}
          />
          {recurrence !== 'single' && (
            <SegmentedControl
              label="Dia da semana"
              value={String(dayOfWeek)}
              onChange={(v) => setDayOfWeek(Number(v))}
              options={WEEKDAY_LABELS.map((label, idx) => ({ value: String(idx), label: label.slice(0, 3) }))}
            />
          )}
          <TextField label="Horário (HH:mm)" value={time} onChangeText={setTime} placeholder="20:00" />
          <SegmentedControl
            label="Campo"
            value={fieldId}
            onChange={setFieldId}
            options={fields.map((f) => ({ value: f.id, label: f.name }))}
          />
          <TextField label="Limite de vagas" value={maxPlayers} onChangeText={setMaxPlayers} keyboardType="number-pad" />
          <SegmentedControl
            label="Método de sorteio padrão"
            value={drawMethod}
            onChange={setDrawMethod}
            options={[
              { value: 'arrival', label: 'Chegada' },
              { value: 'random', label: 'Aleatório' },
              { value: 'rating', label: 'Por nota' },
            ]}
          />
          <Button label="Criar agenda" onPress={handleAdd} disabled={!fieldId} />
        </View>
      )}
    </Card>
  );
}

function PunishmentsSection() {
  const pelada = useAppStore((s) => s.peladas[0]);
  const players = useAppStore((s) => s.players);
  const punishments = useAppStore(useShallow((s) => s.punishments.filter((p) => p.peladaId === pelada.id)));

  return (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>Punições registradas</Text>
      {punishments.length === 0 ? (
        <Text style={styles.rowSub}>Nenhuma falta registrada até agora.</Text>
      ) : (
        punishments
          .slice()
          .reverse()
          .map((p) => {
            const player = players.find((pl) => pl.id === p.playerId);
            return (
              <View key={p.id} style={styles.row}>
                <View style={styles.rowWithAvatar}>
                  {player && <Avatar name={player.name} photoUrl={player.avatarUrl} size={28} />}
                  <Text style={styles.rowText}>{player?.name}</Text>
                </View>
                <Badge
                  label={p.suspendedUntilGameCount > 0 ? `Suspenso ${p.suspendedUntilGameCount} jogo(s)` : `Aviso (nível ${p.strikeLevel})`}
                  color={p.suspendedUntilGameCount > 0 ? colors.danger : colors.warning}
                />
              </View>
            );
          })
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  notAdmin: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  notAdminText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  rowWithAvatar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  rowSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  link: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  linkDanger: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
});
