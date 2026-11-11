(function () {
  var stops = document.querySelectorAll(".roadmap-stop");
  var panels = document.querySelectorAll(".roadmap-panel");
  var progress = document.getElementById("roadmap-progress");
  if (!stops.length || !panels.length) return;

  function setProgress(value) {
    if (!progress) return;
    var pct = Math.max(0, Math.min(100, Number(value) || 0));
    progress.style.strokeDasharray = "100";
    progress.style.strokeDashoffset = String(100 - pct);
  }

  function activate(stop) {
    var panelId = stop.getAttribute("data-panel");
    stops.forEach(function (el) {
      var on = el === stop;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
    });
    panels.forEach(function (panel) {
      var on = panel.id === panelId;
      panel.classList.toggle("is-visible", on);
      if (on) {
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
      if (event.target.closest("a")) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate(stop);
      }
    });
  });

  var initial = document.querySelector(".roadmap-stop.is-active") || stops[stops.length - 1];
  activate(initial);
})();
