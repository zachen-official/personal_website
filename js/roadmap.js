(function () {
  var root = document.getElementById("experience");
  if (!root) return;

  var stops = Array.prototype.slice.call(root.querySelectorAll(".roadmap-stop"));
  var panels = Array.prototype.slice.call(root.querySelectorAll(".roadmap-panel"));
  var progress = document.getElementById("roadmap-progress");

  function setProgress(value) {
    if (!progress) return;
    var amount = Number(value);
    if (isNaN(amount)) amount = 100;
    progress.style.strokeDashoffset = String(100 - Math.max(0, Math.min(100, amount)));
  }

  function activate(stop) {
    var panelId = stop.getAttribute("data-panel");
    stops.forEach(function (item) {
      var active = item === stop;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", active ? "true" : "false");
    });
    panels.forEach(function (panel) {
      var show = panel.id === panelId;
      panel.classList.toggle("is-visible", show);
      if (show) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
    setProgress(stop.getAttribute("data-progress"));
  }

  stops.forEach(function (stop) {
    stop.addEventListener("click", function (event) {
      if (event.target.closest("a")) return;
      activate(stop);
    });
    stop.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target.closest("a")) return;
      event.preventDefault();
      activate(stop);
    });
  });

  var initial = root.querySelector(".roadmap-stop.is-active") || stops[stops.length - 1];
  if (initial) activate(initial);
})();
