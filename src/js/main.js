/* X Society — shared UI: nav, reveals, hero video, slider */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* nav: solid on scroll, mobile toggle */
  var nav = document.getElementById("nav");
  var toggle = document.querySelector(".nav-toggle");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* reveal on scroll */
  window.xsObserve = function (root) {
    var els = (root || document).querySelectorAll(".reveal:not(.in), .lines:not(.in)");
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    els.forEach(function (el) { io.observe(el); });
  };
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }) : null;
  window.xsObserve();

  /* hero video: pick a size, play when visible */
  var video = document.querySelector(".hero-video");
  if (video) {
    var small = window.matchMedia("(max-width: 860px)").matches;
    var src = small ? video.dataset.srcMobile : video.dataset.srcDesktop;
    if (src) {
      video.src = src;
      video.muted = true;
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }
    if (reduce) video.pause();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !reduce) { var q = video.play(); if (q && q.catch) q.catch(function () {}); }
          else video.pause();
        });
      }).observe(video);
    }
  }
  requestAnimationFrame(function () { doc.classList.add("loaded"); });

  /* promo slider */
  var slider = document.querySelector("[data-slider]");
  if (slider) {
    var slides = slider.querySelectorAll(".promo-slide");
    var tabs = document.querySelectorAll(".dots button");
    var idx = 0;
    var timer;
    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        s.classList.toggle("is-active", n === idx);
        s.hidden = n !== idx;
      });
      tabs.forEach(function (t, n) { t.setAttribute("aria-selected", String(n === idx)); });
    }
    function auto() {
      clearInterval(timer);
      if (!reduce) timer = setInterval(function () { show(idx + 1); }, 6000);
    }
    tabs.forEach(function (t, n) {
      t.addEventListener("click", function () { show(n); auto(); });
    });
    slider.addEventListener("mouseenter", function () { clearInterval(timer); });
    slider.addEventListener("mouseleave", auto);
    auto();
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
