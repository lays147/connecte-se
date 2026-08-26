import type { EnrichedEvent } from "../types";

export const UF_NAME: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AM: "Amazonas",
  AP: "Amapá",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MG: "Minas Gerais",
  MS: "Mato Grosso do Sul",
  MT: "Mato Grosso",
  PA: "Pará",
  PB: "Paraíba",
  PE: "Pernambuco",
  PI: "Piauí",
  PR: "Paraná",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RO: "Rondônia",
  RR: "Roraima",
  RS: "Rio Grande do Sul",
  SC: "Santa Catarina",
  SE: "Sergipe",
  SP: "São Paulo",
  TO: "Tocantins",
};

// Keyed on the already-resolved EnrichedEvent.city (post PLACE_ALIASES in enrich.ts).
const CITY_UF: Record<string, string> = {
  "São José dos Campos": "SP",
  "São José do Rio Preto": "SP",
  "Rio de Janeiro": "RJ",
  "Belo Horizonte": "MG",
  "Porto Alegre": "RS",
  "Campo Grande": "MS",
  "Feira de Santana": "BA",
  "Juiz de Fora": "MG",
  "Santa Rita do Sapucaí": "MG",
  "Montes Claros": "MG",
  "São Lourenço": "MG",
  "São Carlos": "SP",
  "São Roque": "SP",
  "Rio Branco": "AC",
  "Foz do Iguaçu": "PR",
  "Ribeirão Preto": "SP",
  "Caxias do Sul": "RS",
  "São Paulo": "SP",
  Florianópolis: "SC",
  Brasília: "DF",
  Fortaleza: "CE",
  Curitiba: "PR",
  Salvador: "BA",
  Campinas: "SP",
  Joinville: "SC",
  Sorocaba: "SP",
  Goiânia: "GO",
  Belém: "PA",
  Recife: "PE",
  Santos: "SP",
  Natal: "RN",
  Manaus: "AM",
  Vitória: "ES",
  Maceió: "AL",
  Teresina: "PI",
  Cuiabá: "MT",
  Londrina: "PR",
  Niterói: "RJ",
  Blumenau: "SC",
  Aracaju: "SE",
  Palmas: "TO",
  Tupaciguara: "MG",
  Uberlândia: "MG",
  "Triângulo Mineiro": "MG",
  "Vale do Paraíba": "SP",
  "Alto Tietê": "SP",
  "Baixada Santista": "SP",
  "Circuito das Águas Paulista": "SP",
  Seridó: "RN",
};

const UF_TOKENS = Object.keys(UF_NAME);

function norm(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Falls back to scanning the raw text for a bare UF sigla (e.g. "Meetup SP")
// when the curated city whitelist in enrich.ts didn't already resolve a city.
function ufFromText(e: EnrichedEvent): string | null {
  const hay = " " + e.title + " " + (e.description || "") + " ";
  for (const t of UF_TOKENS) {
    if (new RegExp("[\\s,(/-]" + t + "[\\s,.)/-]").test(hay)) return t;
  }
  return null;
}

export function ufOf(e: EnrichedEvent): string | null {
  if (e.city && CITY_UF[e.city]) return CITY_UF[e.city];
  return ufFromText(e);
}

export function isOnline(e: EnrichedEvent): boolean {
  return norm(e.modality) === "online";
}
