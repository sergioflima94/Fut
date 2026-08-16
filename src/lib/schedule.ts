import type { Game, Schedule } from '@/types';

/**
 * Calcula a data/hora do próximo jogo a ser gerado a partir de uma agenda recorrente.
 * Para "single" sempre retorna a data de início. Para semanal/quinzenal, parte do
 * último jogo já gerado (ou do startDate, se ainda não gerou nenhum) e soma o
 * intervalo, ajustando para cair no dia da semana configurado.
 */
export function computeNextOccurrence(schedule: Schedule, existingGames: Game[]): Date {
  const [hour, minute] = schedule.time.split(':').map(Number);

  if (schedule.recurrence === 'single') {
    const d = new Date(schedule.startDate);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  const gamesForSchedule = existingGames
    .filter((g) => g.scheduleId === schedule.id)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const intervalDays = schedule.recurrence === 'weekly' ? 7 : 14;

  let base: Date;
  if (gamesForSchedule.length > 0) {
    base = new Date(gamesForSchedule[0].scheduledAt);
    base.setDate(base.getDate() + intervalDays);
  } else {
    base = new Date(schedule.startDate);
    base.setHours(hour, minute, 0, 0);
    if (schedule.dayOfWeek !== null) {
      const diff = (schedule.dayOfWeek - base.getDay() + 7) % 7;
      base.setDate(base.getDate() + diff);
    }
  }
  base.setHours(hour, minute, 0, 0);
  return base;
}
