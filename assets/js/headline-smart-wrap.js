// headline-smart-wrap.js
// v1.0 — column-friendly, hyphen-free headline helper
// Usage:
//   <script defer src="/assets/js/headline-smart-wrap.js"
//           data-selector="h1.smart-wrap, h2.smart-wrap, h3.smart-wrap"
//           data-glue="a|an|the|to|of|in|on|at|for|and|or|vs"
//           data-wbr-after="/–—:"
//   ></script>

(() => {
  const script = document.currentScript;
  const SELECTOR   = script?.dataset.selector || 'h1.smart-wrap, h2.smart-wrap, h3.smart-wrap';
  const GLUE_WORDS = new RegExp('^(' + (script?.dataset.glue || 'a|an|the|to|of|in|on|at|for|and|or|vs') + ')$', 'i');
  const WBR_AFTER  = new RegExp('[' + (script?.dataset.wbrAfter || '/–—:') + ']' );

  function shouldSkip(node) {
    // Skip inside elements explicitly marked as no-wrap regions
    let el = node.parentElement;
    while (el) {
      if (el.classList && (el.classList.contains('nb') || el.classList.contains('nowrap'))) return true;
      el = el.parentElement;
    }
    return false;
  }

  function glueShortWords(text) {
    // Keep short function words with the next word (NBSP)
    // e.g., "How to complain" -> "How to complain"
    const parts = text.split(/\s+/);
    if (parts.length < 2) return text;
    for (let i = 0; i < parts.length - 1; i++) {
      if (GLUE_WORDS.test(parts[i])) parts[i] = parts[i] + '\u00A0';
      else parts[i] = parts[i] + ' ';
    }
    return parts.join('');
  }

  function splitTextNodeAt(node, index) {
    const tail = node.splitText(index);
    return tail;
  }

  function insertWbrAfterPunctuation(textNode) {
    // Insert <wbr> nodes after friendly punctuation (/, en/em dash, colon).
    const text = textNode.nodeValue;
    const matches = [];
    for (let i = 0; i < text.length; i++) {
      if (WBR_AFTER.test(text[i])) matches.push(i + 1); // after the punctuation
    }
    if (!matches.length) return;
    let offset = 0;
    const parent = textNode.parentNode;
    matches.forEach((pos, idx) => {
      const splitPos = pos + offset;
      if (splitPos < textNode.nodeValue.length) {
        const after = splitTextNodeAt(textNode, splitPos);
        const w = document.createElement('wbr');
        parent.insertBefore(w, after);
        textNode = after; // continue after the inserted position
        offset = 0;
      }
    });
  }

  function processTextNodes(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_SKIP;
        if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      // First pass: glue short words to the next word via NBSP
      n.nodeValue = glueShortWords(n.nodeValue.replace(/\s+/g, ' '));
    });
    // Second pass: friendly <wbr> insertions (operate on original nodes to preserve DOM)
    nodes.forEach(insertWbrAfterPunctuation);
  }

  function processHeadings(root) {
    const els = root.querySelectorAll(SELECTOR);
    els.forEach(h => {
      if (h.hasAttribute('data-smartwrap-processed')) return;
      processTextNodes(h);
      h.setAttribute('data-smartwrap-processed', '1');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => processHeadings(document));
  } else {
    processHeadings(document);
  }

  // Optional: watch for dynamically added headings
  const mo = new MutationObserver(muts => {
    for (const m of muts) {
      m.addedNodes && m.addedNodes.forEach(node => {
        if (node.nodeType === 1) processHeadings(node);
      });
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
