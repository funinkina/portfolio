// Homepage interactions: local clock, stat counters, highlight tilt, copy email.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Local clock beside the location, ticking on the minute.
  var clock = document.querySelector('.local-time');
  if (clock) {
    var fmt = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: '2-digit', timeZone: clock.dataset.tz, timeZoneName: 'short'
    });
    var tick = function () {
      var now = new Date();
      clock.dateTime = now.toISOString();
      clock.textContent = fmt.format(now).replace('GMT+5:30', 'IST');
      setTimeout(tick, 60000 - (now % 60000));
    };
    tick();
    clock.hidden = false;
  }

  // Stats count up once, the first time they scroll into view.
  var counters = [].filter.call(document.querySelectorAll('[data-count]'), function (el) {
    return el.dataset.count >= 10;
  });
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var run = function (el) {
      var end = +el.dataset.count, t0 = performance.now();
      el.style.minWidth = String(end).length + 'ch';
      (function step(t) {
        var p = Math.min((t - t0) / 1000, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        run(e.target);
      });
    }, { threshold: 1 });
    counters.forEach(function (el) { io.observe(el); });
  }

  // Highlight cards lean a couple of degrees toward the pointer, desktop only.
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.highlight').forEach(function (card) {
      var frame = 0;
      card.addEventListener('pointermove', function (e) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          card.style.setProperty('--rx', ((0.5 - y) * 4).toFixed(2) + 'deg');
          card.style.setProperty('--ry', ((x - 0.5) * 4).toFixed(2) + 'deg');
          card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
        });
      });
      card.addEventListener('pointerleave', function () {
        cancelAnimationFrame(frame);
        card.style.removeProperty('--rx');
        card.style.removeProperty('--ry');
      });
    });
  }

  // Copy email: swap the icon to a check for a moment, announce via the label.
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var icon = btn.querySelector('.material-symbols-outlined');
    var label = btn.getAttribute('aria-label');
    var timer = 0;
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(btn.dataset.copy).then(function () {
        icon.textContent = 'check';
        btn.classList.add('is-copied');
        btn.setAttribute('aria-label', 'Copied');
        btn.title = 'Copied';
        clearTimeout(timer);
        timer = setTimeout(function () {
          icon.textContent = 'content_copy';
          btn.classList.remove('is-copied');
          btn.setAttribute('aria-label', label);
          btn.title = label;
        }, 1600);
      });
    });
  });
})();
