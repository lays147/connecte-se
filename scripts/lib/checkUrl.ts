const TIMEOUT_MS = 15000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; tech-brazil-source-check/1.0; +https://github.com/lays147/connecte-se)";

export interface UrlCheckResult {
  ok: boolean;
  status?: number;
  error?: string;
}

export async function checkUrl(url: string): Promise<UrlCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });

    if (response.status === 405 || response.status === 403) {
      // Some sites block HEAD-like/unfamiliar requests; a plain GET with a
      // browser UA is enough to know whether the page genuinely exists.
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
        },
      });
    }

    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}
