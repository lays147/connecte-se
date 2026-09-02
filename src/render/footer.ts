const PIX_KEY = "124b511e-75a5-4656-a09c-ff0c70aed32e";

function logoMarkSvg(): string {
  return `<svg width="38" height="32" viewBox="0 0 120 100" aria-hidden="true">
    <g fill="none" stroke-linecap="round">
      <g stroke="oklch(0.72 0.13 292)" stroke-width="6.5"><path d="M14 68A22 26 0 0 1 58 68"></path><path d="M62 68A22 26 0 0 1 106 68"></path></g>
      <path d="M6 68h108" stroke="#fff" stroke-width="7.5"></path>
      <g stroke="#fff" stroke-width="5.5" opacity="0.85"><path d="M17 72v20M60 72v24M103 72v20"></path></g>
    </g>
  </svg>`;
}

function githubIconSvg(): string {
  return `<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.07-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A7.995 7.995 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path>
  </svg>`;
}

export function renderFooter(): HTMLElement {
  const footer = document.createElement("footer");
  footer.className = "flex flex-wrap items-start justify-between gap-x-8 gap-y-7 bg-brand-950 px-(--spacing-gutter) py-7";

  const brandCol = document.createElement("div");
  brandCol.className = "flex max-w-72.5 flex-1 basis-60 flex-col gap-2.5";

  const brandRow = document.createElement("div");
  brandRow.className = "flex items-center gap-2.5";
  const mark = document.createElement("span");
  mark.className = "flex shrink-0 items-center";
  mark.innerHTML = logoMarkSvg();
  const name = document.createElement("span");
  name.className = "font-display text-sm font-bold text-white";
  name.innerHTML = `Conecte-se <span class="text-brand-300">Brasil</span>`;
  brandRow.append(mark, name);

  const brandDesc = document.createElement("span");
  brandDesc.className = "text-xs leading-relaxed text-brand-200";
  brandDesc.textContent =
    "Lista aberta de eventos de tecnologia no Brasil, coletada automaticamente. Encontrou algo errado ou faltando? Abra uma issue no repositório.";

  brandCol.append(brandRow, brandDesc);

  const projectCol = document.createElement("div");
  projectCol.className = "flex flex-1 basis-auto flex-col gap-2";

  const projectHeading = document.createElement("span");
  projectHeading.className = "font-mono-label whitespace-nowrap text-label-xs font-semibold uppercase tracking-widest text-brand-300";
  projectHeading.textContent = "Projeto";

  const repoLink = document.createElement("a");
  repoLink.href = "https://github.com/lays147/connecte-se";
  repoLink.target = "_blank";
  repoLink.rel = "noopener";
  repoLink.className = "inline-flex items-center gap-1.5 whitespace-nowrap text-body-sm font-medium text-brand-100";
  repoLink.innerHTML = `${githubIconSvg()}lays147/connecte-se`;

  const submitEventLink = document.createElement("a");
  submitEventLink.href = "https://github.com/lays147/connecte-se/actions/workflows/add-event.yml";
  submitEventLink.target = "_blank";
  submitEventLink.rel = "noopener";
  submitEventLink.className = "text-body-sm font-medium text-brand-100";
  submitEventLink.textContent = "Enviar um evento";

  const addSourceLink = document.createElement("a");
  addSourceLink.href = "https://github.com/lays147/connecte-se/actions/workflows/add-source.yml";
  addSourceLink.target = "_blank";
  addSourceLink.rel = "noopener";
  addSourceLink.className = "text-body-sm font-medium text-brand-100";
  addSourceLink.textContent = "Cadastrar comunidade";

  const conteudosLink = document.createElement("a");
  conteudosLink.href = "/conteudos.html";
  conteudosLink.className = "text-body-sm font-medium text-brand-100";
  conteudosLink.textContent = "Conteúdos";

  projectCol.append(projectHeading, repoLink, submitEventLink, addSourceLink, conteudosLink);

  const pixCol = document.createElement("div");
  pixCol.className = "flex max-w-72.5 flex-1 basis-60 flex-col gap-2.5";

  const pixHeading = document.createElement("span");
  pixHeading.className = "font-mono-label text-label-xs font-semibold uppercase tracking-widest text-brand-300";
  pixHeading.textContent = "Apoie essa plataforma";

  const pixDesc = document.createElement("span");
  pixDesc.className = "text-xs leading-relaxed text-brand-200";
  pixDesc.textContent = "Faça um Pix e ajude a manter a lista no ar.";

  const pixBox = document.createElement("div");
  pixBox.className = "flex flex-col gap-1.5 rounded-card-11 border border-brand-800 bg-brand-900 px-3 py-2.5";

  const pixLabel = document.createElement("span");
  pixLabel.className = "font-mono-label text-label-2xs font-semibold uppercase tracking-widest text-brand-300";
  pixLabel.textContent = "Chave Pix aleatória";

  const pixRow = document.createElement("div");
  pixRow.className = "flex items-center gap-2";

  const pixCode = document.createElement("code");
  pixCode.className = "min-w-0 flex-1 break-all font-mono-label text-label-sm leading-relaxed text-white";
  pixCode.textContent = PIX_KEY;

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className =
    "shrink-0 cursor-pointer rounded-lg border-0 bg-modality-online-bg px-2.5 py-2 text-xs font-semibold text-brand-950";
  copyBtn.textContent = "Copiar";
  copyBtn.addEventListener("click", () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(PIX_KEY).catch(() => {});
    }
    copyBtn.textContent = "Copiada";
    setTimeout(() => {
      copyBtn.textContent = "Copiar";
    }, 2000);
  });

  pixRow.append(pixCode, copyBtn);
  pixBox.append(pixLabel, pixRow);
  pixCol.append(pixHeading, pixDesc, pixBox);

  const contactCol = document.createElement("div");
  contactCol.className = "flex flex-1 basis-auto flex-col gap-2";

  const contactHeading = document.createElement("span");
  contactHeading.className = "font-mono-label text-label-xs font-semibold uppercase tracking-widest text-brand-300";
  contactHeading.textContent = "Contato";

  const mailLink = document.createElement("a");
  mailLink.href = "mailto:lays@lays147.dev.br";
  mailLink.className = "text-body-sm font-medium text-brand-100";
  mailLink.textContent = "lays@lays147.dev.br";

  const copyright = document.createElement("span");
  copyright.className = "text-xs leading-relaxed text-brand-300";
  copyright.textContent = "© 2026 Lays Rodrigues. Todos os direitos reservados.";

  contactCol.append(contactHeading, mailLink, copyright);

  footer.append(brandCol, projectCol, pixCol, contactCol);
  return footer;
}
