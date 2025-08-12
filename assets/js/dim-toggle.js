(function () {
  const KEY = "hum:dim"; // "on" | "off" | null
  const IDLE_MS = 3000;
  const html = document.documentElement;
  const btn = document.getElementById("dim-toggle");
  if (!btn) return;

  const mql = window.matchMedia("(prefers-color-scheme: dark)");

  // Ensure base classes exist (auto-dim can be set on <html> in markup)
  // Restore user choice
  const saved = localStorage.getItem(KEY);
  if (saved === "on") {
    html.classList.add("theme-dim");
    html.classList.remove("theme-dim-off");
  } else if (saved === "off") {
    html.classList.add("theme-dim-off");
    html.classList.remove("theme-dim");
  }

  // Helpers
  const has = (c) => html.classList.contains(c);
  const setPressed = (on) => btn.setAttribute("aria-pressed", on ? "true" : "false");

  const sunSVG = '<svg class="icon-sun" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 4.5a1 1 0 0 1 1-1h0a1 1 0 1 1-2 0h0a1 1 0 0 1 1-1zm0 16a1 1 0 0 1 1 1h0a1 1 0 1 1-2 0h0a1 1 0 0 1 1-1zM4.5 12a1 1 0 0 1-1 1h0a1 1 0 1 1 0-2h0a1 1 0 0 1 1 1zm16 0a1 1 0 0 1 1-1h0a1 1 0 1 1 0 2h0a1 1 0 0 1-1-1zM6.2 6.2a1 1 0 1 1-1.4-1.4h0a1 1 0 1 1 1.4 1.4zm13 13a1 1 0 1 1-1.4-1.4h0a1 1 0 1 1 1.4 1.4zM17.8 6.2a1 1 0 0 1 1.4-1.4h0a1 1 0 1 1-1.4 1.4zM4.6 19.4a1 1 0 0 1 1.4 1.4h0a1 1 0 1 1-1.4-1.4zM12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8z" fill="currentColor"/></svg>';
  const moonSVG = '<svg class="icon-moon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M21 12.8A9 9 0 0 1 11.2 3a7 7 0 1 0 9.8 9.8z" fill="currentColor"/></svg>';

  function effectiveDimOn() {
    const userOn = has("theme-dim");
    const userOff = has("theme-dim-off");
    const autoDim = html.classList.contains("auto-dim") && mql.matches;
    return userOn || (!userOff && autoDim);
  }

  function render() {
    // Build button content fresh each time
    const on = effectiveDimOn();
    const label = on ? "Light" : "Dark"; // shows current mode name
    const icon = on ? moonSVG : sunSVG;
    btn.innerHTML = '<span class="dim-icon" aria-hidden="true">' + icon + '</span><span class="dim-label">' + label + '</span>';
    setPressed(on);
  }

  function toggle() {
    // Wake button from idle when interacted
    wake();

    const on = effectiveDimOn();
    if (on) {
      // turn off (user override OFF)
      html.classList.remove("theme-dim");
      html.classList.add("theme-dim-off");
      localStorage.setItem(KEY, "off");
    } else {
      // turn on (user override ON)
      html.classList.add("theme-dim");
      html.classList.remove("theme-dim-off");
      localStorage.setItem(KEY, "on");
    }
    render();
  }

  // Idle fade logic
  let idleTimer;
  function armIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => btn.classList.add("is-idle"), IDLE_MS);
  }
  function wake() {
    btn.classList.remove("is-idle");
    armIdle();
  }

  // Events
  btn.addEventListener("click", toggle);
  btn.addEventListener("mouseenter", wake);
  btn.addEventListener("focusin", wake);
  btn.addEventListener("mouseleave", armIdle);
  btn.addEventListener("blur", armIdle);

  // Global “activity” wakes the button if the pointer is near it
  window.addEventListener("mousemove", function (e) {
    // If pointer is near bottom-left 160x100 zone, wake so it is readable
    if (e.clientX < 160 && (window.innerHeight - e.clientY) < 120) wake();
  }, { passive: true });
  window.addEventListener("touchstart", wake, { passive: true });

  // React to OS theme changes (if not overridden by user)
  mql.addEventListener("change", () => {
    render();
  });

  // Initial render & idle timer
  render();
  armIdle();
})();