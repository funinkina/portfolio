// Mobile table-of-contents drawer.
(function () {
  function setupMobileTableOfContents() {
    const toc = document.getElementById("tableOfContentContainer");
    const tocToggle = document.querySelector(".mobile-toc-toggle");
    const navBar = document.querySelector(".nav-bar");
    const mobileViewport = window.matchMedia("(max-width: 1149px)");

    if (!toc || !tocToggle || !navBar) {
      return;
    }

    const icon = tocToggle.querySelector(".material-symbols-outlined");
    const tocMarker = document.createElement("span");
    tocMarker.classList.add("mobile-toc-marker");
    toc.after(tocMarker);

    function setDrawerTop() {
      const navBottom = navBar.getBoundingClientRect().bottom;
      document.documentElement.style.setProperty(
        "--mobile-toc-top",
        `${Math.ceil(navBottom + 8)}px`,
      );
    }

    function setOpen(isOpen) {
      document.body.classList.toggle("mobile-toc-open", isOpen);
      tocToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      tocToggle.setAttribute(
        "aria-label",
        isOpen ? "Close table of contents" : "Open table of contents",
      );
      if (icon) {
        icon.innerText = isOpen ? "close" : "menu";
      }
      if (isOpen) {
        setDrawerTop();
      }
    }

    function updateMobileTocState() {
      if (!mobileViewport.matches) {
        toc.classList.remove("is-mobile-drawer");
        tocToggle.classList.remove("is-visible");
        setOpen(false);
        return;
      }

      setDrawerTop();
      const tocMarkerBounds = tocMarker.getBoundingClientRect();
      const navBounds = navBar.getBoundingClientRect();
      const tocIsPastNavbar = tocMarkerBounds.top <= navBounds.bottom + 4;

      toc.classList.toggle("is-mobile-drawer", tocIsPastNavbar);
      tocToggle.classList.toggle("is-visible", tocIsPastNavbar);

      if (!tocIsPastNavbar) {
        setOpen(false);
      }
    }

    tocToggle.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("mobile-toc-open"));
    });

    toc.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setOpen(false);
      }
    });

    document.addEventListener("click", function (event) {
      if (
        document.body.classList.contains("mobile-toc-open") &&
        !event.target.closest("#tableOfContentContainer") &&
        !event.target.closest(".mobile-toc-toggle")
      ) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });

    window.addEventListener("scroll", window.throttle(updateMobileTocState, 100));
    window.addEventListener("resize", window.throttle(updateMobileTocState, 100));
    if (mobileViewport.addEventListener) {
      mobileViewport.addEventListener("change", updateMobileTocState);
    } else {
      mobileViewport.addListener(updateMobileTocState);
    }
    updateMobileTocState();
  }

  setTimeout(setupMobileTableOfContents, 100);
})();
