import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = "https://connect.lays147.dev.br";
const ROOT = resolve(import.meta.dirname, "..");

const PAGES = [
  { file: "index.html", loc: "/", priority: "1.0" },
  { file: "mapa.html", loc: "/mapa.html", priority: "0.8" },
  { file: "comunidades.html", loc: "/comunidades.html", priority: "0.6" },
  { file: "conteudos.html", loc: "/conteudos.html", priority: "0.6" },
];

function lastCommitDate(file: string): string {
  try {
    return execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      cwd: ROOT,
      encoding: "utf-8",
    }).trim();
  } catch {
    return new Date().toISOString();
  }
}

function buildSitemap(): string {
  const entries = PAGES.map(({ file, loc, priority }) => {
    const lastmod = (lastCommitDate(file) || new Date().toISOString()).slice(0, 10);
    return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

writeFileSync(resolve(ROOT, "public/sitemap.xml"), buildSitemap());
console.log("wrote public/sitemap.xml");
