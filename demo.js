// The page's moving parts: the live launcher in "Try it", the hero typing queries, and sections fading in.
import { match } from "./match.js";

const HERO_QUERIES = ["29.99 eur in usd", "3pm lisbon in sf", "saf", "20% of 150", "10 km in mi"];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(pointer: fine)");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function span(className, text = "") {
  const element = document.createElement("span");
  element.className = className;
  element.textContent = text;
  return element;
}

// A row's icon: a letter, or one of the drawn icons at the top of index.html ("i-…").
function rowIcon(name) {
  const holder = span("row__icon");
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
// an id, for the field's aria-activedescendant.
export function renderRows(container, rows, selected, idPrefix) {
  container.replaceChildren(...rows.map((row, index) => {
    const element = document.createElement("div");
    element.className = index === selected ? "row is-selected" : "row";
    element.setAttribute("role", "option");
    element.setAttribute("aria-selected", String(index === selected));
    if (idPrefix) element.id = `${idPrefix}-${index}`;
    const text = span("row__text");
    text.append(span("row__title", row.title), span("row__subtitle", row.subtitle));
    element.append(rowIcon(row.icon), text, span("row__action", `↵ ${row.action}`));
    return element;
  }));
}

export function initDemo(root) {
  const input = root.querySelector("[data-demo-input]");
  const results = root.querySelector("[data-demo-results]");
  const status = root.querySelector("[data-demo-status]");
  const toast = root.querySelector("[data-demo-toast]");
  const chips = [...root.querySelectorAll("[data-query]")];
  let rows = [], selected = 0, toastTimer, inView = false;

  // What a screen reader hears for a row: "Safari, Application, Open".
  const describe = (row) => `${row.title}, ${row.subtitle}, ${row.action}`;
  const render = () => {
    renderRows(results, rows, selected, "demo-option");
    input.setAttribute("aria-expanded", String(rows.length > 0));
    if (rows.length) input.setAttribute("aria-activedescendant", `demo-option-${selected}`);
    else input.removeAttribute("aria-activedescendant");
  };
  const show = () => {
    rows = match(input.value) ?? [];
    selected = 0;
    render();
    status.textContent = rows.length ? `${describe(rows[0])}. ${rows.length} results.` : "";
    for (const chip of chips) chip.classList.toggle("is-current", chip.dataset.query === input.value);
  };
  const select = (index) => {
    selected = (index + rows.length) % rows.length;
    render();
    status.textContent = describe(rows[selected]);
  };
  // Enter: say what the app would do.
  const run = () => {
    if (!rows.length) return;
    toast.textContent = rows[selected].toast;
    status.textContent = rows[selected].toast;
    toast.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-shown"), 1800);
  };

  input.addEventListener("input", show);
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (rows.length) select(selected + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      run();
    }
  });
  // Clicking a row leaves the keyboard in the field, so the arrows keep moving the selection.
  results.addEventListener("mousedown", (event) => event.preventDefault());
  results.addEventListener("click", (event) => {
    const row = event.target.closest(".row");
    if (!row) return;
    select([...results.children].indexOf(row));
    run();
  });
  for (const chip of chips) {
    chip.addEventListener("click", () => {
      input.value = chip.dataset.query;
      show();
      // With a mouse, typing can carry on from here; on a phone, focusing would pop up the keyboard.
      if (finePointer.matches) input.focus({ preventScroll: true });
    });
  }

  // While the demo is on screen and nothing else has focus, typing a letter types it here. The field never takes focus
  // on its own, so scrolling with the keyboard (Space, arrows) keeps working.
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0.4 }).observe(root);
  document.addEventListener("keydown", (event) => {
    if (!inView || document.activeElement !== document.body) return;
    if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1 || event.key === " ") return;
    input.focus({ preventScroll: true });
  });
}

// The hero's launcher types each query once, as the app would answer them, then comes back to the first and stays:
// moving content shouldn't go on forever. It waits while the hero is off screen. The first query is in the HTML, so
// nothing moves under reduced motion.
export function initHeroLoop(textEl, resultsEl, queries) {
  if (reducedMotion.matches) return;
  let onScreen = true;
  new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; }).observe(textEl);
  (async () => {
    for (const query of [...queries.slice(1), queries[0]]) {
      await wait(2800);
      while (!onScreen) await wait(400);
      resultsEl.classList.add("is-quiet");
      while (textEl.textContent) {
        textEl.textContent = textEl.textContent.slice(0, -1);
        await wait(24);
      }
      await wait(260);
      for (const char of query) {
        textEl.textContent += char;
        await wait(48 + Math.random() * 46);
      }
      await wait(160);
      renderRows(resultsEl, match(query), 0);
      resultsEl.classList.remove("is-quiet");
    }
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

const demo = document.querySelector("#try");
if (demo) initDemo(demo);
const heroText = document.querySelector("[data-hero-text]");
if (heroText) initHeroLoop(heroText, document.querySelector("[data-hero-results]"), HERO_QUERIES);
initReveal();
