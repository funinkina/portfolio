// /uses: category filter, fetch rows that jump to a filter, alias terminal, package explorer.
(function () {
  function radios(name) { return [].slice.call(document.querySelectorAll('input[name="' + name + '"]')); }
  function picked(name) { return document.querySelector('input[name="' + name + '"]:checked').value; }

  // Toolbox: filter cards by category.
  var cards = document.querySelectorAll('.uses-card');
  function filterTools() {
    var cat = picked('uses-cat');
    cards.forEach(function (c) { c.hidden = cat && c.dataset.cat !== cat; });
  }
  radios('uses-cat').forEach(function (r) { r.addEventListener('change', filterTools); });

  document.querySelectorAll('.uses-fetch-rows a[data-filter]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = document.querySelector('input[name="uses-cat"][value="' + a.dataset.filter + '"]');
      r.checked = true;
      filterTools();
    });
  });

  // Alias terminal: prefix-filter as you type, Tab completes the first match.
  var term = document.querySelector('.uses-term');
  if (term) {
    var input = term.querySelector('input');
    var rows = [].slice.call(term.querySelectorAll('li[data-name]'));
    var empty = term.querySelector('.uses-term-empty');
    var out = term.querySelector('.uses-term-out');
    var matches = rows;
    var filterAliases = function () {
      var q = input.value.trim().toLowerCase();
      matches = rows.filter(function (li) {
        var hit = li.dataset.name.toLowerCase().indexOf(q) === 0;
        li.hidden = !hit;
        li.classList.toggle('is-exact', !!q && li.dataset.name === q);
        return hit;
      });
      empty.hidden = matches.length > 0;
      empty.textContent = 'fish: Unknown command: ' + q;
      out.scrollTop = 0;
    };
    input.addEventListener('input', filterAliases);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && input.value && matches.length) {
        e.preventDefault();
        input.value = matches[0].dataset.name;
        filterAliases();
      } else if (e.key === 'Escape') {
        input.value = '';
        filterAliases();
      }
    });
    term.addEventListener('click', function (e) {
      if (!window.getSelection().toString()) input.focus({ preventScroll: true });
      var li = e.target.closest('li[data-name]');
      if (li) { input.value = li.dataset.name; filterAliases(); }
    });
  }

  // Packages: text search + source toggle, with a live count.
  var q = document.querySelector('.uses-pkg-q');
  if (q) {
    var pkgs = [].slice.call(document.querySelectorAll('.uses-pkgs li'));
    var count = document.querySelector('.uses-pkg-count');
    var filterPkgs = function () {
      var text = q.value.trim().toLowerCase(), src = picked('uses-src'), shown = 0;
      pkgs.forEach(function (li) {
        var hit = (!src || li.dataset.src === src) && li.textContent.indexOf(text) !== -1;
        li.hidden = !hit;
        if (hit) shown++;
      });
      count.textContent = shown === pkgs.length ? '' : 'Showing ' + shown + ' of ' + pkgs.length;
    };
    q.addEventListener('input', filterPkgs);
    radios('uses-src').forEach(function (r) { r.addEventListener('change', filterPkgs); });
  }
})();
