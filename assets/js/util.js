// Shared utilities used across the site bundle.
window.throttle = function (fn, wait) {
  var time = Date.now();
  return function () {
    var now = Date.now();
    if (time + wait - now < 0) {
      fn();
      time = now;
    }
  };
};
