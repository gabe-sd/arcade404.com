// The wordmark's faults.
//
// The name is plain text in every page's HTML and reads perfectly with this file
// absent or blocked - that is the point of doing it this way round. What this
// adds is the copies an effect needs to displace, and a clock: one fault a short
// way into the visit, then another every so often, each picked at random.
//
// Loaded as a classic script, like every other script here, so what follows is
// reachable from devtools and from tests/wordmark.test.js - see "Scripts are
// classic, not modules" in CLAUDE.md.

// The twelve, with how long each one's own animation needs. A fault is over when
// its window is; the class comes off and the mark is clean again. Keep a name
// here in step with the `.wm.fx-<name>` rules in shared.css - a name with no
// rules behind it fires nothing and looks exactly like a fault that fired.
const WORDMARK_EFFECTS = [
  ["quiet-tear", 420],
  ["six-thin-slices", 700],
  ["big-tear", 520],
  ["smear-fill", 700],
  ["hue-shift-tear", 420],
  ["band-split-guns", 620],
  ["standing-fringe", 700],
  ["damage-only-colour", 520],
  ["crossed-axes", 620],
  ["shredded", 700],
  ["interlace", 520],
  ["dead-cells", 1100],
];

// Gabriel's numbers: the first fault 2-3s after the page opens, then one every
// 7-12s. Both ends inclusive-ish; the point is the range, not the precision.
const WORDMARK_FIRST_MS = [2000, 3000];
const WORDMARK_GAP_MS = [7000, 12000];

function wordmarkDelay(isFirst) {
  const [lo, hi] = isFirst ? WORDMARK_FIRST_MS : WORDMARK_GAP_MS;
  return lo + Math.random() * (hi - lo);
}

function wordmarkPick() {
  return WORDMARK_EFFECTS[Math.floor(Math.random() * WORDMARK_EFFECTS.length)];
}

// Turn a plain wordmark into a layered one. Only `.base` is real text: the copies
// an effect displaces are empty elements that draw the word through generated
// content from `data-text`, so the name appears in the document exactly once. A
// screen reader, a crawler and a copy-paste all get one ARCADE404, not thirteen.
function wordmarkUpgrade(el) {
  if (el.dataset.wordmarkReady === "1") return;
  const text = el.textContent.trim();
  if (!text) return;

  const chars = text
    .split("")
    .map((c) => '<span class="ch">' + c + "</span>")
    .join("");
  // Eight bands and three fringes is the most any one effect asks for; an effect
  // simply leaves the ones it does not need at opacity 0.
  const copy = (cls) =>
    '<span class="' + cls + '" data-text="' + text + '" aria-hidden="true"></span>';
  const layers = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => copy("layer l" + n)).join("");
  const fringes = [1, 2, 3].map((n) => copy("fringe fr" + n)).join("");

  el.innerHTML =
    '<span class="base" aria-hidden="true">' + chars + "</span>" +
    layers + fringes +
    '<span class="scan" aria-hidden="true"></span>';
  el.classList.add("wm");
  // The visible word is now nine one-character spans, which a screen reader is
  // entitled to read out a letter at a time. So the mark announces itself as one
  // thing: a picture of the name, which is what a stylised wordmark is. It sits
  // inside the link home, and the label is what that link contributes to its own
  // accessible name.
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", text);
  el.dataset.wordmarkReady = "1";
}

function wordmarkFire(el, name, ms) {
  // Restarting needs the class gone for a frame, or the animation carries on
  // from wherever it had got to rather than starting again.
  el.className = el.className.replace(/\s*fx-[\w-]+|\s*glitch|\s*peak/g, "");
  void el.offsetWidth;
  el.classList.add("fx-" + name, "glitch");
  setTimeout(() => el.classList.remove("glitch"), ms);
}

(function () {
  // A fault is decoration, and decoration that moves is exactly what this
  // setting asks us not to do. Nothing is upgraded at all: the mark stays the
  // plain text the HTML already carries.
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const marks = document.querySelectorAll("[data-wordmark]");
  marks.forEach((el) => {
    wordmarkUpgrade(el);
    const tick = (isFirst) => {
      setTimeout(() => {
        const [name, ms] = wordmarkPick();
        wordmarkFire(el, name, ms);
        tick(false);
      }, wordmarkDelay(isFirst));
    };
    tick(true);
  });
})();
