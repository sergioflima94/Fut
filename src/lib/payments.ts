export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Valor por pessoa no rateio, dividindo o custo da quadra pelos confirmados (mínimo 1 para evitar divisão por zero). */
export function getSplitAmount(fieldCost: number, confirmedCount: number): number {
  return fieldCost / Math.max(1, confirmedCount);
}
