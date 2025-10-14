// PrismFlow Browser - Particle Engine from Natural Asymmetry Mega System
// Ambient particles that react to browser events and user interaction

class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.maxParticles = 100;

    // Natural Asymmetry distribution
    this.EMERGENCE_RATIO = 0.3;
    this.PRECISION_RATIO = 0.2;
    this.SUPPORT_RATIO = 0.5;

    // Current state
    this.isActive = false;
    this.currentPalette = null;
    this.mouseX = 0;
    this.mouseY = 0;

    this.init();
  }

  init() {
    // Resize canvas
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Track mouse for interaction
    window.addEventListener("mousemove", (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Create initial particles
    this.createParticles();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    // Distribute particles using Natural Asymmetry
    const emergenceCount = Math.floor(this.maxParticles * this.EMERGENCE_RATIO);
    const precisionCount = Math.floor(this.maxParticles * this.PRECISION_RATIO);
    const supportCount = Math.floor(this.maxParticles * this.SUPPORT_RATIO);

    // Emergence particles - fast, reactive
    for (let i = 0; i < emergenceCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.5,
        type: "emergence",
        color: null,
        life: 1,
      });
    }

    // Precision particles - focused, purposeful
    for (let i = 0; i < precisionCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 2,
        opacity: Math.random() * 0.3 + 0.7,
        type: "precision",
        color: null,
        life: 1,
      });
    }

    // Support particles - stable, atmospheric
    for (let i = 0; i < supportCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.2 + 0.1,
        type: "support",
        color: null,
        life: 1,
      });
    }
  }

  updatePalette(palette) {
    this.currentPalette = palette;

    // Update particle colors based on palette
    this.particles.forEach((p) => {
      if (p.type === "emergence") {
        p.color = palette.accent;
      } else if (p.type === "precision") {
        p.color = palette.dominant;
      } else {
        p.color = palette.secondary;
      }
    });
  }

  update() {
    if (!this.isActive) return;

    this.particles.forEach((p) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Mouse interaction (attraction/repulsion)
      if (p.type === "emergence") {
        const dx = this.mouseX - p.x;
        const dy = this.mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          // Repel from mouse
          p.vx -= dx * 0.001;
          p.vy -= dy * 0.001;
        }
      }

      // Boundary behavior
      if (p.x < 0 || p.x > this.canvas.width) {
        p.vx *= -0.8;
        p.x = Math.max(0, Math.min(this.canvas.width, p.x));
      }
      if (p.y < 0 || p.y > this.canvas.height) {
        p.vy *= -0.8;
        p.y = Math.max(0, Math.min(this.canvas.height, p.y));
      }

      // Apply friction
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Regenerate dead particles
      if (p.life <= 0) {
        p.x = Math.random() * this.canvas.width;
        p.y = Math.random() * this.canvas.height;
        p.life = 1;
      }
    });
  }

  draw() {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw connections between nearby particles
    this.particles.forEach((p1, i) => {
      if (p1.type !== "support") {
        this.particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = p1.color || "rgba(255, 255, 255, 0.1)";
            this.ctx.globalAlpha = (1 - dist / 50) * 0.2;
            this.ctx.stroke();
          }
        });
      }
    });

    // Draw particles
    this.particles.forEach((p) => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color || "rgba(255, 255, 255, 0.5)";
      this.ctx.globalAlpha = p.opacity * p.life;
      this.ctx.fill();
    });

    this.ctx.globalAlpha = 1;
  }

  animate() {
    if (!this.isActive) return;

    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  start() {
    this.isActive = true;
    this.animate();
  }

  stop() {
    this.isActive = false;
  }

  // React to browser events
  onPageLoad() {
    // Burst of emergence particles
    this.particles
      .filter((p) => p.type === "emergence")
      .forEach((p) => {
        p.vx = (Math.random() - 0.5) * 5;
        p.vy = (Math.random() - 0.5) * 5;
      });
  }

  onTabSwitch() {
    // Swirl effect
    this.particles.forEach((p, i) => {
      const angle = (i / this.particles.length) * Math.PI * 2;
      p.vx = Math.cos(angle) * 3;
      p.vy = Math.sin(angle) * 3;
    });
  }

  onScroll(delta) {
    // Particles follow scroll direction
    this.particles.forEach((p) => {
      p.vy -= delta * 0.01;
    });
  }
}

// Export for use in PrismFlow Browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = ParticleEngine;
}
