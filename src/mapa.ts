import "./style.css";
import { loadAllEnrichedEvents } from "./data/allEvents";
import { mountConsentBanner } from "./render/consentBanner";
import { renderFooter } from "./render/footer";
import { renderHeader } from "./render/header";
import { mountLayout } from "./render/layout";
import { renderMapPage } from "./render/mapPage";
import { applyStoredConsent } from "./state/consent";

applyStoredConsent();
mountConsentBanner();

const allEvents = loadAllEnrichedEvents();

const header = renderHeader({ active: "mapa" });
const { shell, main } = mountLayout(header);

main.appendChild(renderMapPage(allEvents));
shell.appendChild(renderFooter());
