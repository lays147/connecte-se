export interface PageLayout {
  shell: HTMLElement;
  main: HTMLElement;
}

export function mountLayout(header: HTMLElement, opts?: { padded?: boolean }): PageLayout {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) throw new Error("#app element not found");

  const shell = document.createElement("div");
  shell.className = opts?.padded
    ? "mx-auto w-full max-w-shell bg-white px-4 sm:px-6 lg:px-8"
    : "mx-auto w-full max-w-shell bg-white";

  const main = document.createElement("div");

  shell.append(header, main);
  app.appendChild(shell);

  return { shell, main };
}
