// The wordmark's faults, on the real pages.
//
//   node tests/wordmark.test.js
//
// What is worth protecting here is not how any one fault looks - no test in this
// repo can judge that - but the four things that would break the site quietly:
//
//   the name still reads as the name, to a screen reader as well as an eye;
//   the mark is clean whenever a fault is not actually running;
//   a fault fires on its own, inside the window it is supposed to;
//   and nothing at all moves when the visitor has asked for no motion.
//
// The timing is asserted twice over, because the two halves fail differently. The
// ranges are read straight out of wordmark.js by calling wordmarkDelay() a few
// hundred times, which catches a range edited to the wrong number; and one real
// unattended fault is timed on the hub, which catches a scheduler that never runs
// no matter how right its numbers are.
const fs = require("fs");
const path = require("path");
const { launch, url, makeChecks } = require("./helpers");

const ROOT = path.join(__dirname, "..");
const { check, report } = makeChecks();

const NAME = "ARCADE404";

// Every page carries the mark: the two that wear it large, and every game, which
// wears it small inside the breadcrumb. Read the games from the folder rather
// than a list, for the same reason contract.test.js does.
const games = fs
  .readdirSync(path.join(ROOT, "games"), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

const pages = ["/", "/about/"].concat(games.map((g) => `/games/${g}/`));

(async () => {
  const browser = await launch();

  // --- the name, on every page ---------------------------------------------
  for (const p of pages) {
    const page = await browser.newPage();
    await page.goto(url(p));
    await page.waitForFunction(
      () => document.querySelector("[data-wordmark]") &&
            document.querySelector("[data-wordmark]").dataset.wordmarkReady === "1"
    );
    const state = await page.evaluate(() => {
      const el = document.querySelector("[data-wordmark]");
      const displaced = [...el.querySelectorAll(".layer, .fringe, .scan")];
      return {
        // The whole document's text, not just the element's: a duplicate copy
        // that escaped the mark would still be on the page.
        text: el.textContent.replace(/\s+/g, " ").trim(),
        displacedHidden: displaced.every((d) => d.getAttribute("aria-hidden") === "true"),
        clean: !el.className.includes("glitch") && !el.className.includes("peak"),
      };
    });
    // The accessible name as the browser actually computes it, rather than as
    // textContent suggests - the two are not the same thing, and an earlier
    // version of this suite asserted the wrong one of them.
    // interestingOnly:false on purpose. The mark is a labelled image that is not
    // focusable, and Playwright's "interesting" filter drops exactly that - with
    // the default the hub's wordmark is simply absent from the tree, which reads
    // as a missing name rather than as a filtered one.
    const snapshot = await page.accessibility.snapshot({ interestingOnly: false });
    const names = [];
    (function walk(node) {
      if (!node) return;
      if (node.name && node.name.includes("ARCADE")) names.push(node.name);
      (node.children || []).forEach(walk);
    })(snapshot);
    check(`${p} — the browser computes the name as ${NAME}`,
      names.length > 0 && names.every((n) => (n.match(/ARCADE404/g) || []).length === 1),
      names.join(" / ") || "no node named ARCADE…");
    check(`${p} — the displaced copies are hidden from assistive tech`, state.displacedHidden);
    check(`${p} — the name is in the document once, not thirteen times`,
      state.text.split(NAME).length - 1 === 1, state.text);
    check(`${p} — no fault is running the moment the page settles`, state.clean);
    await page.close();
  }

  // --- the name survives with the script absent ----------------------------
  // The mark is text in the HTML; the script only ever adds to it. If that ever
  // stops being true the site loses its own name whenever the file 404s.
  {
    const page = await browser.newPage();
    await page.route("**/wordmark.js", (route) => route.abort());
    await page.goto(url("/"));
    const text = await page.textContent("[data-wordmark]");
    check("with wordmark.js blocked, the hub still says its name",
      text.trim() === NAME, text.trim());
    await page.close();
  }

  // --- the ranges, read out of the module ----------------------------------
  {
    const page = await browser.newPage();
    await page.goto(url("/"));
    const spread = await page.evaluate(() => {
      const first = [], gap = [];
      for (let i = 0; i < 400; i++) { first.push(wordmarkDelay(true)); gap.push(wordmarkDelay(false)); }
      return {
        firstLo: Math.min(...first), firstHi: Math.max(...first),
        gapLo: Math.min(...gap), gapHi: Math.max(...gap),
        effects: WORDMARK_EFFECTS.length,
      };
    });
    check("the first fault is scheduled 2-3s out",
      spread.firstLo >= 2000 && spread.firstHi <= 3000,
      `${Math.round(spread.firstLo)}-${Math.round(spread.firstHi)}ms`);
    check("later faults are scheduled 7-12s apart",
      spread.gapLo >= 7000 && spread.gapHi <= 12000,
      `${Math.round(spread.gapLo)}-${Math.round(spread.gapHi)}ms`);
    // Both ends of each range have to be reachable, or a bug that pins the
    // delay to one value passes the bounds check above.
    check("the delays are spread across their range, not pinned to one value",
      spread.firstHi - spread.firstLo > 700 && spread.gapHi - spread.gapLo > 3500,
      `${Math.round(spread.firstHi - spread.firstLo)}ms / ${Math.round(spread.gapHi - spread.gapLo)}ms`);
    check("every effect in the list has rules behind it in shared.css",
      spread.effects === 12, spread.effects);
    await page.close();
  }

  // --- a real fault, unattended --------------------------------------------
  {
    const page = await browser.newPage();
    const opened = Date.now();
    await page.goto(url("/"));
    // Caught rather than awaited bare: a scheduler that never runs is exactly
    // what this case exists to notice, and an uncaught timeout would abandon
    // every check after it instead of reporting one failure.
    const fired = await page
      .waitForSelector("[data-wordmark].glitch", { timeout: 4000 })
      .then(() => true, () => false);
    const firedAt = Date.now() - opened;
    const fx = await page.evaluate(() =>
      (document.querySelector("[data-wordmark]").className.match(/fx-[\w-]+/) || [])[0]);
    check("a fault fires on its own, without being asked", fired && !!fx,
      fired ? fx : "nothing fired within 4s");
    // Generous at both ends: `opened` includes the navigation itself, and the
    // longest fault is 1.1s, so this is a sanity bound rather than a stopwatch.
    check("it fires a couple of seconds in, not immediately and not late",
      fired && firedAt > 1500 && firedAt < 4500, `${firedAt}ms`);
    await page.waitForSelector("[data-wordmark].glitch", { state: "detached", timeout: 3000 })
      .catch(() => {});
    const settled = await page.evaluate(() =>
      !document.querySelector("[data-wordmark]").className.includes("glitch"));
    check("and the mark goes clean again afterwards", settled);
    await page.close();
  }

  // --- every effect actually does something --------------------------------
  // A name in the list with no `.wm.fx-<name>` rules behind it fires nothing and
  // is indistinguishable, from the outside, from a fault that fired correctly.
  {
    const page = await browser.newPage();
    await page.goto(url("/"));
    const inert = await page.evaluate(async () => {
      const el = document.querySelector("[data-wordmark]");
      // Every element a fault can touch, and both pseudo-elements with it:
      // dead-cells works entirely through `.ch::after`, so a probe that only
      // looked at the layers called it inert while it was working correctly.
      const restingBox = () => {
        const parts = [...el.querySelectorAll(".base, .ch, .layer, .fringe, .scan")];
        const read = (node, pseudo) => {
          const s = getComputedStyle(node, pseudo);
          return [s.transform, s.opacity, s.color, s.maskImage, s.filter,
                  s.content, s.background].join("|");
        };
        return parts.map((n) => [read(n, null), read(n, "::before"), read(n, "::after")].join("~")).join("//");
      };
      el.className = "wm";
      const rest = restingBox();
      const dead = [];
      for (const [name] of WORDMARK_EFFECTS) {
        el.className = "wm fx-" + name + " peak";
        if (restingBox() === rest) dead.push(name);
      }
      el.className = "wm";
      return dead;
    });
    check("no effect in the list is inert", inert.length === 0, inert.join(", ") || "none");
    await page.close();
  }

  // --- reduced motion ------------------------------------------------------
  {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(url("/"));
    await page.waitForTimeout(3800);
    const state = await page.evaluate(() => {
      const el = document.querySelector("[data-wordmark]");
      return {
        text: el.textContent.trim(),
        upgraded: el.dataset.wordmarkReady === "1",
        everGlitched: el.className.includes("glitch"),
      };
    });
    check("with reduced motion asked for, nothing is upgraded at all", !state.upgraded);
    check("and no fault fires in the window one was due", !state.everGlitched);
    check("the name is still the name", state.text === NAME, state.text);
    await context.close();
  }

  await browser.close();
  process.exit(report());
})();
