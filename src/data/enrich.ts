import type { EnrichedEvent, TechEvent } from "../types";

const TIME_BY_TYPE: Record<string, string> = {
  Meetup: "19:00",
  "Meetup Online": "20:00",
  Workshop: "14:00",
  Conferência: "09:00",
  Congresso: "09:00",
  Summit: "09:00",
  "Community Day": "09:00",
  Festival: "10:00",
  Evento: "18:30",
};

// Platform domains carry no community identity — the meetup slug or the title does.
const PLATFORM_HOSTS = ["meetup.com", "sympla.com.br", "eventbrite.com.br", "eventbrite.com"];

const HOST_NAMES: Record<string, string> = {
  "codecon.dev": "Codecon",
  "thedevconf.com": "TDC",
  "womentechmakers.com": "Women Techmakers",
  "devopsdays.org": "DevOpsDays",
  "awscommunityday.com.br": "AWS Community Day Brasil",
  "python.org.br": "Python Brasil",
  "pythonbrasil.org.br": "Python Brasil",
  "gopherconlatam.org": "GopherCon Latam",
  "hacktown.com.br": "HackTown",
  "latinoware.org": "Latinoware",
  "aws.amazon.com": "AWS",
  "febrabantech.com": "Febraban Tech",
};

const SLUG_COMMUNITIES: Record<string, string> = {
  awsusergroupsp: "AWS User Group São Paulo",
  awsusergroupbh: "AWS User Group BH",
  awscampinas: "AWS User Group Campinas",
  "aws-curitiba-user-group": "AWS User Group Curitiba",
  "aws-women-user-group-goiania": "AWS Women User Group Goiânia",
  "aws-user-group-rio": "AWS User Group Rio",
  gdgriodejaneiro: "GDG Rio de Janeiro",
  gdgsjc: "GDG São José dos Campos",
  "docker-rio-de-janeiro": "Docker Rio de Janeiro",
  "rio-de-janeiro-elastic-fantastics": "Elastic Fantastics Rio",
  "datadog-user-group-brasil": "Datadog User Group Brasil",
  golangbr: "GolangBR",
};

const TITLE_COMMUNITIES: [RegExp, string][] = [
  [/linuxtips/i, "LINUXtips"],
  [/codecon/i, "Codecon"],
  [/women techmakers/i, "Women Techmakers"],
  [/devfest|build with ai|google extended/i, "GDG"],
  [/^tdc|the developer/i, "TDC"],
];

const PLACES = [
  "São José dos Campos", "São José do Rio Preto", "Rio de Janeiro", "Belo Horizonte",
  "Porto Alegre", "Campo Grande", "Feira de Santana", "Juiz de Fora",
  "Santa Rita do Sapucaí", "Montes Claros", "São Lourenço", "São Carlos", "São Roque",
  "Rio Branco", "Foz do Iguaçu", "Ribeirão Preto", "Caxias do Sul", "São Paulo",
  "Florianópolis", "Brasília", "Fortaleza", "Curitiba", "Salvador", "Campinas",
  "Joinville", "Sorocaba", "Goiânia", "Belém", "Recife", "Santos", "Natal", "Manaus",
  "Vitória", "Maceió", "Teresina", "Cuiabá", "Londrina", "Niterói", "Blumenau",
  "Aracaju", "Palmas", "Tupaciguara", "Uberlândia", "Triângulo Mineiro",
  "Vale do Paraíba", "Alto Tietê", "Baixada Santista", "Circuito das Águas Paulista",
  "Seridó", "Floripa",
];

const PLACE_ALIASES: Record<string, string> = {
  Floripa: "Florianópolis",
  SP: "São Paulo",
  BH: "Belo Horizonte",
};

const CONNECTORS = ["do", "da", "dos", "das", "de", "e"];

function norm(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function slugOf(ev: TechEvent): string | null {
  try {
    const u = new URL(ev.url);
    if (!u.hostname.includes("meetup.com")) return null;
    return u.pathname.replace(/^\/(pt-BR|pt-br)\//, "/").replace(/^\/|\/$/g, "");
  } catch {
    return null;
  }
}

function hostOf(ev: TechEvent): string {
  try {
    return new URL(ev.url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function prettify(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w, i) => (i > 0 && CONNECTORS.includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ")
    .replace(/\bAws\b/, "AWS")
    .replace(/\bUg\b/, "UG")
    .replace(/\bSp\b/g, "SP")
    .replace(/\bBh\b/g, "BH");
}

// Re-accent the place segment from the PLACES whitelist so the community name
// agrees with the city shown on the same line.
function titleCase(slug: string): string {
  const rest = slug;
  for (const place of [...PLACES].sort((a, b) => b.length - a.length)) {
    const flat = norm(place).replace(/\s+/g, "-");
    if (norm(rest).endsWith("-" + flat)) {
      return prettify(rest.slice(0, rest.length - flat.length - 1)) + " " + place;
    }
  }
  return prettify(slug);
}

// Real organiser, never the ticketing platform. Returns null when unknown.
function communityOf(ev: TechEvent): string | null {
  const slug = slugOf(ev);
  if (slug) {
    if (SLUG_COMMUNITIES[slug]) return SLUG_COMMUNITIES[slug];
    return titleCase(slug);
  }
  const host = hostOf(ev);
  if (HOST_NAMES[host]) return HOST_NAMES[host];
  for (const [re, name] of TITLE_COMMUNITIES) if (re.test(ev.title)) return name;
  if (PLATFORM_HOSTS.some((p) => host.endsWith(p))) return null;
  const label = host.split(".")[0];
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : null;
}

// Whitelist match against title, then meetup slug. Null when unknown — never the region.
function cityOf(ev: TechEvent): string | null {
  const hay = norm(ev.title + " " + (slugOf(ev) ?? "").replace(/-/g, " ") + " " + (ev.description || ""));
  let best: string | null = null;
  for (const place of PLACES) {
    if (hay.includes(norm(place)) && (!best || place.length > best.length)) best = place;
  }
  return best ? (PLACE_ALIASES[best] || best) : null;
}

export function enrichEvent(e: TechEvent): EnrichedEvent {
  return {
    ...e,
    time: TIME_BY_TYPE[e.type] || "19:00",
    community: communityOf(e),
    city: cityOf(e),
  };
}
