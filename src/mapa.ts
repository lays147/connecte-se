import "./style.css";
import { loadAllEnrichedEvents } from "./data/allEvents";
import { renderFooter } from "./render/footer";
import { renderHeader } from "./render/header";
import { mountLayout } from "./render/layout";
import { renderMapPage } from "./render/mapPage";

const allEvents = loadAllEnrichedEvents();

const header = renderHeader({ active: "mapa" });
const { shell, main } = mountLayout(header);

main.appendChild(renderMapPage(allEvents));
shell.appendChild(renderFooter());
