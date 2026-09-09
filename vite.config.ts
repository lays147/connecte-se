import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";

function lastEventsUpdateAt(): string {
  try {
    return execFileSync("git", ["log", "-1", "--format=%cI", "--", "data/*.json"], {
      cwd: import.meta.dirname,
      encoding: "utf-8",
    }).trim();
  } catch {
    return "";
  }
}

const SITE_URL = "https://connect.lays147.dev.br";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

interface PageSeo {
  path: string;
  description: string;
  jsonLd: Record<string, unknown>;
}

const PAGE_SEO: Record<string, PageSeo> = {
  "index.html": {
    path: "/",
    description:
      "Encontre meetups, conferências, comunidades e conteúdos de tecnologia em todo o Brasil. Filtre por região, cidade, modalidade e preço em um só lugar.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Conecte-se Brasil",
      alternateName: "Conecte-se",
      url: SITE_URL,
      description:
        "O mapa de eventos, comunidades e conteúdos de tecnologia do Brasil.",
      inLanguage: "pt-BR",
    },
  },
  "mapa.html": {
    path: "/mapa.html",
    description:
      "Veja no mapa onde a tecnologia acontece no Brasil: eventos por estado e cidade, com filtros por região, modalidade e preço.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Eventos no Brasil",
      url: `${SITE_URL}/mapa.html`,
      description: "Mapa interativo de eventos de tecnologia por estado e cidade no Brasil.",
      inLanguage: "pt-BR",
      isPartOf: { "@type": "WebSite", name: "Conecte-se Brasil", url: SITE_URL },
    },
  },
  "conteudos.html": {
    path: "/conteudos.html",
    description:
      "Canais, newsletters, blogs, podcasts e cursos de tecnologia que valem a pena seguir, com curadoria de conteúdo em português.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Conteúdos que valem a pena seguir",
      url: `${SITE_URL}/conteudos.html`,
      description:
        "Curadoria de canais, newsletters, blogs, podcasts e cursos de tecnologia no Brasil.",
      inLanguage: "pt-BR",
      isPartOf: { "@type": "WebSite", name: "Conecte-se Brasil", url: SITE_URL },
    },
  },
  "comunidades.html": {
    path: "/comunidades.html",
    description:
      "Diretório de comunidades, grupos de usuários e organizadores de eventos de tecnologia em todo o Brasil.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Comunidades e organizadores de tecnologia",
      url: `${SITE_URL}/comunidades.html`,
      description: "Diretório de comunidades e organizadores de eventos de tecnologia no Brasil.",
      inLanguage: "pt-BR",
      isPartOf: { "@type": "WebSite", name: "Conecte-se Brasil", url: SITE_URL },
    },
  },
};

function sharedHeadPlugin(): Plugin {
  return {
    name: "shared-head",
    transformIndexHtml(html, ctx) {
      const filename = ctx.filename.split("/").pop() ?? "index.html";
      const seo = PAGE_SEO[filename] ?? PAGE_SEO["index.html"];
      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      const title = titleMatch ? titleMatch[1] : "Conecte-se Brasil";
      const canonical = `${SITE_URL}${seo.path}`;

      const head = `
    <link rel="canonical" href="${canonical}" />
    <meta name="description" content="${seo.description}" />
    <meta name="theme-color" content="#1e0b4c" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Conecte-se Brasil" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${seo.description}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${seo.description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap"
      rel="stylesheet"
    />
    <script type="application/ld+json">${JSON.stringify(seo.jsonLd)}</script>
    <script>
      (function () {
        try {
          var stored = localStorage.getItem("color-theme");
          var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
          document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
        } catch (e) {}
      })();
    </script>`;

      return html.replace("<!-- shared-head -->", head);
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), sharedHeadPlugin()],
  define: {
    __EVENTS_UPDATED_AT__: JSON.stringify(lastEventsUpdateAt()),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        mapa: resolve(import.meta.dirname, "mapa.html"),
        conteudos: resolve(import.meta.dirname, "conteudos.html"),
        comunidades: resolve(import.meta.dirname, "comunidades.html"),
      },
    },
  },
});
