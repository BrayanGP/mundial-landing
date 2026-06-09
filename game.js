// ===== Tanda de penales (canvas) =====
(function penaltyGame() {
  const canvas = document.getElementById("penalty");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- HUD ---
  const elScore = document.getElementById("g-score");
  const elShots = document.getElementById("g-shots");
  const elStreak = document.getElementById("g-streak");
  const elBest = document.getElementById("g-best");
  const elMsg = document.getElementById("g-msg");
  const elReset = document.getElementById("g-reset");

  const state = {
    score: 0,
    shots: 0,
    streak: 0,
    best: Number(localStorage.getItem("mundial-best") || 0),
    phase: "aim", // aim | shooting | result
  };

  // --- Geometría ---
  const goal = { x: 120, y: 70, w: W - 240, h: 150 };
  const ball = { home: { x: W / 2, y: H - 60 }, x: W / 2, y: H - 60, r: 14 };
  const keeper = { w: 60, h: 70, x: W / 2 - 30, y: goal.y + goal.h - 70, dive: 0 };

  let aim = null; // {x, y} mientras se arrastra
  let shot = null; // {tx, ty, t, gx, kx} durante el disparo
  let resultTimer = 0;

  function syncHud() {
    elScore.textContent = state.score;
    elShots.textContent = state.shots;
    elStreak.textContent = state.streak;
    elBest.textContent = state.best;
  }
  syncHud();

  // --- Dibujo ---
  function drawField() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0e2e22");
    g.addColorStop(1, "#11543f");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // franjas de césped
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let i = 0; i < W; i += 64) ctx.fillRect(i, 0, 32, H);

    // área
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.strokeRect(60, goal.y + goal.h, W - 120, H - goal.y - goal.h - 30);
  }

  function drawGoal() {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.strokeRect(goal.x, goal.y, goal.w, goal.h);
    // red
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1;
    for (let x = goal.x; x <= goal.x + goal.w; x += 18) {
      ctx.beginPath(); ctx.moveTo(x, goal.y); ctx.lineTo(x, goal.y + goal.h); ctx.stroke();
    }
    for (let y = goal.y; y <= goal.y + goal.h; y += 18) {
      ctx.beginPath(); ctx.moveTo(goal.x, y); ctx.lineTo(goal.x + goal.w, y); ctx.stroke();
    }
  }

  function drawKeeper(kx) {
    const x = kx ?? keeper.x;
    ctx.fillStyle = "#ff4d8d";
    // cuerpo
    ctx.fillRect(x, keeper.y, keeper.w, keeper.h);
    // cabeza
    ctx.beginPath();
    ctx.fillStyle = "#ffd0a8";
    ctx.arc(x + keeper.w / 2, keeper.y - 12, 14, 0, Math.PI * 2);
    ctx.fill();
    // guantes
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 8, keeper.y + 6, 10, 18);
    ctx.fillRect(x + keeper.w - 2, keeper.y + 6, 10, 18);
  }

  function drawBall(bx, by) {
    ctx.save();
    ctx.translate(bx, by);
    ctx.beginPath();
    ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#0a1f17";
    ctx.stroke();
    // pentágono central
    ctx.fillStyle = "#0a1f17";
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const px = Math.cos(a) * ball.r * 0.45;
      const py = Math.sin(a) * ball.r * 0.45;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawAimGuide() {
    if (state.phase !== "aim" || !aim) return;
    ctx.save();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = "rgba(245,197,66,0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ball.home.x, ball.home.y);
    ctx.lineTo(aim.x, aim.y);
    ctx.stroke();
    ctx.restore();
    // mira
    ctx.beginPath();
    ctx.arc(aim.x, aim.y, 12, 0, Math.PI * 2);
    ctx.strokeStyle = "#f5c542";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function render() {
    drawField();
    drawGoal();

    if (state.phase === "shooting" && shot) {
      drawKeeper(shot.kx);
      drawBall(shot.bx, shot.by);
    } else {
      drawKeeper(keeper.x + keeper.dive);
      drawBall(ball.home.x, ball.home.y);
      drawAimGuide();
    }
  }

  // --- Coordenadas relativas al canvas (escala CSS) ---
  function pos(evt) {
    const rect = canvas.getBoundingClientRect();
    const p = evt.touches ? evt.touches[0] : evt;
    return {
      x: ((p.clientX - rect.left) / rect.width) * W,
      y: ((p.clientY - rect.top) / rect.height) * H,
    };
  }

  function startAim(evt) {
    if (state.phase !== "aim") return;
    evt.preventDefault();
    aim = pos(evt);
    render();
  }
  function moveAim(evt) {
    if (state.phase !== "aim" || !aim) return;
    evt.preventDefault();
    aim = pos(evt);
    render();
  }

  function release(evt) {
    if (state.phase !== "aim" || !aim) return;
    evt.preventDefault();
    // clamp del objetivo dentro del arco
    const tx = Math.max(goal.x, Math.min(goal.x + goal.w, aim.x));
    const ty = Math.max(goal.y, Math.min(goal.y + goal.h, aim.y));
    aim = null;
    shoot(tx, ty);
  }

  function shoot(tx, ty) {
    state.phase = "shooting";
    // el portero elige una zona horizontal (0,1,2) e intenta llegar
    const zones = [goal.x + 40, goal.x + goal.w / 2 - keeper.w / 2, goal.x + goal.w - keeper.w - 40];
    const keeperTarget = zones[(Math.random() * 3) | 0];
    shot = {
      tx, ty,
      bx: ball.home.x, by: ball.home.y,
      kx: keeper.x,
      kTarget: keeperTarget,
      t: 0,
    };
    elMsg.textContent = "¡Disparo!";
    animateShot();
  }

  function finishShot() {
    state.shots++;
    // ¿el portero atajó? distancia entre centro del balón y del portero al llegar
    const ballCx = shot.tx;
    const keeperCx = shot.kx + keeper.w / 2;
    const saved = Math.abs(ballCx - keeperCx) < keeper.w / 2 + ball.r &&
      shot.ty > keeper.y - 10 && shot.ty < keeper.y + keeper.h + 10;

    if (saved) {
      state.streak = 0;
      elMsg.textContent = "🧤 ¡Atajada! El portero la sacó.";
      elMsg.style.color = "#ffd2dd";
    } else {
      state.score++;
      state.streak++;
      state.best = Math.max(state.best, state.streak);
      localStorage.setItem("mundial-best", String(state.best));
      const cheers = ["⚽ ¡GOOOL!", "⚽ ¡Al ángulo!", "⚽ ¡Imparable!", "⚽ ¡Golazo!"];
      elMsg.textContent = cheers[(Math.random() * cheers.length) | 0];
      elMsg.style.color = "var(--gold)";
      window.MundialFX?.confetti(state.streak >= 5 ? 200 : 90);
    }
    syncHud();
    state.phase = "result";
    resultTimer = setTimeout(() => {
      state.phase = "aim";
      shot = null;
      elMsg.textContent = state.streak >= 3
        ? `🔥 Racha de ${state.streak}. ¡Sigue así!`
        : "¡Apunta y dispara!";
      render();
    }, 1100);
  }

  function animateShot() {
    if (!shot) return;
    const speed = reducedMotion ? 0.5 : 0.045;
    shot.t = Math.min(1, shot.t + speed);
    const e = shot.t * shot.t * (3 - 2 * shot.t); // smoothstep
    shot.bx = ball.home.x + (shot.tx - ball.home.x) * e;
    shot.by = ball.home.y + (shot.ty - ball.home.y) * e;
    shot.kx = keeper.x + (shot.kTarget - keeper.x) * e;
    render();
    if (shot.t >= 1) {
      finishShot();
    } else {
      requestAnimationFrame(animateShot);
    }
  }

  // --- Eventos ---
  canvas.addEventListener("mousedown", startAim);
  canvas.addEventListener("mousemove", moveAim);
  window.addEventListener("mouseup", release);
  canvas.addEventListener("touchstart", startAim, { passive: false });
  canvas.addEventListener("touchmove", moveAim, { passive: false });
  canvas.addEventListener("touchend", release, { passive: false });

  elReset.addEventListener("click", () => {
    clearTimeout(resultTimer);
    state.score = 0;
    state.shots = 0;
    state.streak = 0;
    state.phase = "aim";
    shot = null;
    aim = null;
    elMsg.textContent = "¡Apunta y dispara!";
    elMsg.style.color = "var(--gold)";
    syncHud();
    render();
  });

  render();
})();
