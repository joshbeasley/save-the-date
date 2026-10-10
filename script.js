/* ───────────────────────────────────────────────────────────
   Josh & Laura — Save the Date
   Entrance animation controller.

   The reveal itself is pure CSS (transition-delay per element, see
   styles.css "Entrance animation"). This script only:
     1. Plays the sequence once on load by adding .is-playing to the
        poster (after a frame, so the browser has painted the
        pre-animation state and the transitions actually run).
     2. Once the entrance fully settles, adds .breathe so the poster
        picks up the slow continuous "breathing" zoom defined in CSS
        (confirmed present in the reference video well after its own
        entrance had finished — see styles.css for how it was measured).
     3. Reveals the "Replay animation" button once it knows JS and
        motion are both available.
     4. Replays the sequence on click: stops breathing, removes
        .is-playing, forces a reflow, then re-adds it — restarting
        cleanly with no stacked timers or lingering breathe animation,
        however fast the button is clicked.
   ─────────────────────────────────────────────────────────── */

(function () {
  var poster = document.getElementById('poster');
  var replayBtn = document.getElementById('replay-btn');

  if (!poster) return;

  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    // Composition is already complete via CSS defaults; no button, no animation.
    return;
  }

  // Matches the last element's transition-delay + transition-duration
  // in the CSS entrance sequence (location: 2700ms + 1100ms), plus a
  // small buffer so breathing never starts before the wipe finishes.
  var ENTRANCE_TOTAL_MS = 3900;

  var breatheTimer = null;

  function play() {
    // Double rAF: ensures the browser has committed the pre-animation
    // (.anim-armed) styles in a paint before .is-playing flips them,
    // so the transition actually animates instead of jumping.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        poster.classList.add('is-playing');
      });
    });
    breatheTimer = window.setTimeout(function () {
      poster.classList.add('breathe');
    }, ENTRANCE_TOTAL_MS);
  }

  function replay() {
    if (breatheTimer !== null) {
      window.clearTimeout(breatheTimer);
      breatheTimer = null;
    }
    poster.classList.remove('breathe');
    poster.classList.remove('is-playing');
    // Force reflow so the removal is committed before re-adding the class.
    void poster.offsetWidth;
    play();
  }

  play();

  if (replayBtn) {
    replayBtn.hidden = false;
    replayBtn.addEventListener('click', replay);
  }
})();

/* ───────────────────────────────────────────────────────────
   Countdown — ticks the "We hope you can join us" section below
   the poster. Independent of the entrance controller above (runs
   regardless of reduced-motion, since updating digits once a
   second isn't the kind of motion that preference is about).

   WEDDING_DATE is the one place to update if the ceremony time
   ever changes — kept here, in UTC-offset form, so every visitor's
   countdown reaches zero at the same real moment regardless of
   their own timezone (the poster's "5 PM" stays literal display
   text per the brief; this is just the countdown's own clock).
   ─────────────────────────────────────────────────────────── */

(function () {
  var WEDDING_DATE = new Date('2027-08-21T17:00:00-04:00');

  var daysEl = document.getElementById('cd-days');
  var hoursEl = document.getElementById('cd-hours');
  var minutesEl = document.getElementById('cd-minutes');
  var secondsEl = document.getElementById('cd-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function pad(n, width) {
    var s = String(n);
    while (s.length < width) s = '0' + s;
    return s;
  }

  function tick() {
    var diff = WEDDING_DATE.getTime() - Date.now();
    if (diff < 0) diff = 0;

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    daysEl.textContent = pad(days, 3);
    hoursEl.textContent = pad(hours, 2);
    minutesEl.textContent = pad(minutes, 2);
    secondsEl.textContent = pad(seconds, 2);
  }

  tick();
  window.setInterval(tick, 1000);
})();
