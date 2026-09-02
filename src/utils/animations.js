// ===================================================
// PATH FORGE - ANIMATION & VISUAL EFFECTS UTILITIES
// Constellation background, custom cursor & confetti
// ===================================================

/**
 * Initializes the mouse-reactive interactive constellation particle canvas background.
 * @param {string} canvasId
 */
export function initConstellationCanvas(canvasId = "fx-canvas") {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  let mouse = { x: width / 2, y: height / 2 };

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const numParticles = 65;
  const particles = [];
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56, 189, 248, 0.8)";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#38bdf8";
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${1 - dist / 130})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      const mDist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (mDist < 160) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.8 - mDist / 160})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  function render() {
    drawParticles();
    requestAnimationFrame(render);
  }

  render();
}

/**
 * Initializes the glowing custom cursor dot & follower ring.
 */
export function initCustomCursor() {
  if (document.getElementById("custom-cursor-dot")) return;

  const dot = document.createElement("div");
  dot.id = "custom-cursor-dot";
  const ring = document.createElement("div");
  ring.id = "custom-cursor-ring";

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  window.addEventListener("mouseover", (e) => {
    const target = e.target;
    if (
      target &&
      typeof target.closest === "function" &&
      target.closest("button, a, input, label, select, [role='button'], .quiz-opt-btn, .step-checkbox")
    ) {
      ring.classList.add("cursor-hover");
      dot.classList.add("cursor-hover");
    } else {
      ring.classList.remove("cursor-hover");
      dot.classList.remove("cursor-hover");
    }
  });
}

/**
 * Fires celebration particle confetti for milestone achievements.
 */
export function triggerConfetti() {
  if (typeof window !== "undefined" && typeof window.confetti === "function") {
    window.confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  }
}
