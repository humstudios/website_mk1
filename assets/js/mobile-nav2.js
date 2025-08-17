// Mobile nav toggle (singleton init + late binding)
// If header partial also injects this script, guard against re-init.
(function(){
  if (window.__humMobileNavInit) return;
  window.__humMobileNavInit = true;

  function bind(){
    var btn = document.getElementById('hamburgerBtn');
    var menu = document.getElementById('mobileMenu');
    if(!btn || !menu) return false;

    function openMenu(){
      menu.hidden = false;
      menu.setAttribute('aria-hidden','false');
      menu.classList.add('show');
      btn.setAttribute('aria-expanded','true');
    }
    function closeMenu(){
      menu.hidden = true;
      menu.setAttribute('aria-hidden','true');
      menu.classList.remove('show');
      btn.setAttribute('aria-expanded','false');
    }
    function toggleMenu(){
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      if(isOpen){ closeMenu(); } else { openMenu(); }
    }

    // Avoid duplicate bindings
    if (!btn.__humBound) {
      btn.addEventListener('click', function(e){
        e.preventDefault();
        toggleMenu();
      });
      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape'){ closeMenu(); }
      });
      document.addEventListener('click', function(e){
        if(!menu.hidden){
          if(!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)){
            closeMenu();
          }
        }
      }, true);
      btn.__humBound = true;
    }
    return true;
  }

  // Try now
  if (bind()) return;

  // If elements are injected later (via includes.js), observe for them
  var mo = new MutationObserver(function(){
    if (bind()) { mo.disconnect(); }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

})();