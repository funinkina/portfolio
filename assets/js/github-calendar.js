// GitHub contribution calendar (renders from server-injected #gh-data).
(function () {
  var COLORS = {
    dark:  ['#1e1e1e', '#0e4429', '#006d32', '#26a641', '#39d353'],
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
  };

  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var CELL = 11, GAP = 3, STEP = 14, LABEL_H = 20;

  function getTheme() {
    return window.themeUtil.getResolved();
  }

  var LEVEL_LABEL = ['No contributions', 'Low activity', 'Moderate activity', 'High activity', 'Very high activity'];

  function buildWeeks(contributions) {
    var map = {};
    contributions.forEach(function (c) { map[c.date] = c; });

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var start = new Date(today);
    start.setDate(start.getDate() - 52 * 7 + 1);
    start.setDate(start.getDate() - start.getDay());

    var weeks = [], cur = new Date(start);
    while (cur <= today) {
      var week = [];
      for (var d = 0; d < 7; d++) {
        if (cur > today) break;
        var ds = cur.getFullYear() + '-' +
          (cur.getMonth() < 9 ? '0' : '') + (cur.getMonth() + 1) + '-' +
          (cur.getDate() < 10 ? '0' : '') + cur.getDate();
        var c = map[ds] || { intensity: 0, count: 0 };
        week.push({ date: ds, intensity: c.intensity, count: c.count || 0 });
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  }

  function renderSVG(weeks, theme) {
    var colors = COLORS[theme];
    var W = weeks.length * STEP - GAP;
    var H = 7 * STEP - GAP + LABEL_H;

    var out = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">';

    var lastMonth = -1;
    for (var w = 0; w < weeks.length; w++) {
      if (!weeks[w].length) continue;
      var m = parseInt(weeks[w][0].date.slice(5, 7)) - 1;
      if (m !== lastMonth) {
        out += '<text x="' + (w * STEP) + '" y="12" font-size="10" fill="currentColor" opacity="0.5" font-family="inherit">' + MONTHS[m] + '</text>';
        lastMonth = m;
      }
    }

    for (var w = 0; w < weeks.length; w++) {
      var week = weeks[w];
      for (var d = 0; d < week.length; d++) {
        var day = week[d];
        var x = w * STEP, y = d * STEP + LABEL_H;
        var n = day.count;
        var label = (n > 0 ? n + (n === 1 ? ' contribution' : ' contributions') : 'No contributions') + ' on ' + day.date;
        out += '<rect x="' + x + '" y="' + y + '" width="' + CELL + '" height="' + CELL +
          '" rx="2" ry="2" fill="' + colors[day.intensity] + '" data-label="' + label + '"></rect>';
      }
    }

    out += '</svg>';
    return out;
  }

  function renderLegend(theme) {
    var colors = COLORS[theme];
    var s = '<span class="gh-legend"><span>Less</span>';
    for (var i = 0; i < colors.length; i++) {
      s += '<svg width="11" height="11" class="gh-legend-sq"><rect width="11" height="11" rx="2" ry="2" fill="' +
        colors[i] + '" data-label="' + LEVEL_LABEL[i] + '"></rect></svg>';
    }
    s += '<span>More</span></span>';
    return s;
  }

  var ghDiv = document.getElementById('gh-data');
  var raw = [];
  var cachedTotal = 0;
  if (ghDiv) {
    try { raw = JSON.parse(ghDiv.getAttribute('data-entries') || '[]'); } catch (e) {}
    cachedTotal = parseInt(ghDiv.getAttribute('data-total') || '0') || 0;
  }

  var cachedWeeks = null;
  var tip = null;

  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;' +
      'background:#1b1f23;color:#fff;font-size:12px;line-height:1.4;' +
      'padding:5px 8px;border-radius:6px;white-space:nowrap;opacity:0;' +
      'transition:opacity .1s;box-shadow:0 1px 4px rgba(0,0,0,.3)';
    document.body.appendChild(tip);
    return tip;
  }

  function attachTip(container) {
    container.addEventListener('mouseover', function (e) {
      var t = e.target;
      if (!t || t.tagName !== 'rect') return;
      var label = t.getAttribute('data-label');
      if (!label) return;
      var el = ensureTip();
      el.textContent = label;
      el.style.opacity = '1';
      var r = t.getBoundingClientRect();
      el.style.left = (r.left + r.width / 2 - el.offsetWidth / 2) + 'px';
      el.style.top = (r.top - el.offsetHeight - 6) + 'px';
    });
    container.addEventListener('mouseout', function (e) {
      if (e.target && e.target.tagName === 'rect' && tip) tip.style.opacity = '0';
    });
  }

  function draw() {
    if (!cachedWeeks) return;
    var svg = renderSVG(cachedWeeks, getTheme());
    var container = document.getElementById('github-calendar-container');
    if (container) {
      container.innerHTML = svg;
      if (!container.dataset.tipBound) {
        attachTip(container);
        container.dataset.tipBound = '1';
      }
    }
    var totalEl = document.getElementById('github-contrib-total');
    if (totalEl) totalEl.textContent = cachedTotal.toLocaleString();
    var legendEl = document.getElementById('github-contrib-legend');
    if (legendEl) {
      legendEl.innerHTML = renderLegend(getTheme());
      if (!legendEl.dataset.tipBound) {
        attachTip(legendEl);
        legendEl.dataset.tipBound = '1';
      }
    }
  }

  if (!raw.length) {
    var el = document.getElementById('github-calendar-container');
    if (el) el.innerHTML = '<p style="color:var(--text-dim);font-size:.9rem;margin:0">Could not load contributions.</p>';
  } else {
    cachedWeeks = buildWeeks(raw.map(function (c) { return { date: c.d, intensity: c.l, count: c.c || 0 }; }));
    draw();
    new MutationObserver(function (ms) {
      ms.forEach(function (m) { if (m.attributeName === 'data-theme') draw(); });
    }).observe(document.documentElement, { attributes: true });
  }
})();
