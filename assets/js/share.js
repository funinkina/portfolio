// Single-page share button (Web Share API with clipboard fallback).
(function () {
  function setupSingleShareButton() {
    const shareButton = document.querySelector(".single-share-button");

    if (!shareButton) {
      return;
    }

    const icon = shareButton.querySelector(".material-symbols-outlined");
    const originalLabel = shareButton.getAttribute("aria-label");

    function setShareIcon(name, label) {
      if (icon) {
        icon.innerText = name;
      }
      shareButton.setAttribute("aria-label", label);
      shareButton.setAttribute("title", label);
    }

    function copyWithFallback(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }

      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      return Promise.resolve();
    }

    shareButton.addEventListener("click", async function () {
      const shareData = {
        title: shareButton.dataset.shareTitle || document.title,
        url: shareButton.dataset.shareUrl || window.location.href,
      };
      const copyPromise = copyWithFallback(shareData.url)
        .then(function () {
          return true;
        })
        .catch(function () {
          return false;
        });

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        }
        const copied = await copyPromise;
        setShareIcon(copied ? "check" : "share", copied ? "Link copied" : "Shared");
      } catch (error) {
        const copied = await copyPromise;
        setShareIcon(copied ? "check" : "error", copied ? "Link copied" : "Unable to copy link");
      }

      setTimeout(function () {
        setShareIcon("share", originalLabel || "Share this page");
      }, 1500);
    });
  }

  setTimeout(setupSingleShareButton, 100);
})();
