/* =====================================================================
   Hum Studios — theme-toggle.v2.js
   Purpose: One button cycles between Auto → Light → Dark → Dark+Dim.
   Replaces the separate dim toggle. Safe to drop-in.
   ---------------------------------------------------------------------
   Storage: localStorage 'display-mode' = 'auto' | 'light' | 'dark' | 'dark+dim'
   Behavior:
     - 'auto'  : removes data-theme (uses OS setting), overlay OFF
     - 'light' : sets data-theme='light', overlay OFF
     - 'dark'  : sets data-theme='dark',  overlay OFF
     - 'dark+dim': sets data-theme='dark', overlay ON (adds .theme-dim)
   Migration:
     - Reads legacy 'theme-preference' if present ('auto'|'light'|'dark')
     - If legacy class .theme-dim is found and legacy mode was 'dark', migrates to 'dark+dim'
   Markup:
     <button id="theme-toggle" class="theme-toggle" type="button">Auto</button>
   ===================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'display-mode';
  var LEGACY_THEME_KEY = 'theme-preference';
  var ORDER = ['auto', 'light', 'dark', 'dark+dim'];

  function getStored() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v) return v;
      // migrate legacy
      var legacy = localStorage.getItem(LEGACY_THEME_KEY);
      if (legacy) {
        var hasDim = document.documentElement.classList.contains('theme-dim');
        var migrated = (legacy === 'dark' && hasDim) ? 'dark+dim' : legacy;
        try { localStorage.setItem(STORAGE_KEY, migrated); } catch (_) {}
        return migrated;
      }
    } catch (_) {}
    return 'light';
  }

  function setStored(mode) {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (_) {}
  }

  function apply(mode) {
    var html = document.documentElement;
    // Theme
    if (mode === 'auto') {
      html.removeAttribute('data-theme');
    } else if (mode === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      html.setAttribute('data-theme', 'dark');
    }
    // Dim overlay (CSS uses .theme-dim to enable)
    if (mode === 'dark+dim') {
      html.classList.add('theme-dim');
      html.classList.remove('theme-dim-off');
    } else {
      html.classList.remove('theme-dim');
      html.classList.add('theme-dim-off');
      // Remove the off flag shortly after first paint (prevents flashes)
      queueMicrotask(function(){ html.classList.remove('theme-dim-off'); });
    }

    updateButton(mode);
  }

  function updateButton(mode) {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var label = (mode === 'dark+dim') ? 'Dark+Dim' : (mode.charAt(0).toUpperCase() + mode.slice(1));
    btn.textContent = label;
    btn.setAttribute('aria-label', 'Display mode: ' + label);
    btn.dataset.mode = mode;
  }

  function nextMode(current) {
    var idx = ORDER.indexOf(current);
    return ORDER[(idx + 1) % ORDER.length];
  }

  function init() {
    var btn = document.getElementById('theme-toggle');
    var mode = getStored();
    apply(mode);

    if (btn) {
      btn.addEventListener('click', function () {
        var current = btn.dataset.mode || getStored();
        var next = nextMode(current);
        setStored(next);
        apply(next);
      });
    }

    // Keep label stable when OS theme changes while in 'auto'
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq && typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', function () {
        var current = getStored();
        if (current === 'auto') updateButton('auto');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();