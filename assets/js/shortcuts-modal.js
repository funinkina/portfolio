// Shortcuts modal (toggled with "/") + first-visit hint toast.
document.addEventListener('DOMContentLoaded', function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var modal = document.getElementById('shortcuts-modal');
  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    if (e.key === '/') {
      e.preventDefault();
      e.stopPropagation();
      if (modal.classList.contains('open')) {
        closeModal();
      } else {
        openModal();
      }
      return;
    }

    if (document.activeElement.isContentEditable) return;
    if (document.activeElement.tagName === 'INPUT') return;

    if (e.key === 'Escape' && modal.classList.contains('open')) {
      e.preventDefault();
      closeModal();
    }
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  var closeBtn = modal.querySelector('.shortcuts-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (!localStorage.getItem('shortcuts-hint-shown')) {
    localStorage.setItem('shortcuts-hint-shown', '1');
    var toast = document.createElement('div');
    toast.className = 'shortcuts-toast';
    toast.innerHTML =
      '<span class="material-symbols-outlined" aria-hidden="true">keyboard</span>' +
      'Press <kbd>/</kbd> for keyboard shortcuts' +
      '<button class="shortcuts-toast-close" aria-label="Dismiss">×</button>';
    document.body.appendChild(toast);

    function dismissToast() {
      toast.classList.add('shortcuts-toast-out');
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 380);
    }

    toast.querySelector('.shortcuts-toast-close').addEventListener('click', dismissToast);
    setTimeout(dismissToast, 7000);
  }
});
