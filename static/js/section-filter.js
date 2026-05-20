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
})();
