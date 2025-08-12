(function () {
  const KEY = "hum:dim"; // "on" | "off"
  const IDLE_DELAY = 2000; // ms before fading the button
  const PROXIMITY_PX = 96; // px radius to wake on pointer proximity

  const html = document.documentElement;
  const btn = document.getElementById("dim-toggle");
  if (!btn) return;

  let idleTimer = null;

  // --- helpers ---------------------------------------------------------------
  const mqDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

  function savedPref() {
    try { return localStorage.getItem(KEY); } catch { return null; }
  }
  function setSavedPref(v) {
    try { localStorage.setItem(KEY, v); } catch {}
  }

  function effectiveDimActive() {
    const val = getComputedStyle(document.documentElement).getPropertyValue("--dim-strength").trim();
    const n = parseFloat(val || "0");
    return !isNaN(n) && n > 0.001;
  }

  function setStateOn() {
    html.classList.add("theme-dim");
    html.classList.remove("theme-dim-off");
    setSavedPref("on");
    render();
  }

  function setStateOff() {
    html.classList.add("theme-dim-off");
    html.classList.remove("theme-dim");
    setSavedPref("off");
    render();
  }

  function createIcon(mode) {
    if (mode === "dark") {
      // Moon
      return '<svg class="dim-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 12.79A9 9 0 0 1 11.21 3c-.28 0-.55.02-.82.05A1 1 0 0 0 9.7 4.78A7 7 0 1 0 19.22 14.3a1 1 0 0 0 1.73-.47c.03-.27.05-.54.05-.82"/></svg>';
    }
    // Sun
    return '<svg class="dim-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8l1.8-1.8ZM1 13h3v-2H1v2Zm10 10h2v-3h-2v3ZM4.84 20.83l1.79 1.8l1.8-1.8l-1.8-1.79l-1.79 1.79ZM20 13h3v-2h-3v2ZM16.24 4.84l1.8-1.79l1.79 1.79l-1.79 1.8l-1.8-1.8ZM11 1h2v3h-2V1Zm1 6a5 5 0 1 0 0 10a5 5 0 0 0 0-10Zm6.36 9.36l1.79 1.8l-1.79 1.79l-1.8-1.79l1.8-1.8Z"/></svg>';
  }

  function scheduleIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!btn.matches(":hover") && document.activeElement !== btn) {
        btn.classList.add("is-idle");
      }
    }, IDLE_DELAY);
  }

  function wakeNow() {
    btn.classList.remove("is-idle");
    scheduleIdle();
  }

  function render() {
    const dimActive = effectiveDimActive();
    const labelText = dimActive ? "Light" : "Dark";
    const icon = createIcon(dimActive ? "dark" : "light");

    // Rebuild contents to avoid duplicates
    btn.innerHTML = icon + '<span class="dim-label">' + labelText + '</span>';
    btn.setAttribute("aria-pressed", dimActive ? "true" : "false");

    // Ensure we actually start the idle timer even on touch-only devices
    btn.classList.remove("is-idle");
    scheduleIdle();
  }

  function pointerNearButton(evt) {
    const r = btn.getBoundingClientRect();
    const x = evt.clientX != null ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : null);
    const y = evt.clientY != null ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : null);
    if (x == null || y == null) return false;
    const left = r.left - PROXIMITY_PX;
    const top = r.top - PROXIMITY_PX;
    const right = r.right + PROXIMITY_PX;
    const bottom = r.bottom + PROXIMITY_PX;
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  // --- events ---------------------------------------------------------------
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    effectiveDimActive() ? setStateOff() : setStateOn();
  });

  // Wake on focus/hover of the button itself
  btn.addEventListener("mouseenter", wakeNow);
  btn.addEventListener("focusin", wakeNow);

  // Proximity wake for mouse/touch
  window.addEventListener("pointermove", (evt) => { if (pointerNearButton(evt)) wakeNow(); }, { passive: true });
  window.addEventListener("touchstart", (evt) => { if (pointerNearButton(evt)) wakeNow(); }, { passive: true });

  // General activity also restarts the idle timer
  window.addEventListener("scroll", scheduleIdle, { passive: true });
  window.addEventListener("resize", scheduleIdle);
  window.addEventListener("keydown", scheduleIdle);
  window.addEventListener("pointerdown", scheduleIdle, { passive: true });

  // Update label/icon if OS theme flips (and no explicit override)
  const onMqChange = () => render();
  if (mqDark && mqDark.addEventListener) mqDark.addEventListener("change", onMqChange);
  else if (mqDark && mqDark.addListener) mqDark.addListener(onMqChange);

  // --- init -----------------------------------------------------------------
  const saved = savedPref();
  if (saved === "on") setStateOn();
  else if (saved === "off") setStateOff();
  else render(); // no saved pref: render based on current CSS/OS

})();