(function () {
  var sectionLinks = Array.prototype.slice.call(
    document.querySelectorAll(".portfolio-nav-link[data-section]")
  );
  var sections = sectionLinks
    .map(function (link) {
      return document.getElementById(link.getAttribute("data-section"));
    })
    .filter(Boolean);
  var uniqueSections = sections.filter(function (section, index, list) {
    return list.indexOf(section) === index;
  });

  var experienceGroup = document.querySelector('.portfolio-nav-group[data-section="experience"]');
  var bullets = Array.prototype.slice.call(document.querySelectorAll(".experience-bullet"));
  var chapters = Array.prototype.slice.call(document.querySelectorAll(".experience-chapter"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var activeSection = "";
  var activeChapter = "";

  function setSection(id) {
    if (!id) return;
    if (id !== activeSection) {
      activeSection = id;
      sectionLinks.forEach(function (link) {
        var on = link.getAttribute("data-section") === id;
        link.classList.toggle("is-active", on);
        if (on) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }
    if (experienceGroup) {
      var open = id === "experience";
      experienceGroup.classList.toggle("is-expanded", open);
      var list = experienceGroup.querySelector(".experience-rail-list");
      if (list) {
        list.setAttribute("aria-hidden", open ? "false" : "true");
        bullets.forEach(function (bullet) {
          if (open) {
            bullet.removeAttribute("tabindex");
          } else {
            bullet.setAttribute("tabindex", "-1");
          }
        });
      }
    }
  }

  function setChapter(id) {
    if (!id || id === activeChapter) return;
    activeChapter = id;
    bullets.forEach(function (bullet) {
      var on = bullet.getAttribute("data-target") === id;
      bullet.classList.toggle("is-active", on);
      if (on) {
        bullet.setAttribute("aria-current", "true");
      } else {
        bullet.removeAttribute("aria-current");
      }
    });
    chapters.forEach(function (chapter) {
      chapter.classList.toggle("is-active", chapter.id === id);
    });
  }

  function pickClosest(elements, focusY) {
    var best = elements[0];
    var bestDist = Infinity;
    elements.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var dist;
      if (rect.top <= focusY && rect.bottom > focusY) {
        dist = -1000 + Math.abs(rect.top - focusY) * 0.01;
      } else {
        var clamped = Math.min(Math.max(focusY, rect.top), rect.bottom);
        dist = Math.abs(clamped - focusY);
      }
      if (dist < bestDist) {
        bestDist = dist;
        best = el;
      }
    });
    return best;
  }

  function syncFromScroll() {
    if (!uniqueSections.length) return;
    var focusY = window.innerHeight * 0.28;
    var section = pickClosest(uniqueSections, focusY);
    setSection(section.id);

    if (section.id === "experience" && chapters.length) {
      var chapter = pickClosest(chapters, focusY);
      setChapter(chapter.id);
    }
  }

  bullets.forEach(function (bullet) {
    bullet.addEventListener("click", function (event) {
      var id = bullet.getAttribute("data-target");
      var target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      setSection("experience");
      setChapter(id);
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      syncFromScroll();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  syncFromScroll();
})();
