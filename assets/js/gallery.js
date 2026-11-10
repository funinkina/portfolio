// Gallery lightbox (layouts/_default/gallery.html). The clicked tile morphs into the
// viewer via the View Transitions API; arrows slide between shots. Without VT support
// or with reduced motion it falls back to the dialog's CSS fade.
(function () {
  var tiles = [].slice.call(document.querySelectorAll('.tile'));
  var lb = document.querySelector('.lb');
  if (!tiles.length || !lb) return;
  var img = lb.querySelector('.lb-img');
  var spec = lb.querySelector('.lb-spec');
  var status = lb.querySelector('.lb-status');
  var root = document.documentElement;
  var cur = -1; // index being shown, or about to be (set before the transition runs)

  function thumb(i) { return tiles[i].querySelector('img'); }

  // Resolves once the transition (if any) has finished.
  function animate(kind, update) {
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update();
      return Promise.resolve();
    }
    root.dataset.lb = kind;
    // A newer transition may have replaced data-lb; only clear our own.
    return document.startViewTransition(update).finished.finally(function () {
      if (root.dataset.lb === kind) delete root.dataset.lb;
    });
  }

  function show(i) {
    var t = thumb(i);
    // Start from the already-decoded thumbnail so the morph has pixels, then upgrade.
    img.src = t.currentSrc || t.src;
    img.alt = t.alt;
    img.width = t.getAttribute('width');
    img.height = t.getAttribute('height');
    spec.innerHTML = tiles[i].nextElementSibling.innerHTML;
    status.textContent = spec.querySelector('.shot-idx').textContent + ', ' + spec.querySelector('h2').textContent;
    var full = new Image();
    full.src = tiles[i].dataset.full;
    full.decode().then(function () { if (cur === i) img.src = full.src; }, function () {});
    history.replaceState(null, '', '#' + tiles[i].id);
  }

  function open(i) {
    var t = thumb(i);
    // A tile from an unfinished close may still hold the name; two holders abort the morph.
    tiles.forEach(function (_, j) { thumb(j).style.viewTransitionName = ''; });
    t.style.viewTransitionName = 'lb-shot';
    cur = i;
    animate('open', function () {
      t.style.viewTransitionName = '';
      show(i);
      lb.showModal();
    });
  }

  function close() {
    var t;
    animate('close', function () {
      t = thumb(cur);
      lb.close();
      tiles[cur].scrollIntoView({ block: 'nearest' });
      t.style.viewTransitionName = 'lb-shot';
      tiles[cur].focus({ preventScroll: true });
      history.replaceState(null, '', location.pathname);
    }).then(function () { t.style.viewTransitionName = ''; });
  }

  function step(d) {
    var n = cur = (cur + d + tiles.length) % tiles.length;
    animate(d > 0 ? 'next' : 'prev', function () { show(n); });
  }

  tiles.forEach(function (tile, i) {
    tile.addEventListener('click', function () { open(i); });
  });
  lb.querySelectorAll('[data-step]').forEach(function (b) {
    b.addEventListener('click', function () { step(+b.dataset.step); });
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lb-fig')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.open) return;
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });

  // Deep links open the photo; back/forward and reloads (stale hash) don't.
  var nav = performance.getEntriesByType('navigation')[0];
  var linked = tiles.findIndex(function (t) { return location.hash === '#' + t.id; });
  if (linked >= 0 && (!nav || nav.type === 'navigate')) open(linked);
})();
