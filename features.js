// ===== Features "pro" — 100% front, sin backend =====
(function features() {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 48 selecciones (mezcla de clasificadas y favoritas, para la demo).
  const TEAMS = [
    ["🇲🇽", "México"], ["🇺🇸", "Estados Unidos"], ["🇨🇦", "Canadá"],
    ["🇦🇷", "Argentina"], ["🇧🇷", "Brasil"], ["🇫🇷", "Francia"],
    ["🏴", "Inglaterra"], ["🇪🇸", "España"], ["🇩🇪", "Alemania"],
    ["🇵🇹", "Portugal"], ["🇳🇱", "Países Bajos"], ["🇮🇹", "Italia"],
    ["🇧🇪", "Bélgica"], ["🇭🇷", "Croacia"], ["🇺🇾", "Uruguay"],
    ["🇨🇴", "Colombia"], ["🇯🇵", "Japón"], ["🇰🇷", "Corea del Sur"],
    ["🇸🇳", "Senegal"], ["🇲🇦", "Marruecos"], ["🇨🇭", "Suiza"],
    ["🇩🇰", "Dinamarca"], ["🇷🇸", "Serbia"], ["🇵🇱", "Polonia"],
    ["🇪🇨", "Ecuador"], ["🇦🇺", "Australia"], ["🇬🇭", "Ghana"],
    ["🇨🇲", "Camerún"], ["🇳🇬", "Nigeria"], ["🇨🇮", "Costa de Marfil"],
    ["🇹🇳", "Túnez"], ["🇩🇿", "Argelia"], ["🇪🇬", "Egipto"],
    ["🇮🇷", "Irán"], ["🇸🇦", "Arabia Saudita"], ["🇶🇦", "Catar"],
    ["🇵🇪", "Perú"], ["🇨🇱", "Chile"], ["🇵🇾", "Paraguay"],
    ["🇸🇪", "Suecia"], ["🇳🇴", "Noruega"], ["🇦🇹", "Austria"],
    ["🇹🇷", "Turquía"], ["🇺🇦", "Ucrania"], ["🇨🇷", "Costa Rica"],
    ["🇵🇦", "Panamá"], ["🇯🇲", "Jamaica"], ["🇳🇿", "Nueva Zelanda"],
  ];

  // --- Barra de progreso de scroll ---
  (function scrollProgress() {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = max > 0 ? `${(h.scrollTop / max) * 100}%` : "0%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  // --- Contadores animados ---
  (function countUp() {
    const nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      nums.forEach((n) => (n.textContent = n.dataset.count));
      return;
    }
    const animate = (el) => {
      const target = Number(el.dataset.count);
      const dur = 1200;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach((n) => io.observe(n));
  })();

  // --- Tilt 3D en tarjetas de sedes ---
  (function tilt() {
    if (reducedMotion || window.matchMedia("(hover: none)").matches) return;
    document.querySelectorAll(".host-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  })();

  // --- Simulador de sorteo ---
  (function groupDraw() {
    const btn = document.getElementById("draw-btn");
    const clearBtn = document.getElementById("draw-clear");
    const wrap = document.getElementById("groups");
    if (!btn || !wrap) return;
    const LETTERS = "ABCDEFGHIJKL".split(""); // 12 grupos

    const shuffle = (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    function draw() {
      const pool = shuffle(TEAMS);
      wrap.innerHTML = "";
      LETTERS.forEach((letter, gi) => {
        const group = document.createElement("div");
        group.className = "group";
        const teams = pool.slice(gi * 4, gi * 4 + 4);
        group.innerHTML =
          `<h3>Grupo ${letter}</h3><ul>` +
          teams.map((t, ti) =>
            `<li style="animation-delay:${reducedMotion ? 0 : (gi * 4 + ti) * 35}ms">` +
            `<span class="fl">${t[0]}</span>${t[1]}</li>`
          ).join("") +
          `</ul>`;
        wrap.appendChild(group);
      });
    }

    btn.addEventListener("click", draw);
    clearBtn.addEventListener("click", () => { wrap.innerHTML = ""; });
    draw(); // sorteo inicial
  })();

  // --- Predice tu campeón ---
  (function predict() {
    const grid = document.getElementById("team-grid");
    const current = document.getElementById("predict-current");
    const nameEl = document.getElementById("predict-name");
    if (!grid) return;

    const KEY = "mundial-champion";
    let saved = localStorage.getItem(KEY) || "";

    function showCurrent() {
      if (saved) {
        nameEl.textContent = saved;
        current.hidden = false;
      } else {
        current.hidden = true;
      }
    }

    TEAMS.forEach((t) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "team-chip" + (t[1] === saved ? " selected" : "");
      chip.setAttribute("role", "listitem");
      chip.innerHTML = `<span class="fl">${t[0]}</span>${t[1]}`;
      chip.addEventListener("click", () => {
        const wasSelected = t[1] === saved;
        grid.querySelectorAll(".team-chip").forEach((c) => c.classList.remove("selected"));
        if (wasSelected) {
          saved = "";
          localStorage.removeItem(KEY);
        } else {
          saved = t[1];
          localStorage.setItem(KEY, saved);
          chip.classList.add("selected");
          window.MundialFX?.confetti(110);
        }
        showCurrent();
      });
      grid.appendChild(chip);
    });

    showCurrent();
  })();
})();
