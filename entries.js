// What the in-page demo knows: real Copperlight queries, each with the rows the app would show (the first is
// selected; match() adds the app's "Search Google for …" row last). An icon is a letter or a symbol id in index.html.
// Values like rates and times are illustrative; the page makes no network requests.
// Names that take text after them, as in the app: typed with their space, a name becomes a chip in the field, and only
// its rows show (no Google row).
export const modes = [
  { prefix: "translate ", title: "Translate", hint: "Text, or nothing for what's copied" },
  { prefix: "define ", title: "Define", hint: "A word" },
  { prefix: "emoji ", title: "Emoji", hint: "A word for one: party" },
  { prefix: "add todo ", title: "Add Reminder", hint: "call mom tomorrow 5pm" },
  { prefix: "add event ", title: "Add Calendar Event", hint: "fri 10am dentist" },
  { prefix: ":quit ", title: "Quit Application", hint: "" },
  { prefix: "timer ", title: "Timer", hint: "10 min tea, 90s, 1h 30m" },
  { prefix: "qr ", title: "QR Code", hint: "Text or a link, or nothing for what's copied" },
  { prefix: "stock ", title: "Stock", hint: "A ticker: AAPL, MGLU3.SA" },
  { prefix: "contact ", title: "Contact", hint: "A name, or nothing for everyone" },
  { prefix: "weather ", title: "Weather", hint: "A city, or nothing for where you are" },
  { prefix: "port ", title: "Port", hint: "A port number, like 3000" },
  { prefix: ":layout ", title: "Layout", hint: "" },
  { prefix: ":connect ", title: "Connect Bluetooth Device", hint: "" },
];

