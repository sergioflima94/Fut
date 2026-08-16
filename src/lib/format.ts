import { format, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatGameDateLong(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return `Hoje, ${format(date, 'HH:mm')}`;
  if (isTomorrow(date)) return `Amanhã, ${format(date, 'HH:mm')}`;
  return capitalizeFirst(format(date, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR }));
}

export function formatGameDateShort(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return `Hoje ${format(date, 'HH:mm')}`;
  if (isTomorrow(date)) return `Amanhã ${format(date, 'HH:mm')}`;
  return format(date, "dd/MM 'às' HH:mm", { locale: ptBR });
}

export const WEEKDAY_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function recurrenceLabel(recurrence: 'single' | 'weekly' | 'biweekly'): string {
  if (recurrence === 'single') return 'Jogo único';
  if (recurrence === 'weekly') return 'Semanal';
  return 'Quinzenal';
}

export function drawMethodLabel(method: 'arrival' | 'random' | 'rating'): string {
  if (method === 'arrival') return 'Ordem de chegada';
  if (method === 'random') return 'Aleatório';
  return 'Por nota (equilibrado)';
}
