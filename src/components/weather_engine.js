// PrismFlow Browser - Weather Engine from Natural Asymmetry City
// Creates atmospheric effects based on website content

class WeatherEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // Weather states
    this.weatherTypes = {
      clear: { particles: 0, opacity: 0, color: "transparent" },
      rain: { particles: 200, opacity: 0.6, color: "rgba(100, 150, 200, 0.5)" },
      snow: { particles: 100, opacity: 0.8, color: "rgba(255, 255, 255, 0.8)" },
      storm: { particles: 300, opacity: 0.7, color: "rgba(50, 50, 80, 0.6)" },
      fog: { particles: 50, opacity: 0.3, color: "rgba(200, 200, 200, 0.4)" },
    };

    this.currentWeather = "clear";
    this.particles = [];
    this.lightning = null;
    this.isActive = false;

    // Natural Asymmetry for weather intensity
    this.intensity = {
      emergence: 0.3, // Quick weather changes
      precision: 0.2, // Focused effects
      support: 0.5, // Ambient atmosphere
    };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Determine weather based on website content
  detectContentWeather(palette, content) {
    // Dark sites get rain/storm
    if (palette.isDark) {
      return Math.random() > 0.5 ? "rain" : "storm";
    }

    // Media sites get clear (don't obstruct content)
    if (content.includes("video") || content.includes("youtube")) {
      return "clear";
    }

    // Shopping sites get snow during winter, clear otherwise
    if (content.includes("shop") || content.includes("cart")) {
      const month = new Date().getMonth();
      return month === 11 || month === 0 || month === 1 ? "snow" : "clear";
    }

    // News sites get fog (serious atmosphere)
    if (content.includes("news") || content.includes("article")) {
      return "fog";
    }

    return "clear";
  }

  setWeather(type, smooth = true) {
    if (!this.weatherTypes[type]) return;

    const oldWeather = this.currentWeather;
    this.currentWeather = type;

    if (smooth && oldWeather !== type) {
      this.transitionWeather(oldWeather, type);
    } else {
      this.createWeatherParticles();
    }
  }

  transitionWeather(from, to) {
    // Smooth transition between weather states
    const steps = 30;
    let step = 0;

    const transition = () => {
      step++;
      const progress = step / steps;

      // Interpolate particle count
      const fromCount = this.weatherTypes[from].particles;
      const toCount = this.weatherTypes[to].particles;
      const currentCount = Math.floor(
        fromCount + (toCount - fromCount) * progress,
      );

      // Adjust particle count
      while (this.particles.length < currentCount) {
        this.addParticle();
      }
      while (this.particles.length > currentCount) {
        this.particles.pop();
      }

      if (step < steps) {
        requestAnimationFrame(transition);
      }
    };

    transition();
  }

  createWeatherParticles() {
    this.particles = [];
    const weather = this.weatherTypes[this.currentWeather];

    for (let i = 0; i < weather.particles; i++) {
      this.addParticle();
    }
  }

  addParticle() {
    const particle = {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height - this.canvas.height,
      vx: 0,
      vy: 0,
      size: 1,
      opacity: 1,
      type: this.currentWeather,
    };

    // Set particle properties based on weather type
    switch (this.currentWeather) {
      case "rain":
        particle.vy = Math.random() * 5 + 10;
        particle.vx = Math.random() * 2 - 1;
        particle.size = Math.random() * 1 + 0.5;
        particle.opacity = Math.random() * 0.3 + 0.3;
        break;

      case "snow":
        particle.vy = Math.random() * 1 + 0.5;
        particle.vx = Math.random() * 2 - 1;
        particle.size = Math.random() * 3 + 1;
        particle.opacity = Math.random() * 0.5 + 0.5;
        break;

      case "storm":
        particle.vy = Math.random() * 8 + 12;
        particle.vx = Math.random() * 4 - 2;
        particle.size = Math.random() * 1.5 + 0.5;
        particle.opacity = Math.random() * 0.4 + 0.4;
        break;

      case "fog":
        particle.vy = Math.random() * 0.2 + 0.1;
        particle.vx = Math.random() * 1 - 0.5;
        particle.size = Math.random() * 50 + 20;
        particle.opacity = Math.random() * 0.1 + 0.05;
        break;
    }

    this.particles.push(particle);
  }

  update() {
    if (!this.isActive) return;

    this.particles.forEach((p) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Add some turbulence
      if (p.type === "snow") {
        p.vx += Math.sin(p.y * 0.01) * 0.1;
      }

      // Reset particles that go off screen
      if (p.y > this.canvas.height) {
        p.y = -10;
        p.x = Math.random() * this.canvas.width;
      }
      if (p.x < -50) p.x = this.canvas.width + 50;
      if (p.x > this.canvas.width + 50) p.x = -50;
    });

    // Storm lightning effect
    if (this.currentWeather === "storm" && Math.random() > 0.995) {
      this.lightning = {
        x: Math.random() * this.canvas.width,
        life: 3,
      };
    }

    if (this.lightning) {
      this.lightning.life--;
      if (this.lightning.life <= 0) {
        this.lightning = null;
      }
    }
  }

  draw() {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const weather = this.weatherTypes[this.currentWeather];

    // Draw particles
    this.particles.forEach((p) => {
      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;

      if (p.type === "rain" || p.type === "storm") {
        // Rain drops
        this.ctx.strokeStyle = weather.color;
        this.ctx.lineWidth = p.size;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - p.vx, p.y - p.vy * 2);
        this.ctx.stroke();
      } else if (p.type === "snow") {
        // Snowflakes
        this.ctx.fillStyle = weather.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.type === "fog") {
        // Fog clouds
        const gradient = this.ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.size,
        );
        gradient.addColorStop(0, "rgba(200, 200, 200, 0.2)");
        gradient.addColorStop(1, "transparent");
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      }

      this.ctx.restore();
    });

    // Draw lightning
    if (this.lightning) {
      this.ctx.save();
      this.ctx.globalAlpha = this.lightning.life / 3;
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 3;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = "white";

      this.ctx.beginPath();
      let y = 0;
      let x = this.lightning.x;

      while (y < this.canvas.height) {
        this.ctx.lineTo(x, y);
        y += Math.random() * 50 + 20;
        x += Math.random() * 40 - 20;
      }

      this.ctx.stroke();
      this.ctx.restore();

      // Flash effect
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.lightning.life * 0.05})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  animate() {
    if (!this.isActive) return;

    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  start() {
    this.isActive = true;
    this.createWeatherParticles();
    this.animate();
  }

  stop() {
    this.isActive = false;
    this.particles = [];
  }
}

// Export for PrismFlow Browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = WeatherEngine;
}
