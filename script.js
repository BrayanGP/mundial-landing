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
});
