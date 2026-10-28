import { entries, modes } from "./entries.js";

export function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

// Whether every character of `query` appears in `key`, in order.
function inOrder(query, key) {
  let at = 0;
  for (const char of key) if (char === query[at]) at++;
  return at === query.length;
}

// The mode `text` is in: the longest name, with its space, that it starts with; or null.
export function modeOf(text, table = modes) {
  const lower = text.toLowerCase();
  return table.filter((mode) => lower.startsWith(mode.prefix)).sort((a, b) => b.prefix.length - a.prefix.length)[0] ?? null;
}

// The rows of the entry that best matches what was typed, then the app's Google row; or null for nothing typed.
// 3: the key itself; 2: the key starts with the input; 1: the input's characters appear in the key in order.
// Highest score wins; ties keep table order. `inMode`: a chip is showing, so only its rows come.
export function match(input, table = entries, inMode = false) {
  const query = normalize(input);
  if (!query) return null;
  let best = null, bestScore = 0;
  for (const entry of table) {
    for (const key of entry.keys) {
      const score = key === query ? 3 : key.startsWith(query) ? 2 : inOrder(query, key) ? 1 : 0;
      if (score > bestScore) [best, bestScore] = [entry, score];
    }
  }
  // In a chip only its own rows show; otherwise, like the app, "Search Google for …" always comes last.
  const mode = inMode && modeOf(input.trimStart());
  if (mode) return best && query.length > mode.prefix.trim().length ? best.rows : []; // the app would use the clipboard
  const google = { icon: "i-google", title: `Search Google for “${input.trim()}”`, subtitle: "Google", action: "Search", toast: "Searches Google" };
  return best ? [...best.rows, google] : [google];
}
