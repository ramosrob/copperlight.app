// The page's moving parts: the hero's live launcher, which tours its examples until you type, and sections fading in.
import { match, modeOf } from "./match.js";
import { modes } from "./entries.js";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(pointer: fine)");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function span(className, text = "") {
  const element = document.createElement("span");
  element.className = className;
  element.textContent = text;
  return element;
}

// A row's icon: a letter, a color's swatch ("#c87533"), or one of the drawn icons at the top of index.html ("i-…").
function rowIcon(name) {
  const holder = span("row__icon");
  holder.setAttribute("aria-hidden", "true"); // decoration: the title says it
  if (name.startsWith("#")) {
    const swatch = span("row__swatch");
    swatch.style.background = name; // from entries.js, never from what's typed
    holder.append(swatch);
    return holder;
  }
  if (!name.startsWith("i-")) {
    holder.textContent = name;
    return holder;
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  svg.setAttribute("aria-hidden", "true");
  use.setAttribute("href", `#${name}`);
  svg.append(use);
  holder.append(svg);
  return holder;
}

// Rows are built from text only, so whatever a visitor types is never read as HTML. With an id prefix, each row gets
// an id, for the field's aria-activedescendant. Only the rows are replaced: the demo's wash stays, to slide.
export function renderRows(container, rows, selected, idPrefix) {
  container.querySelectorAll(":scope > .row").forEach((row) => row.remove());
  container.append(...rows.map((row, index) => {
    const element = document.createElement("div");
    element.className = index === selected ? "row is-selected" : "row";
    element.setAttribute("role", "option");
    element.setAttribute("aria-selected", String(index === selected));
    if (idPrefix) element.id = `${idPrefix}-${index}`;
    const text = span("row__text");
    // Spaces between the parts, so the row reads as words in plain text too (screen readers, copy, crawlers).
    const space = () => document.createTextNode(" ");
    text.append(span("row__title", row.title), space(), span("row__subtitle", row.subtitle));
    element.append(rowIcon(row.icon), space(), text, space(), span("row__action", `↵ ${row.action}`));
    return element;
  }));
}

// The hero's launcher, live: type, or pick an example. Most queries answer in rows; one that reads better big shows its
// card instead (the app's own, rendered), as answers do in the app. Until you type or pick, it tours the examples once,
// typing each as the app would (the last one selected and typed over, a name that takes text becoming its chip, as Tab
// makes it), then the first stays: moving content shouldn't go on forever. It moves as the app does: the rows change
// as it types, the card glides to them, the selection slides from row to row. It waits while off screen or under the pointer. Under reduced motion
// nothing types or tours, and the examples still show each one.
const ANSWER_HOLD = 3600;
export function initDemo(root) {
  const input = root.querySelector("[data-demo-input]");
  const modeChip = root.querySelector("[data-demo-mode]");
  const placeholder = input.placeholder;
  const results = root.querySelector("[data-demo-results]");
  const stack = root.querySelector("[data-answers-cards]");
  const status = root.querySelector("[data-demo-status]");
  const wash = span("wash"); // the selected row's, one for the list so it slides
  wash.setAttribute("aria-hidden", "true");
  results.prepend(wash);
  const toast = root.querySelector("[data-demo-toast]");
  const chips = [...root.querySelectorAll("[data-query]")];
  const cards = [...root.querySelectorAll("[data-answer]")];
  let rows = [], selected = 0, toastTimer, inView = false, mode = null, card = null;
  let touring = !reducedMotion.matches, taken = false, held = false, run = 0;
  root.style.setProperty("--hold", `${ANSWER_HOLD}ms`);
  root.classList.add("is-live");
  root.classList.toggle("is-touring", touring);

  // What's typed, the chip's name included: "translate bom dia".
  const query = () => (mode ? mode.prefix : "") + input.value;
  // Tab, or an example: the name `text` starts with turns into the chip, and the field keeps what follows. Typing never
  // does it, as in the app: "stock apple" may be a file's name.
  const setMode = (text) => {
    mode = modeOf(text);
    input.value = mode ? text.slice(mode.prefix.length).trimStart() : text;
    modeChip.textContent = mode ? mode.title : "";
    modeChip.hidden = !mode;
    input.placeholder = mode ? mode.hint : placeholder;
  };
  // The card for what's typed, if it has one: the same words, in the chip its answer needs ("stock aapl" typed without
  // Tab is the start of a file's name, and gets rows). Nothing typed shows the next meeting, as the app opens.
  const cardFor = (typed) => cards.find((c) => c.dataset.answer === typed.trim().toLowerCase() && modeOf(c.dataset.answer) === mode) ?? null;

  // What a screen reader hears for a row: "Safari, Application, Open".
  const describe = (row) => `${row.title}, ${row.subtitle}, ${row.action}`;
  const render = () => {
    const from = results.offsetHeight; // mid-glide, where it is now
    renderRows(results, rows, selected, "demo-option");
    results.classList.toggle("is-empty", !rows.length);
    // The card glides from its height to its rows', which are already there; from nothing it fades in (the CSS).
    results.style.height = "";
    const to = results.offsetHeight;
    if (from && to && from !== to) {
      results.style.height = `${from}px`;
      void results.offsetHeight; // the glide starts here
      results.style.height = `${to}px`;
    }
    const row = results.querySelectorAll(":scope > .row")[selected];
    if (row) wash.style.cssText = `transform: translateY(${row.offsetTop}px); height: ${row.offsetHeight}px`;
    input.setAttribute("aria-expanded", String(rows.length > 0));
    if (rows.length) input.setAttribute("aria-activedescendant", `demo-option-${selected}`);
    else input.removeAttribute("aria-activedescendant");
  };
  const fit = () => { stack.style.height = card ? `${card.offsetHeight}px` : "0px"; };
  const show = () => {
    card = cardFor(query());
    rows = card ? [] : match(query(), undefined, Boolean(mode)) ?? [];
    selected = 0;
    render();
    cards.forEach((c) => {
      c.classList.toggle("is-current", c === card);
      c.setAttribute("aria-hidden", String(c !== card));
    });
    fit();
    status.textContent = card ? card.querySelector("img").alt : rows.length ? `${describe(rows[0])}. ${rows.length} results.` : "";
    for (const button of chips) {
      const current = button.dataset.query === query();
      button.classList.toggle("is-current", current);
      button.setAttribute("aria-current", String(current));
      // In a row that scrolls sideways (a phone's), the example showing comes into view, without moving the page.
      const strip = button.parentElement;
      if (current && strip.scrollWidth > strip.clientWidth) {
        strip.scrollTo({ left: button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2, behavior: reducedMotion.matches ? "auto" : "smooth" });
      }
    }
  };
  const select = (index) => {
    selected = (index + rows.length) % rows.length;
    render();
    status.textContent = describe(rows[selected]);
  };
  // Enter: say what the app would do.
  const perform = () => {
    if (!rows.length) return;
    toast.textContent = rows[selected].toast;
    status.textContent = rows[selected].toast;
    toast.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-shown"), 1800);
  };
  const stop = () => {
    touring = false;
    run++; // ends the typing under way
    root.classList.remove("is-touring");
  };

  input.addEventListener("input", show);
  // The first time it's yours, the field empties for you to type, the tour's query gone.
  input.addEventListener("focus", () => {
    stop();
    if (taken) return;
    taken = true;
    setMode("");
    show();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (rows.length) select(selected + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      perform();
    } else if (event.key === "Tab" && !mode) {
      // The name typed (with or without its space) becomes the chip. Nothing to make one of: Tab moves on as usual.
      const lower = query().toLowerCase();
      const name = modeOf(lower)?.prefix ?? modes.map((m) => m.prefix).filter((prefix) => lower && prefix.startsWith(lower)).sort((a, b) => a.length - b.length)
        .find((prefix, _, names) => names.every((other) => other.startsWith(prefix)));
      if (!name) return;
      event.preventDefault();
      setMode(lower.startsWith(name) ? query() : name);
      show();
    } else if (event.key === "Backspace" && mode && !input.value) {
      // Delete in the empty field after a chip: the chip turns back into its name, as if the space was deleted.
      event.preventDefault();
      setMode(mode.prefix.slice(0, -1));
      show();
    }
  });
  // Clicking a row leaves the keyboard in the field, so the arrows keep moving the selection.
  results.addEventListener("mousedown", (event) => event.preventDefault());
  results.addEventListener("click", (event) => {
    const row = event.target.closest(".row");
    if (!row) return;
    select([...results.children].indexOf(row));
    perform();
  });
  for (const button of chips) {
    button.addEventListener("click", () => {
      stop();
      taken = true;
      setMode(button.dataset.query);
      show();
      // With a mouse, typing can carry on from here; on a phone, focusing would pop up the keyboard.
      if (finePointer.matches) input.focus({ preventScroll: true });
    });
  }

  // Types `text` as someone would: what's there is selected, as ⌘A does, and the first letter types over it; the rows
  // follow each letter. False if it was stopped on the way.
  const measure = document.createElement("canvas").getContext("2d");
  async function type(text) {
    const mine = ++run;
    if (input.value) {
      measure.font = getComputedStyle(input).font;
      root.style.setProperty("--selected", `${Math.min(measure.measureText(input.value).width, input.clientWidth)}px`);
      root.classList.add("is-selecting");
      await wait(380);
      root.classList.remove("is-selecting");
      if (mine !== run) return false;
    }
    if (!text) { setMode(""); show(); } // ⌥ Space: the empty launcher
    for (let end = 1; end <= text.length; end++) {
      setMode(text.slice(0, end));
      show();
      await wait(48 + Math.random() * 46);
      if (mine !== run) return false;
    }
    return true;
  }
  // Waits ANSWER_HOLD, counting only while it's on screen and not under the pointer.
  async function hold() {
    for (let left = ANSWER_HOLD; left > 0; ) {
      await wait(100);
      if (inView && !held) left -= 100;
    }
  }
  const pause = () => root.classList.toggle("is-paused", !inView || held);

  // While the demo is on screen and nothing else has focus, typing a letter types it here. The field never takes focus
  // on its own, so scrolling with the keyboard (Space, arrows) keeps working.
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; pause(); }, { threshold: 0.4 }).observe(root);
  document.addEventListener("keydown", (event) => {
    if (!inView || document.activeElement !== document.body) return;
    if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1 || event.key === " ") return;
    input.focus({ preventScroll: true });
  });
  root.addEventListener("pointerenter", () => { held = true; pause(); });
  root.addEventListener("pointerleave", () => { held = false; pause(); });
  addEventListener("resize", fit);

  setMode(chips[0].dataset.query);
  show();
  if (!touring) return;
  (async () => {
    for (const chip of [...chips.slice(1), chips[0]]) {
      await hold();
      if (!touring || !(await type(chip.dataset.query))) return;
    }
    stop();
  })();
}

// Sections fade in as they arrive. The hiding class is set here, so nothing hides if this never runs.
export function initReveal() {
  if (reducedMotion.matches || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("reveals");
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px" });
  for (const section of document.querySelectorAll(".reveal")) observer.observe(section);
}

const demo = document.querySelector("[data-demo]");
if (demo) initDemo(demo);
initReveal();
