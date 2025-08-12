/* Hum Studios — Dark/Light (Dim) Toggle — v5
   - Shows "Dark" when dim is OFF, "Light" when dim is ON
   - Sun/Moon icon swaps; remembers user choice
   - Auto-dim follows OS dark when no override is saved
   - Robust to duplicate CSS; button can live anywhere in DOM
*/
(function () {
  const KEY = "hum:dim"; // "on" | "off" | null (no override)
  const btn = document.getElementById("dim-toggle");
  if (!btn) return;

  // Ensure clean button content (no duplicates)
  function renderButton(isOn) {
    btn.innerHTML = ""; // wipe
    // Icon
    const icon = document.createElement("span");
    icon.className = "dim-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = isOn
      // Moon for ON
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.4 14.1a8.7 8.7 0 1 1-11.5-11 1 1 0 0 1 1.2 1.2A6.7 6.7 0 1 0 20.2 12.9a1 1 0 0 1 1.2 1.2Z"/></svg>'
      // Sun for OFF
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM3 11h1a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2Zm16 0h2a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2ZM5.6 4.6a1 1 0 0 1 1.4 0L8 5.6a1 1 0 0 1-1.4 1.4L5.6 6a1 1 0 0 1 0-1.4Zm10.8 12.8a1 1 0 0 1 1.4 0l1 1a1 1 0 1 1-1.4 1.4l-1-1a1 1 0 0 1 0-1.4Zm1.4-12.8a1 1 0 0 1 0 1.4L17 7a1 1 0 0 1-1.4-1.4l0 0 1.8-1.8a1 1 0 0 1 1.4 0ZM6.4 17.4a1 1 0 0 1 0 1.4L4.6 20.6a1 1 0 1 1-1.4-1.4L5 17.4a1 1 0 0 1 1.4 0Z"/></svg>';
    // Label
    const label = document.createElement("span");
    label.className = "dim-label";
    label.textContent = isOn ? "Light" : "Dark";
    btn.append(icon, label);
    btn.setAttribute("aria-pressed", isOn ? "true" : "false");
    btn.setAttribute("title", isOn ? "Switch to Light" : "Switch to Dark");
  }

  const html = document.documentElement;
  const mql = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  function osPrefersDark() { return mql ? mql.matches : false; }
  function savedPref() { return localStorage.getItem(KEY); } // "on" | "off" | null

  // Is dim active right now?
  function isDimActive() {
    const saved = savedPref();
    if (saved === "on") return true;
    if (saved === "off") return false;
    // No override: auto-dim only if html has .auto-dim and OS prefers dark
    return html.classList.contains("auto-dim") && osPrefersDark();
  }

  function applyState() {
    const on = isDimActive();
    // Normalize classes
    html.classList.toggle("theme-dim", on);
    html.classList.toggle("theme-dim-off", !on && savedPref() === "off");
    renderButton(on);
  }

  // Initial render
  applyState();

  // Toggle handler
  btn.addEventListener("click", function () {
    const currentlyOn = isDimActive();
    if (currentlyOn) {
      localStorage.setItem(KEY, "off");
      html.classList.remove("theme-dim");
      html.classList.add("theme-dim-off");
    } else {
      localStorage.setItem(KEY, "on");
      html.classList.add("theme-dim");
      html.classList.remove("theme-dim-off");
    }
    renderButton(!currentlyOn);
  });

  // Listen for OS theme changes only when there is no saved override
  if (mql && mql.addEventListener) {
    mql.addEventListener("change", function () {
      if (savedPref() == null) applyState();
    });
  } else if (mql && mql.addListener) {
    mql.addListener(function () {
      if (savedPref() == null) applyState();
    });
  }

  // Idle fade support (optional; harmless if CSS not present)
  let idleTimer;
  const IDLE_MS = 3000;
  function wake() {
    btn.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => btn.classList.add("is-idle"), IDLE_MS);
  }
  ["mousemove","keydown","touchstart","pointerdown","focus"].forEach(evt => {
    window.addEventListener(evt, wake, { passive: true });
  });
  wake();
})();