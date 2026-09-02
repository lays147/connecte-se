import "./style.css";
import { mountConsentBanner } from "./render/consentBanner";
import { renderFooter } from "./render/footer";
import { renderHeader } from "./render/header";
import { mountLayout } from "./render/layout";
import { createInitialContentState, renderContentPage, type ContentPageState } from "./render/contentPage";
import { FORMAT_ORDER, THEMES, type ContentFormat } from "./data/curatedContent";
import { applyStoredConsent } from "./state/consent";
import { readParams, writeParams } from "./state/urlState";

applyStoredConsent();
mountConsentBanner();

const params = readParams();
const defaults = createInitialContentState();
const formatParam = params.get("formato");
const themeParam = params.get("tema");
const validFormat = formatParam && FORMAT_ORDER.includes(formatParam as ContentFormat) ? (formatParam as ContentFormat) : null;
let state: ContentPageState = {
  query: params.get("busca") || defaults.query,
  format: validFormat ?? defaults.format,
  theme: themeParam && THEMES.includes(themeParam) ? themeParam : defaults.theme,
  groupBy: params.get("agrupar") === "tema" ? "tema" : defaults.groupBy,
};

function syncUrl(): void {
  writeParams({
    busca: state.query === defaults.query ? null : state.query,
    formato: state.format === defaults.format ? null : state.format,
    tema: state.theme === defaults.theme ? null : state.theme,
    agrupar: state.groupBy === defaults.groupBy ? null : state.groupBy,
  });
}

function render(): void {
  main.replaceChildren(
    renderContentPage(state, (next) => {
      state = next;
      syncUrl();
      render();
    }),
  );
}

const header = renderHeader({ active: "conteudos" });
const { shell, main } = mountLayout(header);

shell.appendChild(renderFooter());

render();
