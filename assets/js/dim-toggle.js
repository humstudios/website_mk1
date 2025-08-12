// assets/js/dim-toggle.js — fixed Dark/Light toggle with icon + label
(function () {
  const KEY = "hum:dim"; // "on" | "off" | null
  const html = document.documentElement;
  const btn = document.getElementById("dim-toggle");
  if (!btn) return;

  // Build clean contents: icon + label (no duplicates)
  function sunSVG() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 4.5a1 1 0 0 0 1-1V2a1 1 0 1 0-2 0v1.5a1 1 0 0 0 1 1Zm0 15a1 1 0 0 0-1 1V22a1 1 0 1 0 2 0v-1.5a1 1 0 0 0-1-1ZM4.5 12a1 1 0 0 0-1-1H2a1 1 0 1 0 0 2h1.5a1 1 0 0 0 1-1Zm18 0a1 1 0 0 0 1-1H22a1 1 0 1 0 0 2h1.5a1 1 0 0 0-1-1ZM6.05 6.05a1 1 0 0 0 0-1.41L4.99 3.58a1 1 0 1 0-1.41 1.41l1.06 1.06a1 1 0 0 0 1.41 0Zm12.37 12.37a1 1 0 0 0 0 1.41l1.06 1.06a1 1 0 1 0 1.41-1.41l-1.06-1.06a1 1 0 0 0-1.41 0ZM18 6.05a1 1 0 0 0 1.41 0l1.06-1.06A1 1 0 1 0 19.06 3.6L18 4.66a1 1 0 0 0 0 1.41Zm-12.37 12.37a1 1 0 0 0-1.41 0l-1.06 1.06a1 1 0 0 0 1.41 1.41l1.06-1.06a1 1 0 0 0 0-1.41ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/></svg>';
  }
  function moonSVG() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M21 12.79A9 9 0 0 1 11.21 3a.75.75 0 0 0-.86.99A7.5 7.5 0 1 0 20 12.07a.75.75 0 0 0 1-.86Z"/></svg>';
  }

  const mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

  function getUserPref() {
    const v = localStorage.getItem(KEY);
    if (v === "on" || v === "off") return v;
    return null;
  }
  function isOSDark() {
    return mql ? mql.matches : false;
  }
  function isDimActive() {
    const pref = getUserPref();
    if (pref === "on") return true;
    if (pref === "off") return false;
    return isOSDark(); // auto-dim when OS is dark and no override
  }

  function applyClasses() {
    const pref = getUserPref();
    html.classList.remove("theme-dim", "theme-dim-off");
    if (pref === "on") {
      html.classList.add("theme-dim");
    } else if (pref === "off") {
      html.classList.add("theme-dim-off");
    }
  }

  function renderButton() {
    const on = isDimActive();
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    // Clean rebuild
    btn.innerHTML = '<span class="dim-icon"></span><span class="dim-label"></span>';
    const icon = btn.querySelector(".dim-icon");
    const label = btn.querySelector(".dim-label");
    icon.innerHTML = on ? moonSVG() : sunSVG();
    label.textContent = on ? "Light" : "Dark";
    // Keep aria-label stable
    btn.setAttribute("aria-label", "Toggle dim mode");
  }

  function setPrefOn() {
    localStorage.setItem(KEY, "on");
  }
  function setPrefOff() {
    localStorage.setItem(KEY, "off");
  }

  // Initial state
  applyClasses();
  renderButton();

  // React to clicks
  btn.addEventListener("click", function () {
    const on = isDimActive();
    if (on) {
      setPrefOff();
    } else {
      setPrefOn();
    }
    applyClasses();
    renderButton();
  });

  // React to OS theme changes only if no user override
  if (mql && mql.addEventListener) {
    mql.addEventListener("change", function () {
      if (getUserPref() == null) {
        // no override; just rerender to reflect OS change
        applyClasses();
        renderButton();
      }
    });
  } else if (mql && mql.addListener) {
    // Safari < 14
    mql.addListener(function () {
      if (getUserPref() == null) {
        applyClasses();
        renderButton();
      }
    });
  }
})();
