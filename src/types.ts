export interface TechEvent {
  id: string;
  title: string;
  region: string;
  type: string;
  modality: string;
  date: string;
  description: string;
  paid: boolean;
  url: string;
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
