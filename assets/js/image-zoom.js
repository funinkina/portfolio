// Click a post image to view it larger in a native <dialog>; Esc or a click closes it.
(function () {
  var imgs = document.querySelectorAll('.is-article main img, .post-cover img');
  if (!imgs.length) return;

  var dialog = document.createElement('dialog');
  dialog.className = 'img-zoom';
  dialog.setAttribute('aria-label', 'Enlarged image');
  var big = document.createElement('img');
  dialog.appendChild(big);
  document.body.appendChild(dialog);

  dialog.addEventListener('click', function () { dialog.close(); });

  imgs.forEach(function (img) {
    if (img.closest('a')) return;
    img.classList.add('is-zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    function open() {
      big.src = img.dataset.zoom || img.currentSrc || img.src;
      big.alt = img.alt;
      dialog.showModal();
    }
    img.addEventListener('click', open);
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
})();
