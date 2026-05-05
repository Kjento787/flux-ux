// Shared category routing for Discord webhooks.
// TMDB genre IDs: 28 = Action (movie), 10759 = Action & Adventure (TV), 35 = Comedy.
// KR origin/Korean language => K-Drama.

export type CategoryKey = "kdrama" | "action" | "comedy";

export function getCategoryWebhooks(opts: {
  genreIds?: number[];
  originCountries?: string[];
  originalLanguage?: string;
}): { key: CategoryKey; url: string; label: string; emoji: string; color: number }[] {
  const { genreIds = [], originCountries = [], originalLanguage } = opts;
  const matched: { key: CategoryKey; url: string; label: string; emoji: string; color: number }[] = [];

  const isKDrama =
    originalLanguage === "ko" || originCountries.includes("KR");
  const isAction = genreIds.includes(28) || genreIds.includes(10759);
  const isComedy = genreIds.includes(35);

  const kdrama = Deno.env.get("DISCORD_WEBHOOK_KDRAMA");
  const action = Deno.env.get("DISCORD_WEBHOOK_ACTION");
  const comedy = Deno.env.get("DISCORD_WEBHOOK_COMEDY");

  if (isKDrama && kdrama)
    matched.push({ key: "kdrama", url: kdrama, label: "K-Drama", emoji: "🇰🇷", color: 0xec4899 });
  if (isAction && action)
    matched.push({ key: "action", url: action, label: "Action", emoji: "💥", color: 0xef4444 });
  if (isComedy && comedy)
    matched.push({ key: "comedy", url: comedy, label: "Comedy", emoji: "😂", color: 0xfacc15 });

  return matched;
}

export async function postToWebhooks(urls: string[], payload: unknown) {
  const results = await Promise.allSettled(
    urls.map((url) =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    )
  );
  return results.filter((r) => r.status === "fulfilled" && (r.value as Response).ok).length;
}
