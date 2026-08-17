(function () {
  var C = window.ORTHOSG || {};

  /* ---------- helpers exposed to pages ---------- */
  function ph(v) { return v ? String(v) : '<span class="ph">NOT CONFIGURED</span>'; }
  window.ph = ph;

  /* ---------- fill placeholders declaratively: <span data-cfg="study.pi"></span> ---------- */
  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var val = el.dataset.cfg.split(".").reduce(function (o, k) { return o ? o[k] : null; }, C);
    el.innerHTML = ph(val);
  });

  /* ---------- GPT links ---------- */
  document.querySelectorAll(".gpt-link").forEach(function (a) {
    a.href = C.gptUrl; a.target = "_blank"; a.rel = "noopener";
  });



  /* ---------- feedback links ----------
     Any <a class="feedback-link"> points at the Google Form when one is
     configured, and falls back to the on-site page when it is not. The
     on-site page is kept either way: it is where a student composes a
     detailed, reproducible report before opening the form. */
  var fbHref = C.feedbackFormUrl || "feedback.html";
  document.querySelectorAll("a.feedback-link").forEach(function (a) {
    a.href = fbHref;
    if (C.feedbackFormUrl) { a.target = "_blank"; a.rel = "noopener"; }
  });

  /* ---------- version line ---------- */
  document.querySelectorAll(".verslot").forEach(function (e) {
    e.textContent = (C.version || "") + (C.updated ? " \u00b7 updated " + C.updated : "");
  });

  /* ---------- feature flags: data-feature="voiceViva" ---------- */
  var F = C.features || {};
  document.querySelectorAll("[data-feature]").forEach(function (el) {
    if (!F[el.dataset.feature]) el.remove();
  });
  document.querySelectorAll("[data-feature-off]").forEach(function (el) {
    if (F[el.dataset.featureOff]) el.remove();
  });

  /* ---------- subtle tilt on the hero mock card ----------
     Desktop / hover-capable pointers only, and only when the visitor has
     not asked for reduced motion. */
  var mockCard = document.querySelector(".mock");
  if (mockCard && window.matchMedia && matchMedia("(hover: hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    mockCard.addEventListener("mousemove", function (e) {
      var r = mockCard.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      mockCard.style.transform = "perspective(900px) rotateY(" + (x * 4) + "deg) rotateX(" + (y * -4) + "deg) translateY(-2px)";
    });
    mockCard.addEventListener("mouseleave", function () {
      mockCard.style.transform = "";
    });
  }

  /* ---------- scroll progress bar + floating nav shadow ---------- */
  var scrollbarEl = document.querySelector(".scrollbar");
  var navEl = document.querySelector("header.nav");
  function updateScrollChrome() {
    var d = document.documentElement;
    var max = d.scrollHeight - d.clientHeight;
    var pct = max > 0 ? (d.scrollTop / max) * 100 : 0;
    if (scrollbarEl) scrollbarEl.style.width = pct + "%";
    if (navEl) navEl.classList.toggle("scrolled", d.scrollTop > 8);
  }
  if (scrollbarEl || navEl) {
    window.addEventListener("scroll", updateScrollChrome, { passive: true });
    updateScrollChrome();
  }

  /* ---------- current year ---------- */
  document.querySelectorAll(".yr").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* ---------- current nav item ---------- */
  var here = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".nav-links a[href]").forEach(function (a) {
    var t = new URL(a.getAttribute("href"), location.href).pathname.replace(/index\.html$/, "");
    if (t === here) a.setAttribute("aria-current", "page");
  });

  /* ---------- toast ---------- */
  var toastEl = document.querySelector(".toast"), timer;
  window.toast = function (m) {
    if (!toastEl) return;
    toastEl.textContent = m; toastEl.classList.add("show");
    clearTimeout(timer); timer = setTimeout(function () { toastEl.classList.remove("show"); }, 1900);
  };

  /* ---------- copy, and copy-and-launch ----------
     Ordering matters. The popup is opened synchronously inside the click
     handler, before any await, or mobile browsers block it. The clipboard
     write uses the legacy execCommand path first because that is also
     synchronous and works without a permission prompt; navigator.clipboard
     runs afterwards as a best-effort upgrade.
     ------------------------------------------------------------------- */
  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:absolute;left:-9999px;top:0";
    document.body.appendChild(ta);
    var sel = document.getSelection();
    var prev = sel.rangeCount ? sel.getRangeAt(0) : null;
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    if (prev) { sel.removeAllRanges(); sel.addRange(prev); }
    return ok;
  }

  function copyText(text) {
    var ok = legacyCopy(text);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
      return true;
    }
    return ok;
  }

  function showManual(btn, text) {
    var box = document.createElement("div");
    box.className = "notice";
    box.style.marginTop = "12px";
    box.innerHTML = '<strong>Copy this, then paste it into OrthoSG:</strong>' +
      '<pre style="white-space:pre-wrap;font-family:var(--mono);font-size:.82rem;margin:10px 0 0">' +
      text.replace(/</g, "&lt;") + "</pre>";
    var host = btn.closest(".prompt, .qbox") || btn.parentNode;
    if (!host.parentNode.querySelector(".notice")) host.parentNode.insertBefore(box, host.nextSibling);
  }

  function flash(btn, label) {
    var original = btn.dataset.label || btn.textContent;
    btn.dataset.label = original;
    btn.textContent = label;
    setTimeout(function () { btn.textContent = btn.dataset.label; }, 2000);
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]");
    if (!b) return;
    var text = b.dataset.copy || "";
    var launch = b.hasAttribute("data-launch");

    // Open first, synchronously, or the popup blocker wins.
    var win = launch ? window.open(C.gptUrl, "_blank", "noopener") : null;

    var copied = copyText(text);

    if (!copied) {
      showManual(b, text);
      window.toast(launch ? "Copy the prompt, then paste it" : "Select and copy the text");
      return;
    }

    if (launch) {
      flash(b, "Copied \u2014 paste it in");
      window.toast(win ? "Prompt copied. Paste it into OrthoSG."
                       : "Prompt copied. Your browser blocked the new tab \u2014 open OrthoSG and paste.");
    } else {
      flash(b, "Copied");
      window.toast("Prompt copied");
    }
  });

  /* ---------- hero mock ---------- */
  var mockBody = document.getElementById("mockBody");
  if (mockBody) {
    var MOCK = {
      answer: [["u", "Onset and progression, bladder and bowel function, and saddle sensation."]],
      feedback: [["c", "All three are right, and you led with the time course \u2014 good. You did not ask about bilateral leg symptoms or new motor weakness, and that is the omission that costs marks. Next question: which examination finding would you refuse to defer?"]],
      harder: [["u", "Give me a harder version."], ["c", "A 71-year-old with known breast cancer has two weeks of thoracic back pain, now worse lying flat, with an unsteady gait. Bladder function is intact. What is your working diagnosis, and what is your first action within the hour?"]],
      passport: [["c", "Revision Passport \u00b7 SPI-02 Cauda equina \u2014 Secure \u00b7 SPI-05 Metastatic cord compression \u2014 Learning \u00b7 Unsafe omission logged: bilateral leg symptoms \u00b7 Next review: 2 days."]]
    };
    var reducedMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll("[data-mock]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.dataset.used) return;
        btn.dataset.used = "1"; btn.setAttribute("aria-pressed", "true");
        var seq = MOCK[btn.dataset.mock].slice();
        (function next() {
          if (!seq.length) return;
          var m = seq.shift();
          if (m[0] === "c" && !reducedMotion) {
            var t = document.createElement("div");
            t.className = "typing";
            t.innerHTML = "<span></span><span></span><span></span>";
            mockBody.appendChild(t);
            mockBody.scrollTop = mockBody.scrollHeight;
            setTimeout(function () {
              t.remove();
              var d = document.createElement("div");
              d.className = "msg c";
              d.innerHTML = '<span class="who">Coach</span>' + m[1];
              mockBody.appendChild(d);
              mockBody.scrollTop = mockBody.scrollHeight;
              next();
            }, 650);
          } else {
            var d = document.createElement("div");
            d.className = "msg " + m[0];
            d.innerHTML = '<span class="who">' + (m[0] === "u" ? "You" : "Coach") + "</span>" + m[1];
            mockBody.appendChild(d);
            mockBody.scrollTop = mockBody.scrollHeight;
            next();
          }
        })();
      });
    });
  }

  /* ---------- scroll reveal ----------
     Fades/rises each section's .wrap into view once, the first time it
     crosses the viewport. Hero (.first) is excluded — it has its own
     .rise entrance choreography that plays on load, not on scroll. */
  if (window.IntersectionObserver && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    var revealTargets = document.querySelectorAll("section:not(.first) > .wrap");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll("section:not(.first) > .wrap").forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---------- prompt gallery ---------- */
  var grid = document.getElementById("promptGrid");
  if (grid) {
    var PROMPTS = [
      ["Voice Viva", "Start a 9-minute Part B viva. Act as the examiner. Do not coach me until the station is complete."],
      ["Part B OSCE", "Give me an 8-minute OSCE station on back pain with red-flag screening. Candidate instructions only."],
      ["SBAs", "Give me 5 mixed orthopaedic SBAs. One at a time and don't reveal the answers until I commit."],
      ["Mock exam", "Run a 10-question mixed orthopaedics finals mock. Hold all answers until I submit the whole set."],
      ["Imaging", "Imaging lab: give me a text-described ankle X-ray case and make me present it systematically."],
      ["Weak areas", "Diagnose my weak areas in orthopaedics. My finals are in 7 days and I have 45 minutes a day."],
      ["Rapid-fire", "Rapid-fire me on trauma emergencies for 10 minutes. One question at a time, no teaching until the end."],
      ["Contrast", "Compare L5 and S1 radiculopathy for finals. Focus on how I distinguish them clinically."],
      ["Mistake Lab", "Mistake lab: I keep forgetting what neurovascular findings to document after limb trauma."]
    ];    grid.innerHTML = PROMPTS.map(function (p) {
      var esc = p[1].replace(/"/g, "&quot;");
      return '<div class="prompt"><q>' + p[1] + '</q><div class="foot">' +
        '<span class="lbl">' + p[0] + '</span>' +
        '<span class="btns">' +
          '<button class="copy" data-copy="' + esc + '">Copy</button>' +
          '<button class="copy launch" data-copy="' + esc + '" data-launch>Copy &amp; start &rarr;</button>' +
        '</span></div></div>';
    }).join("");  }
})();
