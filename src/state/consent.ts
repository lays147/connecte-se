const GTAG_ID = "G-TSCP67XFVK";
const STORAGE_KEY = "cookie-consent";

export type ConsentChoice = "accepted" | "declined";

export function getStoredConsent(): ConsentChoice | null {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "accepted" || value === "declined" ? value : null;
}

type GtagWindow = typeof window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

function loadGtag(): void {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`;
  document.head.appendChild(script);

  const win = window as GtagWindow;
  win.dataLayer = win.dataLayer || [];
  // gtag.js looks for a global window.gtag to queue calls onto dataLayer, both
  // its own internal calls after it loads and any later calls from this app.
  win.gtag =
    win.gtag ||
    function gtag(...args: unknown[]): void {
      win.dataLayer!.push(args);
    };
  win.gtag("js", new Date());
  // GA4's Consent Mode defaults analytics_storage to "denied" for visitors in
  // regulated regions (incl. Brazil/LGPD) until told otherwise, which
  // silently drops every hit even after our own cookie banner is accepted.
  // Grant it explicitly here since acceptance already gated loadGtag().
  win.gtag("consent", "default", { analytics_storage: "denied" });
  win.gtag("consent", "update", { analytics_storage: "granted" });
  win.gtag("config", GTAG_ID);
}

export function applyStoredConsent(): void {
  if (getStoredConsent() === "accepted") loadGtag();
}

export function grantConsent(): void {
  localStorage.setItem(STORAGE_KEY, "accepted");
  loadGtag();
}

export function declineConsent(): void {
  localStorage.setItem(STORAGE_KEY, "declined");
}
