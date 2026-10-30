/* Noe Castillo portfolio: drop-in animations.
   Add before </body> in every page:  <script src="animations.js" defer></script>
   Safe to remove at any time. It only adds classes and never changes your content. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // visitors who prefer less motion get the page as-is

  var css = `
  .nc-progress{position:fixed;top:0;left:0;height:4px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:#e4572e;z-index:9999;pointer-events:none}

  /* hero headline: words rise in one after another */
  .nc-word{display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.08em}
  .nc-word>span{display:inline-block;transform:translateY(110%) rotate(4deg);animation:nc-rise .9s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(var(--i)*70ms + 150ms)}
  @keyframes nc-rise{to{transform:none}}

  /* scroll reveals */
  .nc-reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.8,.2,1);transition-delay:var(--d,0ms)}
  .nc-reveal.nc-in{opacity:1;transform:none}

  /* spinning asterisks */
  .nc-spin{display:inline-block;animation:nc-spin 8s linear infinite}
  @keyframes nc-spin{to{transform:rotate(360deg)}}

  /* project cards */
  .nc-card{transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s ease;will-change:transform}
  .nc-card:hover,.nc-card:focus-visible{transform:translateY(-8px) rotate(-.6deg);box-shadow:0 18px 30px rgba(0,0,0,.14)}

  /* nav underline slide */
  .nc-nav a{background:linear-gradient(currentColor,currentColor) 0 100%/0 2px no-repeat;transition:background-size .3s ease}
  .nc-nav a:hover,.nc-nav a:focus-visible{background-size:100% 2px}

  /* resume / PDF links nudge */
  .nc-pdf{transition:transform .25s ease}
  .nc-pdf:hover{transform:translateY(-3px)}
  `;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* scroll progress bar */
  var bar = document.createElement('div');
  bar.className = 'nc-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* hero headline: split into words, keep <em> and other tags intact */
  var h1 = document.querySelector('h1');
  if (h1) {
    var i = 0;
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'), s = document.createElement('span');
            w.className = 'nc-word';
            s.textContent = part;
            s.style.setProperty('--i', i++);
            w.appendChild(s);
            frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) { split(n); }
      });
    })(h1);
  }

  /* spin every ✳ outside the headline */
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  var hits = [], t;
  while ((t = walker.nextNode())) {
    var p = t.parentNode.nodeName;
    if (t.nodeValue.indexOf('✳') > -1 && p !== 'SCRIPT' && p !== 'STYLE' && p !== 'TITLE') hits.push(t);
  }
  hits.forEach(function (node) {
    var frag = document.createDocumentFragment();
    node.nodeValue.split('✳').forEach(function (chunk, k, arr) {
      frag.appendChild(document.createTextNode(chunk));
      if (k < arr.length - 1) {
        var sp = document.createElement('span');
        sp.className = 'nc-spin';
        sp.setAttribute('aria-hidden', 'true');
        sp.textContent = '✳';
        frag.appendChild(sp);
      }
    });
    node.parentNode.replaceChild(frag, node);
  });

  /* cards: any link to a project page inside #work */
  var cards = document.querySelectorAll('#work a[href$=".html"]');
  Array.prototype.forEach.call(cards, function (c) { c.classList.add('nc-card'); });

  /* nav */
  var nav = document.querySelector('header nav, nav');
  if (nav) nav.classList.add('nc-nav');

  /* PDF links: open the résumé in a new tab */
  Array.prototype.forEach.call(document.querySelectorAll('a[href$=".pdf"]'), function (a) {
    a.classList.add('nc-pdf');
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* scroll reveals with a small stagger inside each group */
  var targets = [];
  document.querySelectorAll('main h2, main h3, main section p, main section ul, #about p, #contact a, #play > *, .nc-card').forEach(function (el) {
    if (h1 && h1.contains(el)) return;
    if (targets.indexOf(el) === -1) targets.push(el);
  });
  targets.forEach(function (el) {
    var siblings = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
    el.style.setProperty('--d', Math.min(siblings, 5) * 90 + 'ms');
    el.classList.add('nc-reveal');
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('nc-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('nc-in'); });
  }
})();
