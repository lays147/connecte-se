export type HeaderPage = "eventos" | "mapa" | "conteudos";

export interface HeaderHandlers {
  active: HeaderPage;
  onNavCommunities?: () => void;
}

function logoMarkSvg(): string {
  return `<svg width="40" height="33" viewBox="0 0 120 100" aria-hidden="true">
    <g fill="none" stroke-linecap="round">
      <g stroke="oklch(0.5 0.17 292)" stroke-width="6.5"><path d="M14 68A22 26 0 0 1 58 68"></path><path d="M62 68A22 26 0 0 1 106 68"></path></g>
      <path d="M6 68h108" stroke="oklch(0.7 0.16 300)" stroke-width="7.5"></path>
      <g stroke="oklch(0.7 0.16 300)" stroke-width="5.5" opacity="0.9"><path d="M17 72v20M60 72v24M103 72v20"></path></g>
    </g>
  </svg>`;
}

function githubIconSvg(): string {
  return `<svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.07-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A7.995 7.995 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path>
  </svg>`;
}

export function renderHeader(handlers: HeaderHandlers): HTMLElement {
  const header = document.createElement("header");
  header.className =
    "flex flex-wrap items-center justify-between gap-3 border-b border-brand-100 bg-white px-(--spacing-gutter) py-3 sm:gap-6 sm:py-3.5";

  const logo = document.createElement("a");
  logo.href = "/index.html#top";
  logo.className = "flex items-center gap-2.5";

  const mark = document.createElement("span");
  mark.className = "flex shrink-0 items-center";
  mark.innerHTML = logoMarkSvg();

  const lockup = document.createElement("span");
  lockup.className = "flex flex-col gap-0.5";
  const name = document.createElement("span");
  name.className = "font-display text-body-md font-bold tracking-tight text-brand-950";
  name.innerHTML = `Conecte-se <span class="text-brand-500">Brasil</span>`;
  const tagline = document.createElement("span");
  tagline.className = "font-mono-label text-label-xs uppercase tracking-widest text-brand-400";
  tagline.textContent = "eventos de tecnologia";
  lockup.append(name, tagline);

  logo.append(mark, lockup);

  const nav = document.createElement("nav");
  nav.className = "flex flex-wrap items-center gap-1.5";

  function navLink(text: string, href: string, active: boolean): HTMLAnchorElement {
    const a = document.createElement("a");
    a.href = href;
    a.className = active
      ? "rounded-lg bg-brand-50 px-3 py-2.5 text-body-sm font-semibold text-brand-950"
      : "rounded-lg bg-transparent px-3 py-2.5 text-body-sm font-medium text-brand-500 hover:bg-brand-50";
    a.textContent = text;
    return a;
  }

  const eventos = navLink("Eventos", "/index.html#top", handlers.active === "eventos");

  const mapa = navLink("Mapa", "/mapa.html", handlers.active === "mapa");

  const conteudos = navLink("Conteúdos", "/conteudos.html", handlers.active === "conteudos");

  const comunidades = document.createElement("button");
  comunidades.type = "button";
  comunidades.className = "cursor-pointer rounded-lg bg-transparent px-3 py-2.5 text-body-sm font-medium text-brand-500 hover:bg-brand-50";
  comunidades.textContent = "Comunidades";
  if (handlers.onNavCommunities) {
    comunidades.addEventListener("click", handlers.onNavCommunities);
  } else {
    comunidades.addEventListener("click", () => {
      window.location.href = "/index.html#top";
    });
  }

  const submit = document.createElement("a");
  submit.href = "https://github.com/lays147/connecte-se/actions/workflows/add-event.yml";
  submit.target = "_blank";
  submit.rel = "noopener";
  submit.className = "rounded-lg px-3 py-2.5 text-body-sm font-medium text-brand-500 hover:bg-brand-50";
  submit.textContent = "Enviar evento";

  const divider = document.createElement("span");
  divider.className = "mx-2 hidden h-5.5 w-px bg-brand-100 sm:block";

  const github = document.createElement("a");
  github.href = "https://github.com/lays147/connecte-se";
  github.target = "_blank";
  github.rel = "noopener";
  github.title = "Ver o repositório no GitHub";
  github.setAttribute("aria-label", "Ver o repositório no GitHub");
  github.className =
    "inline-flex items-center gap-2 rounded-lg border border-brand-200 py-2 pl-2.5 pr-3 text-xs font-semibold text-brand-950 hover:border-brand-400";
  github.innerHTML = `${githubIconSvg()}GitHub`;

  nav.append(eventos, mapa, conteudos, comunidades, submit, divider, github);
  header.append(logo, nav);
  return header;
}
