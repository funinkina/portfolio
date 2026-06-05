// Scroll-triggered reveal animations for cards/rows.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var items = document.querySelectorAll('.blog-row, .project-card');
  if (!items.length || !window.IntersectionObserver) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  items.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(i * 40, 200) + 'ms';
    io.observe(el);
  });
})();
