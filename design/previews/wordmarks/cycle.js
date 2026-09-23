// The cycle preview's harness. Exploration scaffolding, not site code.
//
// Every effect is one class on the mark. Firing one means putting `fx-<name>`
// on it and adding `glitch` for as long as that effect runs; the CSS animations
// are one-shot and keyed off `glitch`, so nothing loops on its own. That is the
// whole mechanism, and it is what the real thing would do at page load.
(function () {
  // name, label, and how long the fault lasts in ms — the CSS animation for an
  // effect must finish inside its own window or it is cut off mid-fault.
  const EFFECTS = [
    ['quiet-tear', 'quiet tear', 420],
    ['six-thin-slices', 'six thin slices', 700],
    ['big-tear', 'big tear', 520],
    ['smear-fill', 'smear fill', 700],
    ['hue-shift-tear', 'hue shift tear', 420],
    ['band-split-guns', 'band split guns', 620],
    ['standing-fringe', 'standing fringe', 700],
    ['damage-only-colour', 'damage only colour', 520],
    ['crossed-axes', 'crossed axes', 620],
    ['shredded', 'shredded', 700],
    ['interlace', 'interlace flicker', 520],
    ['dead-cells', 'dead cells', 1100],
  ];

  const wm = document.getElementById('wm');
  const lastEl = document.getElementById('last');
  const nextEl = document.getElementById('next');
  const countEl = document.getElementById('count');
  const gapInput = document.getElementById('gap');
  const gapVal = document.getElementById('gap-val');
  const noteEl = document.getElementById('mode-note');
  const holdBtn = document.getElementById('hold');

  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pool = new Set(EFFECTS.map(([name]) => name));
  let mode = 'cycle';
  let current = EFFECTS[0][0];
  let fired = 0;
  let clearTimer = null;
  let nextTimer = null;
  let dueAt = 0;

  function durationOf(name) {
    const row = EFFECTS.find((e) => e[0] === name);
    return row ? row[2] : 500;
  }

  function fire(name) {
    current = name;
    clearTimeout(clearTimer);
    // Restarting the same effect needs the class gone for a frame, or the
    // animation simply carries on from where it was.
    wm.className = 'wm';
    void wm.offsetWidth;
    wm.className = 'wm fx-' + name + (holdBtn.getAttribute('aria-pressed') === 'true' ? ' peak' : ' glitch');
    fired += 1;
    countEl.textContent = String(fired);
    lastEl.textContent = (EFFECTS.find((e) => e[0] === name) || [, name])[1];
    if (holdBtn.getAttribute('aria-pressed') !== 'true') {
      clearTimer = setTimeout(() => wm.classList.remove('glitch'), durationOf(name));
    }
  }

  function pick() {
    const live = EFFECTS.filter(([name]) => pool.has(name));
    if (!live.length) return null;
    return live[Math.floor(Math.random() * live.length)][0];
  }

  function schedule() {
    clearTimeout(nextTimer);
    if (mode !== 'cycle' || calm) { nextEl.textContent = '—'; return; }
    const base = Number(gapInput.value) * 1000;
    // ± half the gap, so the rhythm never becomes a metronome.
    const wait = base * 0.5 + Math.random() * base;
    dueAt = Date.now() + wait;
    nextTimer = setTimeout(() => {
      const name = pick();
      if (name) fire(name);
      schedule();
    }, wait);
  }

  setInterval(() => {
    if (mode !== 'cycle' || calm || !dueAt) return;
    const left = Math.max(0, dueAt - Date.now());
    nextEl.textContent = (left / 1000).toFixed(1) + 's';
  }, 100);

  // Buttons for firing one effect by hand, and tickboxes for the random pool.
  const fxList = document.getElementById('fx-list');
  const poolList = document.getElementById('pool-list');
  EFFECTS.forEach(([name, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', () => fire(name));
    fxList.appendChild(b);

    const p = document.createElement('button');
    p.type = 'button';
    p.textContent = label;
    p.setAttribute('aria-pressed', 'true');
    p.addEventListener('click', () => {
      const on = p.getAttribute('aria-pressed') === 'true';
      p.setAttribute('aria-pressed', String(!on));
      if (on) pool.delete(name); else pool.add(name);
    });
    poolList.appendChild(p);
  });

  const cycleBtn = document.getElementById('mode-cycle');
  const loadBtn = document.getElementById('mode-load');

  function setMode(next) {
    mode = next;
    cycleBtn.setAttribute('aria-pressed', String(next === 'cycle'));
    loadBtn.setAttribute('aria-pressed', String(next === 'load'));
    noteEl.textContent = next === 'cycle'
      ? 'Cycling: a fault is picked at random, fires once, and the mark goes quiet until the next one.'
      : 'Once per load: one fault is picked when the page opens and fires as the mark arrives. Reload for another.';
    schedule();
  }

  cycleBtn.addEventListener('click', () => setMode('cycle'));
  loadBtn.addEventListener('click', () => setMode('load'));
  document.getElementById('reload').addEventListener('click', () => location.reload());

  gapInput.addEventListener('input', () => {
    gapVal.textContent = gapInput.value;
    schedule();
  });

  holdBtn.addEventListener('click', () => {
    const on = holdBtn.getAttribute('aria-pressed') === 'true';
    holdBtn.setAttribute('aria-pressed', String(!on));
    holdBtn.textContent = on ? 'Hold the worst frame' : 'Let it run';
    fire(current);
  });

  if (calm) {
    noteEl.textContent = 'Reduced motion is on in this browser, so nothing fires '
      + 'by itself. The buttons still work.';
  } else {
    // The load pick: whatever mode you switch to afterwards, the page opens the
    // way the real thing would — one fault, as the mark arrives.
    const first = pick();
    if (first) setTimeout(() => fire(first), 250);
    schedule();
  }
})();
