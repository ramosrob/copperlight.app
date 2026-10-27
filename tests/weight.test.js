import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const file = (path) => new URL(`../${path}`, import.meta.url);

test("the page weighs under 300 KB", () => {
  const files = ["index.html", "styles.css", "demo.js", "match.js", "entries.js", "mark.svg", "favicon-32.png",
    "fonts/Geist-Variable.woff2", "fonts/GeistMono-Variable.woff2"];
  const total = files.reduce((sum, path) => sum + statSync(file(path)).size, 0);
  assert.ok(total < 300 * 1024, `${(total / 1024).toFixed(1)} KB`);
});

test("GitHub Pages serves it at copperlight.app", () => {
  assert.equal(readFileSync(file("CNAME"), "utf8").trim(), "copperlight.app");
});

test("icons are linked", () => {
  const html = readFileSync(file("index.html"), "utf8");
  assert.match(html, /<link rel="icon" href="favicon-32\.png" sizes="32x32" type="image\/png">/);
  assert.match(html, /<link rel="apple-touch-icon" href="apple-touch-icon\.png">/);
  for (const path of ["apple-touch-icon.png", "og.png", "LICENSE", "README.md"]) assert.ok(statSync(file(path)).size > 0, path);
});

test("GitHub Pages serves the files as they are, and the README says what launch needs", () => {
  assert.ok(statSync(file(".nojekyll")).isFile());
  const readme = readFileSync(file("README.md"), "utf8");
  assert.match(readme, /public/);
  assert.match(readme, /pre-release/);
});
