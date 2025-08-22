(function(){
  'use strict';
  if (window.__widontInit) return; // prevent double-run
  window.__widontInit = true;

  function widont(selector){
    document.querySelectorAll(selector).forEach(function(el){
      if (el.childElementCount > 0) return; // don't touch headings with inner markup
      var t = (el.textContent || '').trim();
      var i = t.lastIndexOf(' ');
      if (i > -1) el.innerHTML = t.slice(0, i) + '&nbsp;' + t.slice(i + 1);
    });
  }

  function run(){
    widont('h1, h2');
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // Optionally expose for other components
  window.widont = widont;
})();