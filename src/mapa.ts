import "./style.css";
import { loadAllEnrichedEvents } from "./data/allEvents";
import { renderFooter } from "./render/footer";
import { renderHeader } from "./render/header";
import { renderMapPage } from "./render/mapPage";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app element not found");

const allEvents = loadAllEnrichedEvents();

const shell = document.createElement("div");
shell.className = "mx-auto w-full max-w-[1200px] bg-white px-4 sm:px-6 lg:px-8";

const header = renderHeader({ active: "mapa" });

shell.append(header, renderMapPage(allEvents), renderFooter());
app.appendChild(shell);
