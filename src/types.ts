export interface TechEvent {
  id: string;
  title: string;
  city: string | null;
  state: string | null;
  region: string;
  type: string;
  modality: string;
  date: string;
  time: string | null;
  description: string;
  paid: boolean;
  url: string;
}

export interface EnrichedEvent extends TechEvent {
  time: string;
  community: string | null;
  city: string | null;
}

export type EventsByMonth = Partial<Record<MonthName, TechEvent[]>>;

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export type MonthName = (typeof MONTH_NAMES)[number];
