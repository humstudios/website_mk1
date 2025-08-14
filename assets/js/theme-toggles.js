/* Hum Studios — Single-Button Theme Toggle (Light → Dark → Darker)
   - Floats bottom-left as a frosted pill using the existing .theme-switch styles.
   - Cycles the 'display-mode' localStorage key through: light → dark → dark+dim → light
   - Defaults to 'light' on first visit (if no stored preference).
   - Works without any markup. If #theme-toggle exists, it will be replaced by this control.
*/

(function(){
  'use strict';

  var STORAGE_KEY = 'display-mode';
  var CYCLE = ['light','dark','dark+dim'];
  var LABELS = { 'light':'Light', 'dark':'Dark', 'dark+dim':'Darker' };

  // Icons (inline SVG)
  function svgSun(){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4zm7 8a7 7 0 1 1-14 0 7 7 0 0 1 14 0zm2 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1zM12 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zM3 11H2a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2zm1.64-6.36a1 1 0 0 1 1.41 0l.71.71a1 1 0 1 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM4.05 18.34a1 1 0 0 1 1.41 0l.71.71a1 1 0 1 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM18.24 4.05a1 1 0 0 1 1.41 0l.71.71a1 1 0 1 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM18.83 18.34a1 1 0 0 1 1.41 0l.71.71a1 1 0 1 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41z"/></svg>'; }
  function svgMoon(){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'; }

  function iconFor(mode){ return (mode==='light') ? svgSun() : svgMoon(); }

  function getMode(){
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v) return v;
    } catch(e){}
    return 'light'; // always default to light, no OS preference
  }

  function setMode(mode){
    try { localStorage.setItem(STORAGE_KEY, mode); } catch(e){}
    apply(mode);
  }

  function nextMode(current){
    var i = CYCLE.indexOf(current);
    return CYCLE[(i+1) % CYCLE.length];
  }

  function apply(mode){
    var html = document.documentElement;
    if (mode === 'light') {
      html.setAttribute('data-theme','light');
      html.classList.remove('theme-dim');
    } else if (mode === 'dark') {
      html.setAttribute('data-theme','dark');
      html.classList.remove('theme-dim');
    } else { // 'dark+dim'
      html.setAttribute('data-theme','dark');
      html.classList.add('theme-dim');
    }
    html.dataset.themeMode = mode;
  }

  // Build UI: .theme-switch container + one .theme-switch__btn
  function buildUI(){
    var wrap = document.createElement('div');
    wrap.className = 'theme-switch';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-switch__btn';
    btn.setAttribute('aria-label','Theme');
    wrap.appendChild(btn);
    return {wrap:wrap, btn:btn};
  }

  function updateButton(btn, mode){
    var nxt = nextMode(mode);
    btn.innerHTML = iconFor(nxt) + '<span class="theme-switch__label">' + LABELS[nxt] + '</span>';
    // Use an action label describing the result of activating the button
    btn.removeAttribute('aria-pressed');
    btn.setAttribute('aria-label', 'Switch to ' + LABELS[nxt]);
    btn.setAttribute('title', 'Switch to ' + LABELS[nxt]);
  }

  // Auto-hide like the segmented control
  var HIDE_AFTER_MS = 2000;
  var PROXIMITY_PX = 120;
  var hideTimer = null;
  var pointerCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  function scheduleHide(el){
    if (pointerCoarse) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function(){ el.classList.add('is-hidden'); }, HIDE_AFTER_MS);
  }
  function nearBy(el, x, y){
    var r = el.getBoundingClientRect();
    return x>=r.left-PROXIMITY_PX && x<=r.right+PROXIMITY_PX && y>=r.top-PROXIMITY_PX && y<=r.bottom+PROXIMITY_PX;
  }
  function wireAutohide(el){
    if (pointerCoarse) return;
    scheduleHide(el);
    document.addEventListener('mousemove', function(e){
      if (nearBy(el, e.clientX, e.clientY)){
        if (el.classList.contains('is-hidden')) el.classList.remove('is-hidden');
        scheduleHide(el);
      }
    }, {passive:true});
    el.addEventListener('mouseenter', function(){ el.classList.remove('is-hidden'); clearTimeout(hideTimer); });
    el.addEventListener('mouseleave', function(){ scheduleHide(el); });
    el.addEventListener('focusin', function(){ el.classList.remove('is-hidden'); clearTimeout(hideTimer); });
    el.addEventListener('focusout', function(){ scheduleHide(el); });
  }

  function mount(){
    // Live region for announcements
    var live = document.createElement('div');
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    live.style.position = 'absolute';
    live.style.width = '1px';
    live.style.height = '1px';
    live.style.margin = '-1px';
    live.style.border = '0';
    live.style.padding = '0';
    live.style.clip = 'rect(0 0 0 0)';
    live.style.overflow = 'hidden';
    live.id = 'theme-announce';
    document.body.appendChild(live);
    var current = getMode();
    apply(current);

    var existing = document.getElementById('theme-toggle');
    var ui = buildUI();
    updateButton(ui.btn, current);

    ui.btn.addEventListener('click', function(){
      var cur = getMode();
      var nxt = nextMode(cur);
      setMode(nxt);
      updateButton(ui.btn, nxt);
      var liveEl = document.getElementById('theme-announce');
      if (liveEl) { liveEl.textContent = LABELS[nxt] + ' mode enabled'; }
      scheduleHide(ui.wrap);
    });

    if (existing && existing.parentNode){
      // Replace placeholder but CSS will still force fixed & frosted (via site CSS)
      ui.wrap.setAttribute('data-inline','true'); // harmless due to overriding CSS
      existing.replaceWith(ui.wrap);
    } else {
      document.body.appendChild(ui.wrap);
    }

    wireAutohide(ui.wrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();