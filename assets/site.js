document.addEventListener("DOMContentLoaded", function () {
  // ----- Mobile nav -----
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // ----- Theme toggle -----
  var themeBtn = document.querySelector(".theme-toggle");
  function applyThemeMeta(theme) {
    var color = theme === "light" ? "#f7f9fb" : "#0b1723";
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
      m.setAttribute("content", color);
    });
  }
  if (themeBtn) {
    var current = document.documentElement.getAttribute("data-theme") || "dark";
    themeBtn.setAttribute("aria-label", current === "light" ? "Switch to dark theme" : "Switch to light theme");
    applyThemeMeta(current);
    themeBtn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      themeBtn.setAttribute("aria-label", next === "light" ? "Switch to dark theme" : "Switch to light theme");
      applyThemeMeta(next);
    });
  }

  // ----- Contact form -----
  var form = document.querySelector("form.form");
  if (form) {
    var statusEl = form.querySelector(".form-status");
    function setFieldError(input, show) {
      var err = document.getElementById(input.id + "-err");
      input.setAttribute("aria-invalid", show ? "true" : "false");
      if (err) err.hidden = !show;
    }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = form.querySelector("#cf-name");
      var email = form.querySelector("#cf-email");
      var msg = form.querySelector("#cf-message");
      var firstBad = null;
      var nameOk = name.value.trim().length > 0;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      var msgOk = msg.value.trim().length >= 20;
      setFieldError(name, !nameOk); if (!nameOk) firstBad = firstBad || name;
      setFieldError(email, !emailOk); if (!emailOk) firstBad = firstBad || email;
      setFieldError(msg, !msgOk); if (!msgOk) firstBad = firstBad || msg;
      if (firstBad) { firstBad.focus(); return; }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      var origLabel = btn.textContent;
      btn.textContent = "Sending…";
      statusEl.className = "form-status";
      statusEl.textContent = "";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          statusEl.className = "form-status ok";
          statusEl.textContent = "Thanks — your message is on its way. I'll reply within a business day.";
        } else {
          throw new Error("bad status " + res.status);
        }
      }).catch(function () {
        statusEl.className = "form-status err";
        statusEl.textContent = "Something went wrong sending the form — please email me directly at yogisubramanyam@gmail.com.";
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = origLabel;
      });
    });
  }

  // ----- Scroll reveal -----
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced && "IntersectionObserver" in window) {
    var els = document.querySelectorAll(".card, .section-head, .stat, .tl-item, .cta-band, .avatar-frame");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px 12% 0px" });
    els.forEach(function (el, i) {
      el.classList.add("will-reveal");
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
    // Safety net: never leave content hidden (e.g. observer quirks, printing)
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add("revealed"); });
    }, 3000);
  }
});
