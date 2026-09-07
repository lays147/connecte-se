import "./style.css";
import { loadAllEnrichedEvents } from "./data/allEvents";
import { mountConsentBanner } from "./render/consentBanner";
import { renderFooter } from "./render/footer";
import { renderHeader } from "./render/header";
import { mountLayout } from "./render/layout";
import { renderMapPage } from "./render/mapPage";
import { applyStoredConsent } from "./state/consent";
import { initTheme, onThemeChange } from "./state/theme";

initTheme();
applyStoredConsent();
mountConsentBanner();

const allEvents = loadAllEnrichedEvents();

const header = renderHeader({ active: "mapa" });
const { shell, main } = mountLayout(header);

// The map reads CSS custom properties into static D3 color scales at build
// time, so a theme change needs a fresh render rather than a CSS-only update.
function mountMap(): void {
  main.replaceChildren(renderMapPage(allEvents));
}

mountMap();
onThemeChange(mountMap);
shell.appendChild(renderFooter());
