(function () {
  var input    = document.getElementById('section-search-input');
  var btn      = document.getElementById('section-search-btn');
  var clearBtn = document.getElementById('section-search-clear');
  if (!input || !btn) return;

  function filter() {
    var q = input.value.trim().toLowerCase();
    var items = document.querySelectorAll('.blog-row, .project-card');
    items.forEach(function (item) {
      var title = (item.dataset.title || '');
      var desc  = (item.dataset.description || '');
      item.style.display = (!q || title.includes(q) || desc.includes(q)) ? '' : 'none';
    });
    if (clearBtn) clearBtn.classList.toggle('visible', q.length > 0);
  }

  function clear() {
    input.value = '';
    filter();
    input.focus();
  }

  input.addEventListener('input', filter);
  btn.addEventListener('click', filter);
  if (clearBtn) clearBtn.addEventListener('click', clear);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') filter();
    if (e.key === 'Escape') clear();
  });

  // --- Sort ---
  var sortRadios = document.querySelectorAll('input[name="section-sort"]');
  var container  = document.querySelector('.blog-list-clean, .project-grid');

  if (sortRadios.length && container) {
    function applySort(mode) {
      var items = Array.prototype.filter.call(container.children, function (el) {
        return el.matches('.blog-row, .project-card');
      });
      items.sort(function (a, b) {
        if (mode === 'title-asc' || mode === 'title-desc') {
          var cmp = (a.dataset.title || '').localeCompare(b.dataset.title || '');
          return mode === 'title-asc' ? cmp : -cmp;
        }
        var da = parseInt(a.dataset.date || '0', 10);
        var db = parseInt(b.dataset.date || '0', 10);
        return mode === 'date-asc' ? da - db : db - da;
      });
      items.forEach(function (it) { container.appendChild(it); });
    }

    sortRadios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (radio.checked) applySort(radio.value);
      });
    });

    var checked = document.querySelector('input[name="section-sort"]:checked');
    if (checked) applySort(checked.value);
  }
})();
