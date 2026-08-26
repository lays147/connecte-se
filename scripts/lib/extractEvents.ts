import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import * as z from "zod";
import type { EventSource } from "../../src/data/sources.ts";
import type { TechEvent } from "../../src/types.ts";

export type ExtractedEvent = Omit<TechEvent, "id">;

const REGIONS = ["Sudeste", "Sul", "Nordeste", "Centro-Oeste", "Norte"] as const;

function buildExtractedEventSchema(year: number) {
  return z.object({
    title: z.string().min(1),
    region: z.enum(REGIONS),
    type: z.string().min(1),
    modality: z.enum(["Presencial", "Online", "Híbrido", "Não informado"]),
    date: z
      .string()
      .regex(new RegExp(`^${year}-\\d{2}-\\d{2}$`), `date must be an ISO YYYY-MM-DD date in ${year}`)
      .refine((value) => !Number.isNaN(new Date(value).getTime()), "date must be a valid calendar date"),
    description: z.string().min(1),
    paid: z.boolean(),
    url: z.string().url(),
  });
}

const MODEL = "claude-sonnet-5";

let client: Anthropic | undefined;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export interface PageLink {
  href: string;
  text: string;
}

const MAX_LINKS = 300;

function buildPrompt(pageText: string, pageLinks: PageLink[], source: EventSource, year: number): string {
  const linksBlock = pageLinks
    .slice(0, MAX_LINKS)
    .map((l) => `- "${l.text}" -> ${l.href}`)
    .join("\n");

  return `You are extracting structured tech-event data for a Brazil tech-events aggregator site.

Source context:
- name: ${source.name}
- url: ${source.url}
- type: ${source.type}
- frequency: ${source.frequency}

Instructions:
- Only extract events that will actually take place in Brazil during calendar year ${year}. Never invent or guess a date — if you cannot determine a specific, real ${year} date for an event, omit it.
- Many of these sources (e.g. DevOpsDays, ServerlessDays, Web Summit, AWS Summit-style events) run many international editions/chapters. Scan the ENTIRE page for every listed edition or chapter, identify which ones are located in Brazil (by Brazilian city/state name, "Brasil"/"Brazil" labeling, or .br links), and extract ONLY those. Ignore every non-Brazil edition, even if it is the most prominent one on the page.
- If the page is a global index/listing page whose links point to separate per-city pages, and a Brazil edition's own date/details are not directly visible in this page's text, return an empty array rather than guessing at what that sub-page might say.
- If the page contains no discoverable concrete Brazil event details (dates, locations) at all, return an empty array.
- For "region", infer the Brazilian macro-region from the city/state mentioned (e.g. São Paulo/Rio de Janeiro/Belo Horizonte -> Sudeste, Porto Alegre/Curitiba/Florianópolis -> Sul, Recife/Salvador/Fortaleza -> Nordeste, Brasília/Goiânia -> Centro-Oeste, Manaus/Belém -> Norte). If you cannot reasonably infer the region, omit that event entirely.
- "type" should be a short free-text label matching the style "Conferência", "Meetup", "Summit", etc.
- "modality" must be one of "Presencial", "Online", "Híbrido", or "Não informado". Determine it from the page text (words like "presencial", "online", "virtual", "híbrido", a physical venue/address block, or a video-call link for remote attendance). If the page does not make this clear, use "Não informado" rather than guessing.
- "description" should be a 1-2 sentence description written in Portuguese.
- "paid" should reflect actual ticket/pricing information when present in the text; otherwise infer a reasonable default from the event's apparent scale (large multi-day conferences are usually paid, community meetups are usually free).
- "url" must be a single, clean, well-formed URL identifying that SPECIFIC event/edition, not the generic source page. A "Links found on the page" list is provided below with each link's visible text and its target address — when a Brazil edition corresponds to one of those links (e.g. the link text names that city or that edition), use that link's exact href as "url". Only fall back to the source url given above when no specific per-edition link can be matched. Never concatenate multiple links, paths, or URL fragments into one string.
- Return every distinct dated Brazil event you find (a page may describe multiple: recurring meetup dates, multiple Brazilian chapters of the same series, etc). If there are none, return an empty array.

Links found on the page (visible text -> target URL, may be truncated):
"""
${linksBlock}
"""

Page text content (may be truncated):
"""
${pageText}
"""`;
}

export async function extractEventsFromPage(
  pageText: string,
  pageLinks: PageLink[],
  source: EventSource,
  year: number,
): Promise<ExtractedEvent[]> {
  const ExtractedEventsSchema = z.array(buildExtractedEventSchema(year));

  const response = await getClient().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    output_config: {
      format: zodOutputFormat(ExtractedEventsSchema),
    },
    messages: [{ role: "user", content: buildPrompt(pageText, pageLinks, source, year) }],
  });

  if (response.parsed_output === null) {
    throw new Error(`No structured output returned for source "${source.name}"`);
  }

  const knownUrls = new Set([source.url, ...pageLinks.map((l) => l.href)]);

  return response.parsed_output.map((event) => ({
    ...event,
    url: knownUrls.has(event.url) ? event.url : source.url,
  }));
}
