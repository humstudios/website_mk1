/* Hum Studios — Unified Mobile Menu (binds late + a11y behaviors) */
(function(){
  if (window.__humMenuInit) return;           // safety: single init
  window.__humMenuInit = true;

  var btn, menu, bound=false, lastFocus=null, skipClickAway=false;
  var mq = window.matchMedia('(min-width: 768px)');

  function qs(s){ return document.querySelector(s); }
  function getBtn(){ return document.getElementById('hamburgerBtn') || qs('.hamburger'); }
  function getMenu(){ return document.getElementById('mobileMenu')   || qs('.mobile-nav'); }

  function isOpen(){ return menu && menu.classList.contains('show'); }

  function setState(open){
    if (!menu || !btn) return;
    if (open) {
      menu.hidden = false;
      menu.setAttribute('aria-hidden','false');
      btn.setAttribute('aria-expanded','true');
      menu.classList.add('show');               // CSS shows .mobile-nav.show
      if (document.activeElement === btn) lastFocus = btn;
      var f = menu.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
      if (f.length) f[0].focus();
      document.addEventListener('keydown', onKeydown, true);
      document.addEventListener('click', onDocClick, true);
    } else {
      menu.classList.remove('show');
      menu.setAttribute('aria-hidden','true');
      menu.hidden = true;
      btn.setAttribute('aria-expanded','false');
      document.removeEventListener('keydown', onKeydown, true);
      document.removeEventListener('click', onDocClick, true);
      if (lastFocus) btn.focus();
    }
  }

  function onKeydown(e){
    if (e.key === 'Escape') { setState(false); return; }
    if (e.key === 'Tab' && isOpen()) {
      var f = Array.from(menu.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'));
      if (!f.length) return;
      var first=f[0], last=f[f.length-1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target === btn) {
      e.preventDefault(); setState(!isOpen());
    }
  }

  function onDocClick(e){
    if (skipClickAway) return;                  // ignore same-click as toggle
    if (!menu || !isOpen()) return;
    if (!menu.contains(e.target) && !btn.contains(e.target)) setState(false);
  }

  function bind(){
    if (bound) return true;
    btn = getBtn(); menu = getMenu();
    if (!btn || !menu) return false;

    // Force closed initial state
    menu.hidden = true;
    menu.setAttribute('aria-hidden','true');
    btn.setAttribute('aria-expanded','false');
    setState(false);

    // Click to toggle
    btn.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      skipClickAway = true;
      setState(!isOpen());
      setTimeout(function(){ skipClickAway = false; }, 0);
    }, false);

    // Close when crossing to desktop breakpoint
    function onMQ(e){ if (e.matches) setState(false); }
    if (mq.addEventListener) mq.addEventListener('change', onMQ);
    else mq.addListener(onMQ); // older Safari

    bound = true;
    return true;
  }

  // Try immediate bind; if not ready, wait for DOM + observe late-injected headers
  if (!bind()) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
    try {
      var attempts = 0;
      var mo = new MutationObserver(function(_, obs){
        attempts++;
        if (bind() || attempts > 5000) obs.disconnect();
      });
      mo.observe(document.documentElement, { childList:true, subtree:true });
    } catch(e){}
  }
})();
