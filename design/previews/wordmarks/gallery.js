// Sheet chrome only — the lockups themselves are pure CSS.
// "Freeze" puts every glitch variant into its .peak state so a still frame
// shows the worst moment; unfreezing returns them to their own timing.
(function () {
  const btn = document.getElementById('freeze');
  if (!btn) return;
  // Lots put the variant class in different places — some on the card, some on
  // the element inside the stage — so peak goes on both.
  const targets = () => document.querySelectorAll('.card, .stage > *');
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') === 'true';
    targets().forEach((el) => el.classList.toggle('peak', !on));
    btn.setAttribute('aria-pressed', String(!on));
    btn.textContent = on ? 'Freeze the glitch' : 'Let them run';
  });
})();
