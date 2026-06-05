// Single-key navigation shortcuts.
(function () {
  document.addEventListener("keydown", function (e) {
    if (document.activeElement.isContentEditable) {
      return false;
    }
    if (document.activeElement.tagName == "INPUT") {
      return false;
    }
    if (e.altKey || e.ctrlKey || e.shiftKey) {
      return false;
    }
    var shortcutsModal = document.getElementById('shortcuts-modal');
    if (shortcutsModal && shortcutsModal.classList.contains('open')) {
      return false;
    }
    var key = e.key;
    if (key === "h") {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = "/";
    } else if (key === "b") {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = "/blog/";
    } else if (key === "p") {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = "/projects/";
    } else if (key === "t") {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = `https://${location.hostname}/tags`;
    } else if (key === "i") {
      e.preventDefault();
      e.stopPropagation();
      const inputs = document.querySelectorAll("input");
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].offsetParent !== null) {
          inputs[i].selectionStart = inputs[i].selectionEnd =
            inputs[i].value.length;
          inputs[i].focus();
          break;
        }
      }
    }
    return false;
  });
})();
