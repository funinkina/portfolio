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
        var c = map[ds] || { intensity: 0 };
        week.push({ date: ds, intensity: c.intensity });
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
        out += '<rect x="' + x + '" y="' + y + '" width="' + CELL + '" height="' + CELL +
          '" rx="2" ry="2" fill="' + colors[day.intensity] + '">' +
          '<title>' + LEVEL_LABEL[day.intensity] + ' on ' + day.date + '</title>' +
          '</rect>';
      }
    }

    out += '</svg>';
    return out;
  }

  var ghDiv = document.getElementById('gh-data');
  var raw = [];
  var cachedTotal = 0;
  if (ghDiv) {
    try { raw = JSON.parse(ghDiv.getAttribute('data-entries') || '[]'); } catch (e) {}
    cachedTotal = parseInt(ghDiv.getAttribute('data-total') || '0') || 0;
  }

  var cachedWeeks = null;

  function draw() {
    if (!cachedWeeks) return;
    var svg = renderSVG(cachedWeeks, getTheme());
    var container = document.getElementById('github-calendar-container');
    if (container) container.innerHTML = svg;
    var totalEl = document.getElementById('github-contrib-total');
    if (totalEl) totalEl.textContent = cachedTotal.toLocaleString();
  }

  if (!raw.length) {
    var el = document.getElementById('github-calendar-container');
    if (el) el.innerHTML = '<p style="color:var(--text-dim);font-size:.9rem;margin:0">Could not load contributions.</p>';
  } else {
    cachedWeeks = buildWeeks(raw.map(function (c) { return { date: c.d, intensity: c.l }; }));
    draw();
    new MutationObserver(function (ms) {
      ms.forEach(function (m) { if (m.attributeName === 'data-theme') draw(); });
    }).observe(document.documentElement, { attributes: true });
  }
})();
