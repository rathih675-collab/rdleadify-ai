(function () {
  var current = document.currentScript;
  var script = document.createElement("script");
  script.async = true;
  script.src = new URL("/widget/rdleadify-widget.js", current ? current.src : window.location.origin).href;
  if (current) {
    Array.prototype.slice.call(current.attributes).forEach(function (attribute) {
      if (attribute.name.indexOf("data-") === 0) script.setAttribute(attribute.name, attribute.value);
    });
  }
  document.head.appendChild(script);
})();
