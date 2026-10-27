// What the in-page demo knows: real Copperlight queries, each with the rows the app would show (the first is
// selected; match() adds the app's "Search Google for …" row last). An icon is a letter or a symbol id in index.html.
// Values like rates and times are illustrative; the page makes no network requests.
export const entries = [
  {
    keys: ["safari", "saf"],
    rows: [{ icon: "S", title: "Safari", subtitle: "Application", action: "Open", toast: "Opens Safari" }],
  },
  {
    keys: ["invoice"],
    rows: [
      { icon: "i-file", title: "invoice-march.pdf", subtitle: "~/Documents", action: "Open", toast: "Opens invoice-march.pdf" },
      { icon: "i-file", title: "invoice-february.pdf", subtitle: "~/Documents", action: "Open", toast: "Opens invoice-february.pdf" },
    ],
  },
  {
    keys: ["150 + 20%"],
    rows: [{ icon: "=", title: "180", subtitle: "150 + 20%", action: "Copy", toast: "Copied 180" }],
  },
  {
    keys: ["20% of 150"],
    rows: [{ icon: "=", title: "30", subtitle: "20% of 150", action: "Copy", toast: "Copied 30" }],
  },
  {
    keys: ["25 usd to eur", "25 usd"],
    rows: [{ icon: "€", title: "€21.55", subtitle: "25 US Dollars in Euros", action: "Copy", toast: "Copied €21.55" }],
  },
  {
    keys: ["29.99 eur in usd"],
    rows: [
      { icon: "$", title: "$34.79", subtitle: "29.99 Euros in US Dollars", action: "Copy", toast: "Copied $34.79" },
    ],
  },
  {
    keys: ["10 km in mi"],
    rows: [{ icon: "i-ruler", title: "6.21 mi", subtitle: "10 kilometers", action: "Copy", toast: "Copied 6.21 mi" }],
  },
  {
    keys: ["3pm lisbon in sf"],
    rows: [{ icon: "i-clock", title: "7:00 AM", subtitle: "3 PM in Lisbon, in San Francisco", action: "Copy", toast: "Copied 7:00 AM" }],
  },
  {
    keys: ["meetings"],
    rows: [
      { icon: "i-calendar", title: "Design review", subtitle: "10:30–11:00 · Google Meet", action: "Join", toast: "Joins Design review" },
      { icon: "i-calendar", title: "1:1 with Ana", subtitle: "14:00–14:30", action: "Open", toast: "Opens 1:1 with Ana in Calendar" },
      { icon: "i-calendar", title: "Release planning", subtitle: "16:00–17:00 · Zoom", action: "Join", toast: "Joins Release planning" },
    ],
  },
  {
    keys: ["clip", "clipboard"],
    rows: [{ icon: "i-clipboard", title: "Clipboard History", subtitle: "Search past copies", action: "Show", toast: "Opens your clipboard history" }],
  },
  {
    keys: [":left"],
    rows: [{ icon: "i-window", title: "Left Half", subtitle: "Move the front window", action: "Run", toast: "Moves the window to the left half" }],
  },
  {
    keys: [":export pdf"],
    rows: [{ icon: "P", title: "Export as PDF…", subtitle: "File menu in Preview", action: "Choose", toast: "Exports the document as a PDF" }],
  },
  {
    keys: ["bluetooth"],
    rows: [{ icon: "i-switch", title: "Bluetooth", subtitle: "System Settings", action: "Open", toast: "Opens Bluetooth in System Settings" }],
  },
  {
    keys: ["emoji party"],
    rows: [{ icon: "i-sparkle", title: "Party Popper", subtitle: "Emoji", action: "Paste", toast: "Pastes the party popper" }],
  },
  {
    keys: ["define serendipity"],
    rows: [{
      icon: "i-book", title: "serendipity", subtitle: "the occurrence of events by chance in a happy way",
      action: "Open", toast: "Opens serendipity in Dictionary",
    }],
  },
  {
    keys: ["uuid"],
    rows: [{ icon: "i-hash", title: "New UUID", subtitle: "3f9c2a71-8e4b-4d0a-b5c6-1e7f2d9a4b83", action: "Copy", toast: "Copied a new UUID" }],
  },
  {
    keys: [":!git status"],
    rows: [{ icon: "i-terminal", title: "git status", subtitle: "On branch main, nothing to commit", action: "Run", toast: "Runs git status in your shell" }],
  },
];
