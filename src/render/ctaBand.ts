function githubIconSvg(): string {
  return `<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.07-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A7.995 7.995 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path>
  </svg>`;
}

export function renderCtaBand(): HTMLElement {
  const band = document.createElement("div");
  band.className =
    "flex flex-col items-start gap-6 border-t border-brand-100 bg-brand-50/60 px-6 py-6 md:flex-row md:items-center md:justify-between md:gap-8";

  const textCol = document.createElement("div");
  textCol.className = "flex max-w-full flex-col gap-1.5 md:max-w-115";

  const title = document.createElement("h4");
  title.className = "font-display text-heading-md font-bold leading-tight tracking-tight text-brand-950";
  title.textContent = "Não encontrou seu evento?";

  const desc = document.createElement("span");
  desc.className = "text-body-sm leading-relaxed text-brand-600";
  desc.textContent =
    "Submeta pelo GitHub: um evento único entra direto na lista, uma comunidade entra no scraper e passa a ser coletada automaticamente.";

  textCol.append(title, desc);

  const actions = document.createElement("div");
  actions.className = "flex shrink-0 flex-wrap items-center gap-2.5";

  const submitEvent = document.createElement("a");
  submitEvent.href = "https://github.com/lays147/connecte-se/actions/workflows/add-event.yml";
  submitEvent.target = "_blank";
  submitEvent.rel = "noopener";
  submitEvent.className =
    "inline-flex items-center gap-2 whitespace-nowrap rounded-card-10 bg-brand-700 px-4 py-3 text-body-sm font-semibold text-white";
  submitEvent.innerHTML = `${githubIconSvg()}Enviar um evento`;

  const addSource = document.createElement("a");
  addSource.href = "https://github.com/lays147/connecte-se/actions/workflows/add-source.yml";
  addSource.target = "_blank";
  addSource.rel = "noopener";
  addSource.className =
    "inline-flex items-center gap-2 whitespace-nowrap rounded-card-10 border border-brand-200 bg-white px-4 py-3 text-body-sm font-semibold text-brand-700 hover:border-brand-400";
  addSource.innerHTML = `${githubIconSvg()}Cadastrar comunidade`;

  actions.append(submitEvent, addSource);
  band.append(textCol, actions);
  return band;
}
