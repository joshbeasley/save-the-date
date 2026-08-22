// ─── CONFIG ────────────────────────────────────────────────────────────────
const WEDDING_DATE     = new Date('2027-08-21T16:00:00-04:00');
const ADDRESS_FORM_URL = '#'; // ← paste Google Form share link here
// ───────────────────────────────────────────────────────────────────────────

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Elements
const gate      = document.getElementById('gate');
const cardScene = document.getElementById('card');
const envBtn    = document.getElementById('envelope-btn');
const envScene  = document.getElementById('env-scene');
const envFlap   = document.getElementById('env-flap');
const prompt    = document.getElementById('gate-prompt');
const addressBtn = document.getElementById('address-btn');

// State
let sequenceActive = false;
let promptTimerA, promptTimerB;
let inactivityTimerA, inactivityTimerB;
let wiggleInterval;
let countdownAriaTimer;

// ─── SCROLL LOCK ────────────────────────────────────────────────────────────
function lockScroll() {
  document.documentElement.classList.add('scroll-locked');
}

function unlockScroll() {
  document.documentElement.classList.remove('scroll-locked');
}

// Prevent iOS rubber-band scrolling while locked
document.addEventListener('touchmove', (e) => {
  if (document.documentElement.classList.contains('scroll-locked')) {
    e.preventDefault();
  }
}, { passive: false });

// ─── COUNTDOWN ──────────────────────────────────────────────────────────────
function updateCountdown() {
  const diff = WEDDING_DATE.getTime() - Date.now();

  if (diff <= 0) {
    document.getElementById('cd-days').textContent    = '00';
    document.getElementById('cd-hours').textContent   = '00';
    document.getElementById('cd-minutes').textContent = '00';
    document.getElementById('cd-seconds').textContent = '00';
    document.getElementById('countdown-heading').textContent = 'TODAY';
    return;
  }

  const totalSec = Math.floor(diff / 1000);
  const days    = Math.floor(totalSec / 86400);
  const hours   = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  document.getElementById('cd-days').textContent    = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent   = String(hours).padStart(2, '0');
  document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
}

function updateCountdownAria() {
  const diff = WEDDING_DATE.getTime() - Date.now();
  const display = document.getElementById('countdown-display');
  if (diff <= 0) {
    display.setAttribute('aria-label', 'The wedding is today!');
    return;
  }
  const totalSec = Math.floor(diff / 1000);
  const days    = Math.floor(totalSec / 86400);
  const hours   = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  display.setAttribute('aria-label',
    `${days} days, ${hours} hours, and ${minutes} minutes until the wedding`);
}

function initCountdown() {
  updateCountdown();           // Render synchronously before first tick
  setInterval(updateCountdown, 1000);
  updateCountdownAria();
  countdownAriaTimer = setInterval(updateCountdownAria, 60000);
}

// ─── PROMPT ENTRANCE ────────────────────────────────────────────────────────
function initPromptEntrance() {
  // Gate entrance animations: eyebrow 200+900=1100ms, names 500+1100=1600ms
  // Envelope wrap: 900+1000=1900ms. Prompt should appear after envelope lands.
  promptTimerA = setTimeout(() => {
    prompt.classList.add('is-visible');
    promptTimerB = setTimeout(() => {
      if (!sequenceActive) prompt.classList.add('is-pulsing');
    }, 800);
  }, 1900);
}

// ─── INACTIVITY TIMERS ──────────────────────────────────────────────────────
function startInactivityTimers() {
  // After 8s of no interaction: deepen pulse
  inactivityTimerA = setTimeout(() => {
    if (sequenceActive) return;
    prompt.classList.remove('is-pulsing');
    prompt.classList.add('is-urgent');
  }, 8000);

  // After 20s: first envelope wiggle, then repeat every 15s
  inactivityTimerB = setTimeout(() => {
    if (sequenceActive) return;
    triggerWiggle();
    wiggleInterval = setInterval(() => {
      if (!sequenceActive) triggerWiggle();
    }, 15000);
  }, 20000);
}

function triggerWiggle() {
  const wrap = document.querySelector('.gate-envelope-wrap');
  if (!wrap) return;
  wrap.classList.remove('is-wiggling');
  // Force reflow so re-adding the class restarts the animation
  void wrap.offsetWidth;
  wrap.classList.add('is-wiggling');
  wrap.addEventListener('animationend', () => {
    wrap.classList.remove('is-wiggling');
  }, { once: true });
}

function cancelAllTimers() {
  clearTimeout(promptTimerA);
  clearTimeout(promptTimerB);
  clearTimeout(inactivityTimerA);
  clearTimeout(inactivityTimerB);
  clearInterval(wiggleInterval);
}

// ─── ENVELOPE OPENING SEQUENCE ──────────────────────────────────────────────
function initEnvelope() {
  lockScroll();

  // Promote layers early on pointerdown (before tap registers)
  envBtn.addEventListener('pointerdown', () => {
    if (sequenceActive) return;
    envScene.style.willChange = 'transform';
    envFlap.style.willChange  = 'transform';
  });

  envBtn.addEventListener('click', handleEnvelopeOpen);
}

function handleEnvelopeOpen() {
  if (sequenceActive) return;
  sequenceActive = true;

  cancelAllTimers();
  envBtn.disabled = true;
  envBtn.style.pointerEvents = 'none';

  if (prefersReducedMotion) {
    // Reduced motion: simple 200ms crossfade
    gate.style.transition = 'opacity 200ms ease';
    gate.style.opacity = '0';
    revealCard();
    setTimeout(() => {
      gate.classList.add('is-hidden');
      unlockScroll();
      focusCard();
      cleanupWillChange();
    }, 220);
    return;
  }

  // Full animation: CSS keyframes take over from here
  gate.classList.add('is-opening');

  // Reveal card exactly when gate starts fading (1000ms) for a smooth crossfade
  setTimeout(revealCard, 1000);

  // Listen specifically for the gate's own fade-out ending (at 1600ms)
  gate.addEventListener('animationend', onGateAnimEnd);
}

function onGateAnimEnd(e) {
  // Only handle the gate element's own fade animation
  if (e.target !== gate) return;
  gate.removeEventListener('animationend', onGateAnimEnd);
  gate.classList.add('is-hidden');
  unlockScroll();
  focusCard();
  cleanupWillChange();
}

function revealCard() {
  cardScene.removeAttribute('aria-hidden');
  cardScene.classList.add('is-revealed');
}

function focusCard() {
  const heading = cardScene.querySelector('h2');
  if (!heading) return;
  heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
}

function cleanupWillChange() {
  envScene.style.willChange = '';
  envFlap.style.willChange  = '';
}

// ─── ADDRESS BUTTON ─────────────────────────────────────────────────────────
function initAddressButton() {
  if (ADDRESS_FORM_URL === '#') {
    addressBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.warn(
        '[Save-the-Date] ADDRESS_FORM_URL is not configured. ' +
        'Set it in the CONFIG block at the top of script.js.'
      );
    });
  } else {
    addressBtn.href = ADDRESS_FORM_URL;
  }
}

// ─── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initEnvelope();
  initAddressButton();
  initPromptEntrance();
  startInactivityTimers();
});
