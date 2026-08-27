import "./style.css";
import { renderFooter } from "./render/footer";
import { renderHeader } from "./render/header";
import { createInitialContentState, renderContentPage } from "./render/contentPage";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app element not found");

const shell = document.createElement("div");
shell.className = "mx-auto w-full max-w-[1200px] bg-white";

const dynamicRoot = document.createElement("div");

let state = createInitialContentState();

function render(): void {
  dynamicRoot.replaceChildren(
    renderContentPage(state, (next) => {
      state = next;
      render();
    }),
  );
}

const header = renderHeader({ active: "conteudos" });

shell.append(header, dynamicRoot, renderFooter());
app.appendChild(shell);

render();
