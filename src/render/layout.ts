export interface PageLayout {
  shell: HTMLElement;
  main: HTMLElement;
}

export function mountLayout(header: HTMLElement): PageLayout {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) throw new Error("#app element not found");

  const shell = document.createElement("div");
  shell.className = "min-h-screen w-full bg-white";

  const main = document.createElement("div");

  shell.append(header, main);
  app.appendChild(shell);

  return { shell, main };
}
