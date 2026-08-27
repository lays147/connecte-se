import "./style.css";
import { renderFooter } from "./render/footer";
import { renderHeader } from "./render/header";
import { mountLayout } from "./render/layout";
import { createInitialContentState, renderContentPage } from "./render/contentPage";

let state = createInitialContentState();

function render(): void {
  main.replaceChildren(
    renderContentPage(state, (next) => {
      state = next;
      render();
    }),
  );
}

const header = renderHeader({ active: "conteudos" });
const { shell, main } = mountLayout(header);

shell.appendChild(renderFooter());

render();
