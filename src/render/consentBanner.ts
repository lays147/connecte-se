import { declineConsent, getStoredConsent, grantConsent } from "../state/consent";

export function mountConsentBanner(): void {
  if (getStoredConsent() !== null) return;

  const banner = document.createElement("div");
  banner.className =
    "fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 bg-brand-950 px-(--spacing-gutter) py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.15)]";

  function reserveSpace(): void {
    document.body.style.paddingBottom = `${banner.getBoundingClientRect().height}px`;
  }

  function releaseSpace(): void {
    document.body.style.paddingBottom = "";
  }

  const text = document.createElement("p");
  text.className = "max-w-2xl flex-1 basis-60 text-xs leading-relaxed text-brand-200";
  text.textContent =
    "Usamos cookies de análise para entender como o site é usado e melhorar a experiência. Você pode aceitar ou recusar.";

  const actions = document.createElement("div");
  actions.className = "flex shrink-0 items-center gap-2.5";

  const declineBtn = document.createElement("button");
  declineBtn.type = "button";
  declineBtn.className = "cursor-pointer rounded-lg border border-brand-800 bg-transparent px-3.5 py-2 text-xs font-semibold text-brand-100";
  declineBtn.textContent = "Recusar";

  const acceptBtn = document.createElement("button");
  acceptBtn.type = "button";
  acceptBtn.className =
    "cursor-pointer rounded-lg border-0 bg-modality-online-bg px-3.5 py-2 text-xs font-semibold text-brand-950";
  acceptBtn.textContent = "Aceitar";

  function dismiss(): void {
    releaseSpace();
    window.removeEventListener("resize", reserveSpace);
    banner.remove();
  }

  declineBtn.addEventListener("click", () => {
    declineConsent();
    dismiss();
  });

  acceptBtn.addEventListener("click", () => {
    grantConsent();
    dismiss();
  });

  actions.append(declineBtn, acceptBtn);
  banner.append(text, actions);
  document.body.appendChild(banner);

  reserveSpace();
  window.addEventListener("resize", reserveSpace);
}
