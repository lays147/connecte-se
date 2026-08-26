interface TypeStyle {
  text: string;
  bg: string;
  dot: string;
}

const PURPLE: TypeStyle = { text: "text-brand-700", bg: "bg-brand-100", dot: "bg-brand-700" };
const BLUE: TypeStyle = { text: "text-accent-blue-700", bg: "bg-accent-blue-50", dot: "bg-accent-blue-700" };
const TEAL: TypeStyle = { text: "text-accent-teal-700", bg: "bg-accent-teal-50", dot: "bg-accent-teal-700" };
const CORAL: TypeStyle = { text: "text-accent-coral-700", bg: "bg-accent-coral-50", dot: "bg-accent-coral-700" };
const NEUTRAL: TypeStyle = { text: "text-neutral-700", bg: "bg-neutral-50", dot: "bg-neutral-700" };

const TYPE_STYLE: Record<string, TypeStyle> = {
  Meetup: PURPLE,
  "Meetup Online": PURPLE,
  Conferência: BLUE,
  Congresso: BLUE,
  Summit: BLUE,
  Workshop: TEAL,
  "Community Day": CORAL,
  Festival: CORAL,
  Evento: NEUTRAL,
};

export function typeStyle(type: string): TypeStyle {
  return TYPE_STYLE[type] || NEUTRAL;
}

export interface PriceStyle {
  label: string;
  bg: string;
  text: string;
}

export function priceStyle(paid: boolean): PriceStyle {
  return paid
    ? { label: "Pago", bg: "bg-price-paid-bg", text: "text-price-paid-text" }
    : { label: "Gratuito", bg: "bg-price-free-bg", text: "text-price-free-text" };
}

export interface ModalityBadge {
  label: string;
  bg: string;
}

export function modalityBadge(modality: string): ModalityBadge {
  return modality === "Online"
    ? { label: "Online", bg: "bg-modality-online-bg" }
    : { label: "Presencial", bg: "bg-modality-presencial-bg" };
}
