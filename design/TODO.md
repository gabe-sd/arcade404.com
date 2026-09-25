# TODO — the site's visual design

Open visual work: the look of the hub, the shell and the games, rather than how any
of them plays. It belongs to the art director — see `ART-DIRECTOR.md`. The design
itself is recorded in `design/DESIGN.md`.

Same conventions as every other backlog here. Entries are headed by a slug, which is
also the branch name, so one string finds the entry, the discussion and the
implementation. Entries are in priority order within a section, and are **deleted as
they land** rather than marked done — `tests/docs-check.js` fails an entry that has a
merge commit behind it.

**If you are a worker, this is not your backlog — but it is where you file.** A
game's visual gaps belong here rather than in `games/<name>/TODO.md`, because the look
is one system and fixing it a game at a time is what produced the look being replaced.
Appending an entry is allowed and wanted; taking one is not.

Everything below is cut from `main` — the redesign's integration branch merged and the
ref is gone. An entry cut from anything else says so on its own line: visual work
sometimes runs on an integration branch, and `INTEGRATOR.md` describes how that works.

---

# The redesign

A complete visual overhaul: the current look is a low-effort first draft and none of
it is owed deference. The target is a dark CRT-phosphor arcade terminal — see
`design/mockups/` for what was agreed.

What was decided before the first phase is now built and described in
`design/DESIGN.md` — the dark-only palette, the self-hosted VT323, the token layering,
Pong's local colours, the hub's category accents. One of those decisions is still
live rather than history:

- **Verification is Gabriel looking at a served page**, and he is asked at the start
  of a phase whether he wants a preview or wants it built. The full version is in
  `ART-DIRECTOR.md`.

## Phases

Each is one session, one branch, one merge. **Gabriel confirmed on 2026-09-08 that all
four run.** His words: the redesign is playable and about 90% done, but not finished —
each of the four remaining games still needs its visual pass. The overhaul landed on
`main` on 2026-09-07 with the hub, the shell, chess and Pong redesigned and the other
four framed but not restyled inside.

**Flappy Bird's phase landed on 2026-09-10, Tic Tac Toe's on 2026-09-11 and
Minesweeper's and Sudoku's on 2026-09-15.** Every game's phase has run, and the last
off-font glyphs went on 2026-09-25 — see `design/DESIGN.md`, "Glyphs the typeface
lacks". What is left of the redesign is the decision below.

### What the finished phases settled

Nothing here is open any more; it is recorded so a later session does not re-decide it.

- **A HUD readout** is a drawn stroke glyph on a 48 grid at the hub's icon weight,
  `aria-hidden`, plus the word it stands for as off-screen text, plus the number.
  Flappy Bird's phase built words against glyphs on a served page and the glyph row
  won; Minesweeper's followed it.
- **A game's content** — Minesweeper's mine and flag — is drawn SVG on the same grid,
  carrying `data-mark` so a test can name it. Chess's pieces are the precedent.
  A drawing that reads at icon size may not read at a third of it: the hub's spiked
  mine became a sunburst in a cell, and the fix was a body and a fuse.
- **A control's icon** is drawn too, and is checked against whatever else is on the
  page at that size. A gear and a mine are the same ring-with-teeth at button size,
  which is why Minesweeper's advanced button is sliders.

### redesign-category-accents — Decide whether colour by category stays

Not work yet — a decision to take with Gabriel once the hub and every game have been
seen in the new palette. The broader palette is wanted; assigning a fixed colour per
category is what is unsettled, along with whether categories exist as a visible idea at
all. Filter chips and idea tiles were dropped for this project and can be reconsidered
here.

**One half of this now has an answer, and it is no.** Whether a game's in-game
accent inherits from its hub tile: chess and Pong each said yes independently —
chess's black army is the strategy tile's jade, Pong's player is the arcade tile's
rose — and **Flappy Bird said no**. Its tile is arcade rose; its bird is cyan.
Rose was built and looked at first, and lost for reasons particular to that board;
`design/DESIGN.md`, "What this answers about hub-tile inheritance", has them.

**Tic Tac Toe is the fourth, and it splits.** Its O is the strategy tile's jade,
its X is violet, which belongs to no tile — one board carrying both answers at
once. It went that way for contrast between the two players rather than out of
any view about the hub, which is itself worth knowing: a game with two actors
cannot inherit one tile colour for both.

Two out of three is a tendency, not a rule. What is left to decide here is
narrower than it was: whether categories are a visible idea at all, and whether the
hub keeps a fixed colour per category — not whether games are obliged to match.

Close this entry by writing the answer into `design/DESIGN.md`, whichever way it goes.

---

# After the redesign

Filed by Gabriel on 2026-09-15, cut from `main`.

### hub-arcade404-theme — The home page around the name

**The name itself is settled and built.** Gabriel chose `ARCADE404` — tight caps,
no gap, no tail — on 2026-09-22, from a sheet of seventy-five lockups kept at
`design/previews/wordmarks/`. It is live on all eight pages and it glitches; see
`design/DESIGN.md`, "The wordmark, and the faults it wears". What that closes is
the naming half of this entry. What is left is the page around it:

**The link is built too**, on 2026-09-22: the wordmark is the way home on all
eight pages. Two claims this entry made about it were wrong and are worth
correcting rather than deleting, because both would mislead the next reader:
`tests/contract.test.js` did *not* check only that a link home exists — it named
`.crumb` specifically — and the breadcrumb it named no longer exists. The check
now asks that `a.brand` points home and that the mark sits inside that anchor
rather than being it.

**The hub around it.** The first phase put the hub on the CRT-phosphor palette and
that stays; what it never had was a name to build a page around. The 404 joke is a
composition the hub can lean into, not only a string in a header — and now that
the mark itself carries the joke in how it behaves, there is a real question about
whether the page should say anything more at all.

**Two stale strings.** Statements of fact rather than prose: the hub's `<title>`
is `Arcade` and the about page's is `About — Gabe-SD Arcade`, naming a repo that
has moved. Every game page's is `<Game> · Game Arcade`. All of them now disagree
with the name in the page itself.

