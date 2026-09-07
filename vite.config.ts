import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";

const SHARED_HEAD = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap"
      rel="stylesheet"
    />
    <script>
      (function () {
        try {
          var stored = localStorage.getItem("color-theme");
          var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
          document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
        } catch (e) {}
      })();
    </script>`;

function sharedHeadPlugin(): Plugin {
  return {
    name: "shared-head",
    transformIndexHtml(html) {
      return html.replace("<!-- shared-head -->", SHARED_HEAD);
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), sharedHeadPlugin()],
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
