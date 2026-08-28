import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { TechEvent } from "../src/types.ts";
import { buildEventId, isValidDate, monthNameFromDate, sortEventsByMonth, type EventsByMonth } from "./lib/events.ts";

interface CliArgs {
  title: string;
  region: string;
  type: string;
  modality: string;
  date: string;
  time: string | null;
  description: string;
  paid: boolean;
  url: string;
}

function parseCliArgs(argv: string[]): CliArgs {
  const get = (flag: string): string | undefined => {
    const prefix = `--${flag}=`;
    const arg = argv.find((a) => a.startsWith(prefix));
    return arg?.slice(prefix.length);
  };

  const title = get("title");
  const region = get("region");
  const type = get("type");
  const modality = get("modality");
  const date = get("date");
  const time = get("time");
  const description = get("description");
  const paidRaw = get("paid");
  const url = get("url");

  if (!title || !region || !type || !modality || !date || !description || !paidRaw || !url) {
    throw new Error(
      "Usage: add-event --title=<title> --region=<region> --type=<type> --modality=<modality> " +
        "--date=<YYYY-MM-DD> [--time=<HH:mm>] --description=<description> --paid=<true|false> --url=<url>",
    );
  }

  if (!isValidDate(date)) {
    throw new Error(`Invalid date "${date}": expected format YYYY-MM-DD`);
  }

  if (time !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error(`Invalid time "${time}": expected 24h format HH:mm`);
  }

  if (paidRaw !== "true" && paidRaw !== "false") {
    throw new Error(`Invalid paid value "${paidRaw}": expected "true" or "false"`);
  }

  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid url "${url}"`);
  }

  return { title, region, type, modality, date, time: time ?? null, description, paid: paidRaw === "true", url };
}

function main(): void {
  const args = parseCliArgs(process.argv.slice(2));
  const year = args.date.slice(0, 4);
  const eventsPath = fileURLToPath(new URL(`../src/data/events-${year}.json`, import.meta.url));

  const events = JSON.parse(readFileSync(eventsPath, "utf-8")) as EventsByMonth;

  const id = buildEventId(args.date, args.title);
  for (const bucket of Object.values(events)) {
    if (bucket?.some((e) => e.id === id)) {
      throw new Error(`An event with id "${id}" already exists`);
    }
    if (bucket?.some((e) => e.url === args.url && e.date === args.date)) {
      throw new Error(`An event with url "${args.url}" on ${args.date} already exists`);
    }
  }

  const event: TechEvent = {
    id,
    title: args.title,
    region: args.region,
    type: args.type,
    modality: args.modality,
    date: args.date,
    time: args.time,
    description: args.description,
    paid: args.paid,
    url: args.url,
  };

  const month = monthNameFromDate(args.date);
  const bucket = events[month] ?? [];
  bucket.push(event);
  events[month] = bucket;

  writeFileSync(eventsPath, `${JSON.stringify(sortEventsByMonth(events), null, 2)}\n`);
  console.log(`Added event "${args.title}" (${id}) to ${eventsPath}`);
}

main();
