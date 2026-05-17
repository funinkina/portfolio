(function () {
  var input = document.getElementById('section-search-input');
  var btn = document.getElementById('section-search-btn');
  if (!input || !btn) return;

  function filter() {
    var q = input.value.trim().toLowerCase();
    var items = document.querySelectorAll('.blog-row, .project-card');
    items.forEach(function (item) {
      var title = (item.dataset.title || '');
      var desc = (item.dataset.description || '');
      item.style.display = (!q || title.includes(q) || desc.includes(q)) ? '' : 'none';
    });
  }

  input.addEventListener('input', filter);
  btn.addEventListener('click', filter);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') filter();
  });
})();
