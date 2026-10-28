import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const html = read("index.html");
const css = read("styles.css");

// The text a visitor sees: no comments, doctype, scripts, styles or tags.
const visibleText = (source) => source
  .replace(/<!--[\s\S]*?-->/g, " ").replace(/<!doctype[^>]*>/gi, " ")
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

function rootVars() {
  const root = css.match(/:root\s*{([^}]*)}/)[1];
  return Object.fromEntries([...root.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
}

// WCAG 2 contrast ratio between two #rrggbb colors.
function contrast(a, b) {
  const luminance = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test("contrast", () => {
  const v = rootVars();
  for (const [fg, bg] of [["--text", "--bg"], ["--text-2", "--bg"], ["--btn-text", "--btn-to"]]) {
    assert.ok(contrast(v[fg], v[bg]) >= 4.5, `${fg} on ${bg}: ${contrast(v[fg], v[bg]).toFixed(2)}`);
  }
});

test("no third-party requests", () => {
  assert.doesNotMatch(html, /<script[^>]+src="https?:/i);
  for (const link of html.match(/<link[^>]*>/gi) ?? []) {
    if (/rel="canonical"/.test(link)) continue;
    assert.doesNotMatch(link, /href="https?:/i, link);
  }
  assert.doesNotMatch(css, /@import/);
  assert.doesNotMatch(css, /url\(\s*["']?https?:/i);
});

test("head", () => {
  assert.match(html, /<html lang="en"/);
  assert.match(html, /<title>Copperlight: a free, open source Spotlight alternative for Mac<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+"/);
  assert.match(html, /<meta property="og:title" content="[^"]+"/);
  assert.match(html, /<meta property="og:description" content="[^"]+"/);
  assert.match(html, /<meta property="og:image" content="https:\/\/copperlight\.app\/og\.png"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
  assert.match(html, /<link rel="icon" href="mark\.svg"/);
  assert.match(html, /<meta name="viewport"/);
});

test("hero copy", () => {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1];
  const text = h1.replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  assert.equal(text, "A warmer light than Spotlight.");
  assert.match(h1, /<span class="copper">Spotlight<\/span>/);
});

test("reduced motion", () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("fonts preloaded", () => {
  for (const font of ["Geist-Variable.woff2", "GeistMono-Variable.woff2"]) {
    assert.match(html, new RegExp(`<link rel="preload" href="fonts/${font}" as="font" type="font/woff2" crossorigin>`), font);
  }
});

export { html, css, visibleText };

// Task 3: the rest of the page.

const URLS = {
  download: "https://github.com/ramosrob/copperlight/releases/latest/download/Copperlight.zip",
  source: "https://github.com/ramosrob/copperlight",
  readme: "https://github.com/ramosrob/copperlight#readme",
  sponsor: "https://github.com/sponsors/ramosrob",
  coffee: "https://buymeacoffee.com/ramosrob",
};
const LAUNCHERS = /raycast|alfred|launchbar/i;

test("sections in order", () => {
  const at = ['class="hero', 'id="try"', 'id="features"', 'id="principles"', 'id="download"', "<footer"].map((s) => html.indexOf(s));
  assert.ok(at.every((i) => i >= 0), `missing: ${at}`);
  assert.deepEqual([...at].sort((a, b) => a - b), at);
});

test("links", () => {
  for (const [name, url] of Object.entries(URLS)) assert.ok(html.includes(`href="${url}"`), name);
  assert.ok(html.split(`href="${URLS.download}"`).length - 1 >= 2, "download linked at least twice");
});

test("copy rules", () => {
  const text = visibleText(html);
  assert.doesNotMatch(text, LAUNCHERS);
  assert.doesNotMatch(text, /supercharge|blazing|revolutionary|unlock|seamless/i);
  // Commands in monospace (":!git status") are literal input, not copy.
  const prose = visibleText(html.replace(/<span class="mono">[\s\S]*?<\/span>/g, " ").replace(/<pre[\s\S]*?<\/pre>/g, " "));
  assert.ok(!prose.includes("!"), "no exclamation marks");
  assert.doesNotMatch(text, /\p{Emoji_Presentation}/u);
  assert.doesNotMatch(html, LAUNCHERS);
});

test("no features the app doesn't have", () => {
  const text = visibleText(html);
  for (const off of [":git diff", ":gh pr", ":jira", ":claude"]) assert.ok(!text.includes(off), off);
});

test("cmd space", () => {
  const block = html.match(/<aside[^>]*data-cmd-space[\s\S]*?<\/aside>/)?.[0];
  assert.ok(block, "a data-cmd-space block");
  const download = html.slice(html.indexOf('id="download"'));
  assert.ok(download.includes(block), "inside the download section");
  assert.ok(visibleText(block).includes("Want it on ⌘Space?"));
  assert.ok(visibleText(block).includes("Show Spotlight search"));
  const rest = visibleText(html.replace(block, ""));
  assert.ok(!/⌘\s*Space/.test(rest), "⌘Space only in its block");
  assert.ok(/⌥\s*Space/.test(rest), "⌥Space shown elsewhere");
});

test("chips match", async () => {
  const { entries } = await import("../entries.js");
  const keys = new Set(entries.flatMap((entry) => entry.keys));
  const chips = [...html.matchAll(/data-query="([^"]+)"/g)].map(([, q]) => q.replace(/&amp;/g, "&"));
  assert.ok(chips.length >= 6, "at least six chips");
  for (const chip of chips) assert.ok(keys.has(chip), chip);
});

// Task 4: behavior.

test("demo.js is safe and polite", () => {
  const js = read("demo.js");
  assert.doesNotMatch(js, /innerHTML|outerHTML|insertAdjacentHTML|document\.write/, "builds rows with textContent only");
  assert.ok(js.includes('matchMedia("(pointer: fine)")'), "auto-focus only with a fine pointer");
  assert.ok(js.includes('matchMedia("(prefers-reduced-motion: reduce)")'), "respects reduced motion");
  for (const call of js.match(/\.focus\([^)]*\)/g) ?? []) assert.equal(call, ".focus({ preventScroll: true })", call);
  assert.ok(js.includes('classList.add("reveals")'), "turns on fade-ins itself");
});

// Final review fixes.

test("no window layouts the app doesn't have", () => {
  assert.ok(!visibleText(html).includes("corner"));
});

test("icons are drawn, not fallback glyphs", async () => {
  const { entries } = await import("../entries.js");
  const symbols = new Set([...html.matchAll(/<symbol id="([^"]+)"/g)].map(([, id]) => id));
  for (const { icon } of entries.flatMap((entry) => entry.rows)) {
    assert.ok(/^[A-Z$€=]$/.test(icon) || symbols.has(icon), `icon ${icon}`);
  }
  for (const [, id] of html.matchAll(/<use href="#([^"]+)"/g)) assert.ok(symbols.has(id), `missing symbol ${id}`);
  assert.doesNotMatch(html + read("entries.js") + read("match.js"), /[◷⎘⌁▦◧▧▤✦⌕≈›]/u);
});

test("key combinations stay on one line, in a font that has ⌥ and ⌘", () => {
  assert.doesNotMatch(html, /(?<!<span class="keys">)<kbd>[⌥⌘]<\/kbd>/);
  assert.match(css, /kbd\s*{[^}]*font:[^;}]*system-ui/);
  assert.match(css, /\.keys\s*{[^}]*white-space:\s*nowrap/);
});

test("the demo is a combobox screen readers can follow", () => {
  const input = html.match(/<input[^>]*data-demo-input[^>]*>/)[0];
  for (const attr of ['role="combobox"', 'aria-expanded="false"', 'aria-controls="demo-results"', 'aria-autocomplete="list"']) assert.ok(input.includes(attr), attr);
  const js = read("demo.js");
  assert.ok(js.includes("aria-activedescendant"));
  assert.ok(!js.includes("aria-pressed"), "chips are not toggles");
});

test("chips come before the field, so results never push them around", () => {
  assert.ok(html.indexOf("data-demo-chips") < html.indexOf("data-demo-input"));
});

test("the hero points to the Open Anyway explanation", () => {
  const hero = html.slice(html.indexOf('class="hero'), html.indexOf('id="try"'));
  assert.ok(hero.includes('href="#download"'));
});

// Feedback after launch: text readers (search engines, link previews) saw "$$34.7929.99 Euros…".

test("result rows read as separate words in plain text", () => {
  const rows = html.match(/<div class="row[^"]*">[\s\S]*?<\/div>/g) ?? [];
  assert.ok(rows.length > 0);
  for (const row of rows) {
    assert.doesNotMatch(row, /<\/span><span/, "row parts need a space between them");
    assert.match(row, /class="row__icon" aria-hidden="true"/, "the icon is decoration");
  }
  const js = read("demo.js");
  assert.ok(js.includes('createTextNode(" ")'), "rendered rows get spaces too");
  assert.ok(js.includes('setAttribute("aria-hidden", "true")'));
});

test("the config example says which keys option+space is", () => {
  assert.match(html, /"option\+space"<\/span>\s*<span class="t-c"># ⌥Space<\/span>/);
});

test("v0.2's features are on the page and in the demo", () => {
  const text = visibleText(html);
  for (const phrase of ["System Settings", ":export pdf", "community script"]) assert.ok(text.includes(phrase), phrase);
  for (const chip of [":export pdf", "bluetooth"]) assert.ok(html.includes(`data-query="${chip}"`), chip);
});

test("v0.3's features are on the page and in the demo", () => {
  const text = visibleText(html);
  for (const phrase of [":play", ":mute", ":awake", "translations", "stock prices"]) assert.ok(text.includes(phrase), phrase);
  assert.ok(html.includes('data-query="translate bom dia"'));
  assert.ok(!/No modes/.test(text), "a name can be a chip now");
});

test("the built-in tools are listed, each with what to type and what it does", () => {
  const at = ['id="features"', 'id="tools"', 'id="principles"'].map((s) => html.indexOf(s));
  assert.ok(at[0] < at[1] && at[1] < at[2], "after the chapters, before the principles");
  const section = html.slice(at[1], at[2]);
  const tools = [...section.matchAll(/<div class="tool">\s*<dt>([^<]+)<\/dt>\s*<dd class="mono">([^<]+)<\/dd>\s*<dd>([^<]+)<\/dd>\s*<\/div>/g)];
  assert.ok(tools.length >= 12 && tools.length % 2 === 0, `an even list, two columns: ${tools.length}`);
  const commands = tools.map(([, , command]) => command);
  for (const command of ["clip", "pomo 50", "timer 10 min tea", "translate", "stock aapl", ":play", ":awake"]) assert.ok(commands.includes(command), command);
  assert.match(css, /\.tools__list\s*{/);
});

test("v0.4: the timer, on the page and in the demo", async () => {
  const text = visibleText(html);
  assert.ok(text.includes("Download Copperlight 0.5"));
  const day = html.slice(html.indexOf('<p class="kicker">Your day</p>'), html.indexOf("</article>", html.indexOf('<p class="kicker">Your day</p>')));
  assert.ok(visibleText(day).includes("timer"), "Your day mentions the timer");
  const { entries, modes } = await import("../entries.js");
  const keys = entries.flatMap((entry) => entry.keys);
  for (const key of ["timer 10 min tea", "pomo 25"]) assert.ok(keys.includes(key), key);
  assert.ok(modes.some((mode) => mode.prefix === "timer "));
});

test("chips have a chapter of their own, right after Find, and the chapters still alternate", () => {
  const chapters = [...html.matchAll(/<article class="chapter( chapter--flip)? reveal">([\s\S]*?)<\/article>/g)];
  const kickers = chapters.map(([, , body]) => body.match(/<p class="kicker">([^<]+)<\/p>/)[1]);
  assert.equal(kickers[1], "Chips");
  assert.deepEqual(chapters.map(([, flip]) => Boolean(flip)), chapters.map((_, i) => i % 2 === 1), "text and picture alternate");
  const chips = chapters[1][2];
  assert.ok(visibleText(chips).includes("Press Tab"));
  assert.match(chips, /<span class="bar__mode">Translate to German<\/span> <span class="bar__text">hello world<\/span>/);
});

test("the demo turns a name that takes text into a chip, as the app does", () => {
  const bar = html.match(/<label class="bar bar--input">[\s\S]*?<\/label>/)[0];
  assert.ok(bar.indexOf("data-demo-mode") < bar.indexOf("data-demo-input"), "the chip sits before the field");
  assert.match(bar, /<span class="bar__mode" data-demo-mode hidden><\/span>/);
  assert.match(css, /\.bar__mode\s*{/);
  const js = read("demo.js");
  assert.ok(js.includes('"Backspace"'), "Delete in the empty field turns the chip back into text");
  assert.ok(js.includes('"Tab"'), "Tab makes the chip");
  assert.ok(!/addEventListener\("input", \(\) => setMode/.test(js) && !js.includes("modeOf(query()) !== mode"), "typing never does");
});
