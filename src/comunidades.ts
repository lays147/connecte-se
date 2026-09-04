import "./style.css";
import { mountConsentBanner } from "./render/consentBanner";
import { renderFooter } from "./render/footer";
import { renderHeader } from "./render/header";
import { mountLayout } from "./render/layout";
import {
  createInitialCommunitiesState,
  renderCommunitiesPage,
  type CommunitiesPageState,
} from "./render/communitiesPage";
import type { SourceType } from "./data/communitiesList";
import { applyStoredConsent } from "./state/consent";
import { readParams, writeParams } from "./state/urlState";

applyStoredConsent();
mountConsentBanner();

const params = readParams();
const defaults = createInitialCommunitiesState();
const typeParam = params.get("tipo");
const validType: SourceType | "todos" | null =
  typeParam === "community" || typeParam === "event" ? typeParam : null;
let state: CommunitiesPageState = {
  query: params.get("busca") || defaults.query,
  type: validType ?? defaults.type,
};

function syncUrl(): void {
  writeParams({
    busca: state.query === defaults.query ? null : state.query,
    tipo: state.type === defaults.type ? null : state.type,
  });
}

function render(): void {
  main.replaceChildren(
    renderCommunitiesPage(state, (next) => {
      state = next;
      syncUrl();
      render();
    }),
  );
}

const header = renderHeader({ active: "comunidades" });
const { shell, main } = mountLayout(header);

shell.appendChild(renderFooter());

render();
