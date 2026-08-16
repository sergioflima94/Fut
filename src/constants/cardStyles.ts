export interface CardStyle {
  id: string;
  label: string;
  /** Gradiente [topo, base]. null = usa a cor da faixa calculada pela nota (bronze/prata/ouro/especial). */
  colors: [string, string] | null;
  /** Exclusivo de quem assina o Premium. */
  premium: boolean;
}

export const CARD_STYLES: CardStyle[] = [
  { id: 'default', label: 'Padrão (por nota)', colors: null, premium: false },
  { id: 'emerald', label: 'Esmeralda', colors: ['#059669', '#022c22'], premium: false },
  { id: 'sapphire', label: 'Safira', colors: ['#2563EB', '#0b1220'], premium: false },
  { id: 'ruby', label: 'Rubi', colors: ['#DC2626', '#1a0505'], premium: false },
  { id: 'amethyst', label: 'Ametista', colors: ['#7C3AED', '#140a24'], premium: true },
  { id: 'sunset', label: 'Pôr do sol', colors: ['#F97316', '#1a0f02'], premium: true },
  { id: 'obsidian', label: 'Obsidiana', colors: ['#1F2937', '#000000'], premium: true },
  { id: 'gold', label: 'Ouro', colors: ['#D4AF37', '#1a1502'], premium: true },
  { id: 'holographic', label: 'Holográfico', colors: ['#EC4899', '#3B82F6'], premium: true },
  { id: 'ice', label: 'Gelo', colors: ['#22D3EE', '#0b1a1f'], premium: true },
];

export function getCardStyle(id: string | null): CardStyle {
  return CARD_STYLES.find((s) => s.id === id) ?? CARD_STYLES[0];
}
