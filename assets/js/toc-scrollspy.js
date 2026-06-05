// Dynamic table-of-contents active-heading highlighting.
(function () {
  function scrollHandler() {
    const anchors = Array.from(document.querySelectorAll("body main h1, body main h2, body main h3"));

    function scrollCallback() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Reset all active states
      document.querySelectorAll('nav ul li a').forEach(link => {
        link.classList.remove("active-toc");
      });

      // Find the last heading that we've scrolled past
      for (var i = anchors.length - 1; i >= 0; i--) {
        var offsetTop = anchors[i].offsetTop;
        if (scrollTop > offsetTop - 75) {
          var anchorId = anchors[i].getAttribute("id");
          var link = document.querySelector(
            'nav ul li a[href="#' + anchorId + '"]',
          );
          if (link) {
            link.classList.add("active-toc");
            break;
          }
        }
      }
    }

    window.addEventListener(
      "scroll",
      window.throttle(scrollCallback, 200),
    );
  }
  setTimeout(scrollHandler, 100);
})();
