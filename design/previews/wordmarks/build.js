// Assemble the lot fragments into one sheet. Run: node build.js
// Exploration scaffolding — deleted with the rest of this folder.
const fs = require('fs');
const path = require('path');

const here = __dirname;
const lots = [
  ['lot-a.html', 'Lot A — the name alone: casing, spacing, how 404 meets ARCADE'],
  ['lot-b.html', 'Lot B — the 404 joke attached to the name'],
  ['lot-c.html', 'Lot C — the name as a piece of hardware'],
  ['lot-d.html', 'Lot D — wild cards: each one breaks a rule, and says which'],
  ['lot-e.html', 'Lot E — the torn-signal family: clean at rest, briefly destroyed'],
  ['lot-h.html', 'Lot H — hybrids: the tear and the misconverged tube together'],
  ['lot-f.html', 'Lot F — the display failing: ten kinds of fault, none of them a tear'],
  ['lot-g.html', 'Lot G — the error as meaning: the mark behaving like software reporting a fault'],
];

const sections = lots
  .filter(([file]) => fs.existsSync(path.join(here, file)))
  .map(([file, title]) => {
    const body = fs.readFileSync(path.join(here, file), 'utf8');
    return `<section class="lot">\n<h2>${title}</h2>\n<div class="lots">\n${body}\n</div>\n</section>`;
  })
  .join('\n\n');

const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Wordmark sheet — arcade404</title>
<link rel="stylesheet" href="../../../shared.css">
<link rel="stylesheet" href="gallery.css">
</head>
<body>
<div class="sheet">
<header>
  <h1>arcade404 — wordmark sheet</h1>
  <p>Branding only: the name set many ways, nothing else about the page.
     Lots A-D are round one. Lots E-H are the glitch round: every one of those is
     clean at rest and comes apart only briefly, so watch them for a few seconds
     rather than judging the still.</p>
  <p><button type="button" id="freeze" aria-pressed="false">Freeze the glitch</button></p>
</header>
${sections}
</div>
<script src="gallery.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(here, 'index.html'), page);
console.log('wrote index.html');
