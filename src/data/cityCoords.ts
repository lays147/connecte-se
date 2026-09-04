// Approximate centroid (lat, lng) for each city in CITY_UF. Good enough for
// "events near me" distance sorting/filtering — not survey-grade precision.
export const CITY_COORDS: Record<string, [number, number]> = {
  "São José dos Campos": [-23.1794, -45.8869],
  "São José do Rio Preto": [-20.8113, -49.3758],
  "Rio de Janeiro": [-22.9068, -43.1729],
  "Belo Horizonte": [-19.9167, -43.9345],
  "Porto Alegre": [-30.0346, -51.2177],
  "Campo Grande": [-20.4697, -54.6201],
  "Feira de Santana": [-12.2664, -38.9663],
  "Juiz de Fora": [-21.7642, -43.3503],
  "Santa Rita do Sapucaí": [-22.2461, -45.6997],
  "Montes Claros": [-16.735, -43.8617],
  "São Lourenço": [-22.1167, -45.05],
  "São Carlos": [-22.0175, -47.8908],
  "São Roque": [-23.5297, -47.1358],
  "Rio Branco": [-9.975, -67.8243],
  "Foz do Iguaçu": [-25.5478, -54.5882],
  "Ribeirão Preto": [-21.1699, -47.8099],
  "Caxias do Sul": [-29.1634, -51.1797],
  "São Paulo": [-23.5505, -46.6333],
  Florianópolis: [-27.5954, -48.548],
  Brasília: [-15.7939, -47.8828],
  Fortaleza: [-3.7172, -38.5433],
  Curitiba: [-25.4284, -49.2733],
  Salvador: [-12.9777, -38.5016],
  Campinas: [-22.9099, -47.0626],
  Joinville: [-26.3044, -48.8464],
  Sorocaba: [-23.5015, -47.4526],
  Goiânia: [-16.6869, -49.2648],
  Belém: [-1.4558, -48.4902],
  Recife: [-8.0476, -34.877],
  Santos: [-23.9608, -46.3339],
  Natal: [-5.7945, -35.211],
  Manaus: [-3.119, -60.0217],
  Vitória: [-20.3155, -40.3128],
  Maceió: [-9.6498, -35.7089],
  Teresina: [-5.0892, -42.8019],
  Cuiabá: [-15.601, -56.0974],
  Londrina: [-23.3045, -51.1696],
  Niterói: [-22.8833, -43.1036],
  Blumenau: [-26.9194, -49.0661],
  Gramado: [-29.3747, -50.8764],
  Aracaju: [-10.9472, -37.0731],
  Palmas: [-10.1689, -48.3317],
  Tupaciguara: [-18.5836, -48.7],
  Uberlândia: [-18.9186, -48.2772],
  "Triângulo Mineiro": [-18.9186, -48.2772],
  "Vale do Paraíba": [-23.1794, -45.8869],
  "Alto Tietê": [-23.5364, -46.1897],
  "Baixada Santista": [-23.9608, -46.3339],
  "Circuito das Águas Paulista": [-22.4167, -45.4525],
  Seridó: [-6.5566, -36.9741],
};

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(a: [number, number], b: [number, number]): number {
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function nearestCity(coords: [number, number]): { city: string; distanceKm: number } | null {
  let best: { city: string; distanceKm: number } | null = null;
  for (const [city, cityCoords] of Object.entries(CITY_COORDS)) {
    const distanceKm = haversineKm(coords, cityCoords);
    if (!best || distanceKm < best.distanceKm) best = { city, distanceKm };
  }
  return best;
}

export function cityCoordsOf(city: string | null): [number, number] | null {
  return city ? CITY_COORDS[city] ?? null : null;
}
