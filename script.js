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
   ─────────────────────────────────────────────────────────── */

(function () {
  var poster = document.getElementById('poster');

  if (!poster) return;

  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    // Composition is already complete via CSS defaults; no animation.
    return;
  }

  // Matches the last element's transition-delay + transition-duration
  // in the CSS entrance sequence (location: 2700ms + 1100ms), plus a
  // small buffer so breathing never starts before the wipe finishes.
  var ENTRANCE_TOTAL_MS = 3900;

  // Double rAF: ensures the browser has committed the pre-animation
  // (.anim-armed) styles in a paint before .is-playing flips them,
  // so the transition actually animates instead of jumping.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      poster.classList.add('is-playing');
    });
  });

  window.setTimeout(function () {
    poster.classList.add('breathe');
  }, ENTRANCE_TOTAL_MS);
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

/* ───────────────────────────────────────────────────────────
   Address form — posts guests' answers straight to the Google Form,
   so responses land in the same Form/Sheet as before and nothing is
   stored by this site.

   Google doesn't send CORS headers, so the request goes out with
   mode: 'no-cors': the browser sends it but can't read the reply.
   A resolved fetch means it reached Google; only a network failure
   rejects. Google silently drops submissions that fail its own
   required-field checks, which is why every required field is also
   required here (the browser blocks submit until they're filled).

   If a question in the Google Form is ever deleted and re-created,
   its entry ID changes — re-read the IDs from the form's page source
   (FB_PUBLIC_LOAD_DATA_) and update GOOGLE_FIELDS.
   ─────────────────────────────────────────────────────────── */

(function () {
  var FORM_URL = 'https://docs.google.com/forms/d/e/' +
    '1FAIpQLSeGCOmk3rSDSILa9HTlV6ad56yyAqEQiuCs4XiePYVKwSg38g/formResponse';

  var GOOGLE_FIELDS = {
    first:   'entry.1903180223', // First Name
    last:    'entry.1021533317', // Last Name
    email:   'entry.1346440369', // Email
    phone:   'entry.75909639',   // Phone Number
    address: 'entry.877587661'   // Mailing Address (one field in the Google Form)
  };

  var card = document.getElementById('address-card');
  var form = document.getElementById('address-form');
  var fallback = document.getElementById('address-fallback');
  var thanks = document.getElementById('af-thanks');
  var thanksName = document.getElementById('af-thanks-name');
  var errorEl = document.getElementById('af-error');

  if (!card || !form || !window.fetch || !window.FormData) return;

  // JS is available: swap the fallback link for the on-page form.
  fallback.hidden = true;
  form.hidden = false;
  card.classList.add('is-ready');

  function val(name) {
    return form.elements[name].value.trim();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Sending…';
    errorEl.hidden = true;

    // Fold the separate address fields into the Google Form's single
    // "Mailing Address" answer, e.g. "12 Elm St, Apt 3, Boston, MA 02134".
    var address = [
      val('street'),
      val('unit'),
      val('city'),
      [val('state'), val('zip')].join(' ').trim(),
      val('country')
    ].filter(Boolean).join(', ');

    var data = new FormData();
    data.append(GOOGLE_FIELDS.first, val('first'));
    data.append(GOOGLE_FIELDS.last, val('last'));
    data.append(GOOGLE_FIELDS.email, val('email'));
    data.append(GOOGLE_FIELDS.phone, val('phone'));
    data.append(GOOGLE_FIELDS.address, address);

    fetch(FORM_URL, { method: 'POST', mode: 'no-cors', body: data })
      .then(function () {
        thanksName.textContent = val('first') ? ', ' + val('first') : '';
        form.hidden = true;
        thanks.hidden = false;
        thanks.focus();
      })
      .catch(function () {
        button.disabled = false;
        button.textContent = 'Send';
        errorEl.hidden = false;
      });
  });
})();
