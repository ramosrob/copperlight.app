import { test } from "node:test";
import assert from "node:assert/strict";
import { entries } from "../entries.js";
import { match, normalize } from "../match.js";

const isFallback = (rows) => rows.length === 1 && rows[0].title.startsWith("Search Google for");

test("exact key wins", () => {
  assert.equal(match("saf")[0].title, "Safari");
});

test("prefix of a key", () => {
  assert.equal(match("sa")[0].title, "Safari");
});

test("case and spaces don't matter", () => {
  assert.equal(normalize("  25 USD   to EUR "), "25 usd to eur");
  assert.deepEqual(match("  25 USD   to EUR ").slice(0, -1), match("25 usd to eur").slice(0, -1)); // Google repeats it as typed
});

test("subsequence matches", () => {
  assert.equal(match("def ser")[0].title, "serendipity");
});

test("empty input is null", () => {
  assert.equal(match(""), null);
  assert.equal(match("   "), null);
});

test("unknown input falls back to Google", () => {
  const rows = match("hello world");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].title, "Search Google for “hello world”");
  assert.equal(rows[0].action, "Search");
});

test("fallback keeps the input verbatim", () => {
  const input = "<img src=x onerror=alert(1)>";
  assert.equal(match(input)[0].title, `Search Google for “${input}”`);
});

test("ties go to table order", () => {
  const first = entries.find((entry) => entry.keys.some((key) => key.startsWith("2")));
  assert.deepEqual(match("2").slice(0, -1), first.rows);
});

test("every result ends with the Google row, as the app does", () => {
  const rows = match("saf");
  assert.equal(rows.length, 2);
  assert.equal(rows.at(-1).title, "Search Google for “saf”");
  assert.equal(match("29.99 eur in usd").length, 2, "one currency row, then Google");
});

test("an answer is about what was typed", () => {
  assert.ok(!match("now in tokyo")[0].subtitle.includes("Lisbon"));
});

test("hero queries exist", () => {
  for (const query of ["29.99 eur in usd", "3pm lisbon in sf", "saf"]) {
    assert.ok(!isFallback(match(query)), query);
  }
});

test("only v0.1 features", () => {
  for (const key of entries.flatMap((entry) => entry.keys)) {
    assert.ok(![":git", ":gh", ":jira", ":claude"].some((prefix) => key.startsWith(prefix)), key);
    assert.ok(!["bluetooth", "dark mode"].includes(key), key);
  }
});

test("every row is complete", () => {
  for (const row of entries.flatMap((entry) => entry.rows)) {
    for (const field of ["icon", "title", "subtitle", "action", "toast"]) {
      assert.ok(typeof row[field] === "string" && row[field].length > 0, `${row.title}: ${field}`);
    }
  }
});