// Dates are worked out from today, as the app does, so the demo is never out of date.
const longDate = (date) => date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const today = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};
// ISO 8601: weeks start on Monday, and week 1 holds the year's first Thursday.
const isoWeek = (date) => {
  const thursday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 4 - (date.getDay() || 7)));
  return Math.ceil(((thursday - Date.UTC(thursday.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
};

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
    keys: ["ana"],
    rows: [{
      icon: "i-person", title: "Ana Ribeiro", subtitle: "+1 415 555 0134 · ana@northwind.example", action: "Message",
      toast: "Opens Messages with Ana; Tab lists call, FaceTime, WhatsApp and email",
    }],
  },
  {
    keys: ["inbox"],
    rows: [{
      icon: "i-window", title: "Inbox (3) – Northwind Mail", subtitle: "mail.northwind.example · Tab", action: "Switch to Tab",
      toast: "Brings that tab forward instead of opening it again",
    }],
  },
  {
    keys: ["due"],
    rows: [
      { icon: "i-calendar", title: "Call the bank", subtitle: "Overdue · Errands", action: "Complete", toast: "Ticks it off in Reminders" },
      { icon: "i-calendar", title: "Send the invoice", subtitle: "In 20 min · Work", action: "Complete", toast: "Ticks it off in Reminders" },
    ],
  },
  {
    keys: ["copy text"],
    rows: [{ icon: "i-image", title: "Copy Text from Screen", subtitle: "Drag over anything to copy its text", action: "Select", toast: "Drag over any part of the screen: its text is copied" }],
  },
  {
    keys: ["spell definately"],
    rows: [
      { icon: "i-book", title: "definitely", subtitle: "Spelling of “definately”", action: "Copy", toast: "Copied definitely" },
      { icon: "i-book", title: "defiantly", subtitle: "Spelling of “definately”", action: "Copy", toast: "Copied defiantly" },
    ],
  },
  {
    keys: ["large 555-0100"],
    rows: [{ icon: "A", title: "555-0100", subtitle: "Large Type", action: "Show", toast: "Shows 555-0100 across the screen" }],
  },
  {
    keys: ["20% off 80"],
    rows: [{ icon: "=", title: "64", subtitle: "20% off 80", action: "Copy", toast: "Copied 64; Tab would put it in the field, to keep going" }],
  },
  {
    keys: ["30 is what % of 150"],
    rows: [{ icon: "=", title: "20%", subtitle: "30 is what % of 150", action: "Copy", toast: "Copied 20%" }],
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
    keys: ["39*8 usd"],
    rows: [{ icon: "€", title: "€268.94", subtitle: "39*8 = 312 US Dollars in Euros", action: "Copy", toast: "Copied €268.94" }],
  },
  {
    keys: ["days until christmas", "days until dec 25"],
    get rows() {
      const from = today();
      let christmas = new Date(from.getFullYear(), 11, 25);
      if (christmas < from) christmas = new Date(from.getFullYear() + 1, 11, 25);
      const days = Math.round((christmas - from) / 86400000); // rounded: a day with a clock change is 23 or 25 hours
      const title = `${days} day${days === 1 ? "" : "s"}`;
      return [{ icon: "i-calendar", title, subtitle: `Until ${longDate(christmas)}`, action: "Copy", toast: `Copied ${title}` }];
    },
  },
  {
    keys: ["in 3 weeks"],
    get rows() {
      const from = today();
      const later = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 21);
      return [{ icon: "i-calendar", title: longDate(later), subtitle: `In 21 days · week ${isoWeek(later)}`, action: "Copy", toast: `Copied ${longDate(later)}` }];
    },
  },
  {
    keys: ["#c87533"],
    rows: [
      { icon: "#c87533", title: "rgb(200, 117, 51)", subtitle: "RGB", action: "Copy", toast: "Copied rgb(200, 117, 51)" },
      { icon: "#c87533", title: "hsl(27, 59%, 49%)", subtitle: "HSL", action: "Copy", toast: "Copied hsl(27, 59%, 49%)" },
      { icon: "#c87533", title: "#c87533", subtitle: "Hex", action: "Copy", toast: "Copied #c87533" },
    ],
  },
  {
    keys: ["pick color"],
    rows: [{ icon: "i-eyedropper", title: "Pick Color", subtitle: "Click anywhere on the screen to copy its color", action: "Pick", toast: "Shows the magnifier: the color you click is copied" }],
  },
  {
    keys: ["colors", "my colors"],
    rows: [
      { icon: "#c87533", title: "#c87533", subtitle: "rgb(200, 117, 51)", action: "Copy", toast: "Copied #c87533" },
      { icon: "#2f6f8f", title: "#2f6f8f", subtitle: "rgb(47, 111, 143)", action: "Copy", toast: "Copied #2f6f8f" },
      { icon: "#e8d5b7", title: "#e8d5b7", subtitle: "rgb(232, 213, 183)", action: "Copy", toast: "Copied #e8d5b7" },
    ],
  },
  {
    keys: ["qr https://copperlight.app"],
    rows: [{ icon: "i-qr", title: "https://copperlight.app", subtitle: "QR code", action: "Copy", toast: "Copied the QR code" }],
  },
  {
    keys: ["meetings", "agenda"],
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
    keys: [":top left"],
    rows: [{ icon: "i-window", title: "Top Left Quarter", subtitle: "Move the front window", action: "Run", toast: "Moves the window to the top left quarter" }],
  },
  {
    keys: [":layout work", ":layout"],
    rows: [{ icon: "i-layout", title: "Work", subtitle: "Layout · 5 windows in 3 apps", action: "Arrange", toast: "Puts every window back where you saved it" }],
  },
  {
    keys: ["battery"],
    rows: [{ icon: "i-battery", title: "87%, 3:12 left", subtitle: "Battery · health Good · 312 cycles", action: "Open Settings", toast: "Opens Battery settings" }],
  },
  {
    keys: ["disk"],
    rows: [{ icon: "i-drive", title: "245 GB free of 994 GB", subtitle: "Macintosh HD · 75% used", action: "Open Storage", toast: "Opens Storage settings" }],
  },
  {
    keys: ["cpu"],
    rows: [
      { icon: "i-terminal", title: "Google Chrome Helper (Renderer)", subtitle: "23.8% CPU · 487 MB · pid 7896", action: "End Process", toast: "Asks first, then ends it" },
      { icon: "i-terminal", title: "node", subtitle: "14.0% CPU · 692 MB · pid 1085", action: "End Process", toast: "Asks first, then ends node" },
      { icon: "X", title: "Xcode", subtitle: "6.1% CPU · 2.17 GB · pid 1729", action: "Quit", toast: "Asks first, then quits Xcode, which can ask to save" },
    ],
  },
  {
    keys: ["speed", "speedtest"],
    rows: [{ icon: "i-gauge", title: "Test Internet Speed", subtitle: "Download, upload and latency, with Apple’s servers", action: "Test", toast: "Tests for about 20 seconds, then shows your speed" }],
  },
  {
    keys: ["figma"],
    rows: [{ icon: "i-download", title: "Install Figma", subtitle: "With Homebrew · Collaborative team software", action: "Install", toast: "Runs brew install --cask figma, its output beside the row" }],
  },
  {
    keys: ["port 3000", "port"],
    rows: [{ icon: "i-terminal", title: "node", subtitle: "Listening on 3000 · pid 812", action: "End Process", toast: "Asks first, then ends node" }],
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
    keys: ["pomo 25", "pomo"],
    rows: [{ icon: "i-clock", title: "Start Pomodoro", subtitle: "25 minutes", action: "Start", toast: "Starts a 25-minute pomodoro in the menu bar" }],
  },
  {
    keys: ["timer until 15:30"],
    rows: [{ icon: "i-hourglass", title: "Start Timer", subtitle: "Until 15:30 · 47 minutes", action: "Start", toast: "Starts a timer until 15:30" }],
  },
  {
    keys: ["stopwatch"],
    rows: [{ icon: "i-stopwatch", title: "Start Stopwatch", subtitle: "Counts up in the menu bar", action: "Start", toast: "Starts a stopwatch in the menu bar" }],
  },
  {
    keys: ["timer 10 min tea"],
    rows: [{ icon: "i-hourglass", title: "Start Timer", subtitle: "10 minutes · tea", action: "Start", toast: "Starts a 10-minute timer for tea" }],
  },
  {
    keys: [":awake 2h"],
    get rows() {
      const until = new Date(Date.now() + 2 * 3600 * 1000);
      const time = `${String(until.getHours()).padStart(2, "0")}:${String(until.getMinutes()).padStart(2, "0")}`;
      return [{ icon: "i-sun", title: "Keep Awake for 2 hours", subtitle: `Until ${time}`, action: "Run", toast: `Keeps your Mac awake until ${time}` }];
    },
  },
  {
    keys: [":connect airpods", ":connect"],
    rows: [
      { icon: "i-headphones", title: "AirPods Pro", subtitle: "Bluetooth", action: "Connect", toast: "Connects your AirPods in a few seconds" },
      { icon: "i-keyboard", title: "Magic Keyboard", subtitle: "Connected", action: "Disconnect", toast: "Disconnects the keyboard" },
    ],
  },
  {
    keys: [":play"],
    rows: [{ icon: "i-play", title: "Play or Pause", subtitle: "Whatever is playing", action: "Run", toast: "Plays or pauses the music" }],
  },
  {
    keys: ["translate bom dia"],
    rows: [{ icon: "i-translate", title: "good morning", subtitle: "Portuguese → English", action: "Copy", toast: "Copied good morning" }],
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
  // In their chips, these answer with a card of their own (index.html); the row is what shows on the way there.
  {
    keys: ["stock aapl"],
    rows: [{ icon: "$", title: "AAPL $347.10", subtitle: "Apple · up 0.93% today", action: "Open", toast: "Opens Apple on Yahoo Finance" }],
  },
  {
    keys: ["contact ana", "contact ana ribeiro"],
    rows: [{ icon: "A", title: "Ana Ribeiro", subtitle: "Product Designer · Northwind", action: "Open", toast: "Opens Ana Ribeiro in Contacts" }],
  },
  {
    keys: ["weather lisbon"],
    rows: [{ icon: "i-sun", title: "22° · Partly cloudy", subtitle: "Lisbon · H 26° L 12°", action: "Open", toast: "Opens Weather" }],
  },
];
