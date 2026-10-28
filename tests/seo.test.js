import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { visibleText } from "./page.test.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const SITE = "https://copperlight.app";
// Every page search engines should find, with its address. The sitemap lists exactly these.
const PAGES = [
  { path: "index.html", url: `${SITE}/` },
  { path: "spotlight-alternative/index.html", url: `${SITE}/spotlight-alternative/` },
  { path: "raycast-alternative/index.html", url: `${SITE}/raycast-alternative/` },
  { path: "alfred-alternative/index.html", url: `${SITE}/alfred-alternative/` },
];
const COMPARISONS = PAGES.slice(1);
const DOWNLOAD = "https://github.com/ramosrob/copperlight/releases/latest/download/Copperlight.zip";

const meta = (html, attr, name) => html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1];
const jsonLD = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json)).flatMap((data) => data["@graph"] ?? [data]);
const words = (text) => text.replace(/\s+/g, " ").trim();

for (const { path, url } of PAGES) {
  test(`${path}: title, description, canonical and one h1`, () => {
    const html = read(path);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title && title.length <= 65, `title of ${title?.length} characters: ${title}`);
    const description = meta(html, "name", "description");
    assert.ok(description && description.length >= 110 && description.length <= 160, `description of ${description?.length}: ${description}`);
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`), "canonical");
    assert.equal(meta(html, "property", "og:url"), url);
    assert.ok(meta(html, "property", "og:title") && meta(html, "property", "og:description"));
    assert.equal(meta(html, "property", "og:image"), `${SITE}/og.png`);
    assert.equal(html.match(/<h1[\s>]/g)?.length, 1, "one h1");
    assert.match(html, /<html lang="en"/);
  });

  test(`${path}: structured data parses, and nothing loads from elsewhere`, () => {
    const html = read(path);
    assert.ok(jsonLD(html).length > 0, "has JSON-LD");
    assert.doesNotMatch(html, /<script[^>]+src="https?:/i);
    for (const link of html.match(/<link[^>]*rel="(stylesheet|preload|icon)"[^>]*>/gi) ?? []) assert.doesNotMatch(link, /href="https?:/i, link);
  });

  test(`${path}: links inside the site lead somewhere`, () => {
    for (const [, href] of read(path).matchAll(/href="(\/[^"#]*)(?:#[^"]*)?"/g)) {
      if (href.startsWith("//")) continue;
      const file = href.endsWith("/") ? `${href}index.html` : href;
      assert.ok(existsSync(new URL(`..${file}`, import.meta.url)), `${path} links to ${href}`);
    }
  });
}

test("the homepage describes the app to search engines, at the version it offers", () => {
  const html = read("index.html");
  const app = jsonLD(html).find((item) => item["@type"] === "SoftwareApplication");
  assert.ok(app, "a SoftwareApplication");
  const version = visibleText(html).match(/Download Copperlight ([\d.]+)/)[1];
  assert.equal(app.softwareVersion, version);
  assert.equal(app.downloadUrl, DOWNLOAD);
  assert.equal(app.operatingSystem, "macOS 15 or later");
  assert.equal(app.offers.price, "0");
  assert.ok(!("aggregateRating" in app) && !("review" in app), "no ratings nobody gave");
});

test("every FAQ in structured data is on the page, word for word", () => {
  for (const { path } of PAGES) {
    const html = read(path);
    const faq = jsonLD(html).find((item) => item["@type"] === "FAQPage");
    assert.ok(faq, `${path}: an FAQPage`);
    const text = words(visibleText(html));
    for (const { name, acceptedAnswer } of faq.mainEntity) {
      assert.ok(text.includes(words(name)), `${path}: question on the page: ${name}`);
      assert.ok(text.includes(words(acceptedAnswer.text)), `${path}: answer on the page: ${acceptedAnswer.text}`);
    }
  }
});

test("comparison pages: breadcrumbs, the download, a way home, no prices, no hype", () => {
  for (const { path, url } of COMPARISONS) {
    const html = read(path);
    const crumbs = jsonLD(html).find((item) => item["@type"] === "BreadcrumbList");
    assert.deepEqual(crumbs?.itemListElement.map((item) => item.item), [`${SITE}/`, url], `${path}: breadcrumbs`);
    assert.ok(html.includes(`href="${DOWNLOAD}"`), `${path}: download`);
    assert.ok(html.includes('href="/"'), `${path}: home`);
    const text = visibleText(html);
    assert.doesNotMatch(text, /[$€£]\s?\d|per month|per year|\/mo\b|subscription|pricing/i, `${path}: no prices`);
    assert.doesNotMatch(text, /supercharge|blazing|revolutionary|unlock|seamless|bloated|spyware/i, `${path}: no hype, no digs`);
    const prose = visibleText(html.replace(/<span class="mono">[\s\S]*?<\/span>/g, " ").replace(/<pre[\s\S]*?<\/pre>/g, " "));
    assert.ok(!prose.includes("!"), `${path}: no exclamation marks`);
  }
});

test("the homepage leads to the comparisons, and they lead to each other", () => {
  assert.ok(read("index.html").includes('href="/spotlight-alternative/"'));
  const hub = read("spotlight-alternative/index.html");
  for (const page of ["/raycast-alternative/", "/alfred-alternative/"]) assert.ok(hub.includes(`href="${page}"`), page);
  for (const { path } of COMPARISONS.slice(1)) assert.ok(read(path).includes('href="/spotlight-alternative/"'), path);
});

test("the sitemap lists every page, and robots.txt points to it", () => {
  const urls = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);
  assert.deepEqual(urls.sort(), PAGES.map((page) => page.url).sort());
  const robots = read("robots.txt");
  assert.match(robots, /^User-agent: \*$/m);
  assert.doesNotMatch(robots, /^Disallow: \/\s*$/m);
  assert.match(robots, new RegExp(`^Sitemap: ${SITE}/sitemap\\.xml$`, "m"));
});

test("a 404 page that isn't indexed and leads home", () => {
  const html = read("404.html");
  assert.match(html, /<meta name="robots" content="noindex">/);
  assert.ok(html.includes('href="/"'));
  assert.ok(html.includes('href="/styles.css"'), "absolute paths: it's served at any address");
});
