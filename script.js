// ===== Cuenta regresiva al partido inaugural =====
// Estadio Azteca · Ciudad de México · 11 jun 2026, 20:00 (UTC-6 / CDT = 02:00 UTC del 12).
const KICKOFF = new Date("2026-06-12T02:00:00Z");

const clockEl = document.getElementById("clock");
const noteEl = document.getElementById("clock-note");
const units = {
  days: clockEl.querySelector('[data-unit="days"]'),
  hours: clockEl.querySelector('[data-unit="hours"]'),
  minutes: clockEl.querySelector('[data-unit="minutes"]'),
  seconds: clockEl.querySelector('[data-unit="seconds"]'),
};

const pad = (n) => String(n).padStart(2, "0");

function tick() {
  const diff = KICKOFF.getTime() - Date.now();

  if (diff <= 0) {
    units.days.textContent = "00";
    units.hours.textContent = "00";
    units.minutes.textContent = "00";
    units.seconds.textContent = "00";
    noteEl.textContent = "¡El Mundial 2026 ya está en marcha! ⚽🔥";
    clearInterval(timer);
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  units.days.textContent = pad(Math.floor(totalSeconds / 86400));
  units.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
  units.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
  units.seconds.textContent = pad(totalSeconds % 60);

  const days = Math.floor(totalSeconds / 86400);
  if (days <= 7) {
    noteEl.textContent = `¡Solo faltan ${days} día${days === 1 ? "" : "s"}! La fiesta está a la vuelta de la esquina.`;
  } else {
    noteEl.textContent = "";
  }
}

tick();
const timer = setInterval(tick, 1000);

// ===== Menú móvil =====
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// ===== Newsletter (demo, sin backend) =====
const form = document.getElementById("news-form");
const emailInput = document.getElementById("news-email");
const msg = document.getElementById("news-msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = emailInput.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  if (!valid) {
    msg.textContent = "Ingresa un correo válido, por favor.";
    msg.style.color = "#ffd2dd";
    return;
  }

  msg.textContent = "¡Listo! Te avisaremos de todas las novedades. 🎉";
  msg.style.color = "var(--gold)";
  form.reset();
  window.MundialFX?.confetti();
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== Fondo de partículas del hero =====
(function heroParticles() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas || reducedMotion) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    const count = Math.min(90, Math.floor((w * h) / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.4 + 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.5 + 0.2,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 197, 66, ${p.a})`;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  frame();
})();

// ===== Scroll reveal =====
(function scrollReveal() {
  const targets = document.querySelectorAll(
    ".section-title, .section-lead, .host-card, .format-item, .timeline li, .newsletter-card, .clock-unit, .game-board"
  );
  targets.forEach((el) => el.classList.add("reveal"));
  if (reducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach((el) => io.observe(el));
})();

// ===== Confeti compartido (window.MundialFX.confetti) =====
window.MundialFX = (function confettiFX() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return { confetti() {} };
  const ctx = canvas.getContext("2d");
  const colors = ["#f5c542", "#ff4d8d", "#11543f", "#ffffff", "#ffd766"];
  let pieces = [];
  let running = false;

  function size() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", size);
  size();

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      ctx.restore();
    });
    pieces = pieces.filter((p) => p.y < canvas.height + 30);
    if (pieces.length) {
      requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      running = false;
    }
  }

  function confetti(n = 130) {
    if (reducedMotion) return;
    for (let i = 0; i < n; i++) {
      pieces.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 220,
        y: canvas.height / 3,
        vx: (Math.random() - 0.5) * 9,
        vy: Math.random() * -9 - 3,
        s: Math.random() * 9 + 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[(Math.random() * colors.length) | 0],
      });
    }
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  }

  return { confetti };
})();
