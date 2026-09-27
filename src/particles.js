// Ultra-optimized 60fps Canvas Particle Engine

export class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.confetti = [];
    this.symbols = ['❤️', '🌸', '✨', '💖', '🌹', '💕', '🌟', '🥰', '💌', '🌷', '💫', '💍', '💓', '💗'];
    this.lastFrameTime = performance.now();
    this.maxAmbientParticles = 36; // Optimal cap for 60fps buttery smooth performance

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initMouseTrail();
    this.spawnLoop();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initMouseTrail() {
    let lastTime = 0;
    const addTrail = (x, y) => {
      const now = performance.now();
      if (now - lastTime > 70) {
        lastTime = now;
        // Count active trail particles
        const trailCount = this.particles.filter(p => p.isTrail).length;
        if (trailCount >= 10) return;

        this.particles.push({
          isTrail: true,
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          size: 16 + Math.random() * 10,
          symbol: this.symbols[Math.floor(Math.random() * 5)],
          speedY: -(1.8 + Math.random() * 1.5),
          speedX: (Math.random() - 0.5) * 1.5,
          opacity: 0.9,
          decay: 0.035 + Math.random() * 0.02,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.06
        });
      }
    };

    window.addEventListener('mousemove', (e) => addTrail(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches[0]) addTrail(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }

  spawnAmbientParticle() {
    const ambientCount = this.particles.filter(p => !p.isTrail).length;
    if (ambientCount >= this.maxAmbientParticles) return;

    // 88% spawn along left & right margins to keep center UI card clear
    let posX;
    if (Math.random() < 0.88) {
      if (Math.random() < 0.5) {
        posX = Math.random() * (this.canvas.width * 0.28);
      } else {
        posX = this.canvas.width * 0.72 + Math.random() * (this.canvas.width * 0.28);
      }
    } else {
      posX = Math.random() * this.canvas.width;
    }

    this.particles.push({
      isTrail: false,
      x: posX,
      y: this.canvas.height + 30,
      size: 18 + Math.random() * 20,
      symbol: this.symbols[Math.floor(Math.random() * this.symbols.length)],
      speedY: -(2.4 + Math.random() * 2.6), // Fast smooth upward movement
      speedX: (Math.random() - 0.5) * 1.2,
      swayFreq: 0.015 + Math.random() * 0.02,
      swayAmp: 1.2 + Math.random() * 1.8,
      opacity: 0.1,
      maxOpacity: 0.75 + Math.random() * 0.25,
      decay: 0,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      time: Math.random() * 100
    });
  }

  spawnLoop() {
    setInterval(() => {
      this.spawnAmbientParticle();
    }, 220);
  }

  triggerCelebration() {
    const emojis = ['❤️', '💖', '💍', '✨', '🌹', '💕', '🎉', '🥂', '🌸', '💓'];
    const totalConfetti = 50; // Performance optimized side fireworks

    for (let i = 0; i < totalConfetti; i++) {
      const isLeft = i % 2 === 0;
      const startX = isLeft ? this.canvas.width * 0.08 : this.canvas.width * 0.92;
      const startY = this.canvas.height * 0.8;

      const vx = isLeft ? (2 + Math.random() * 6) : (-2 - Math.random() * 6);
      const vy = -(9 + Math.random() * 7);

      this.confetti.push({
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        gravity: 0.22 + Math.random() * 0.1,
        drag: 0.97,
        size: 16 + Math.random() * 18,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        opacity: 1,
        decay: 0.012 + Math.random() * 0.01,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }

  animate(currentTime) {
    const delta = Math.min((currentTime - this.lastFrameTime) / 16.67, 2);
    this.lastFrameTime = currentTime;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render Ambient & Trail Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.time = (p.time || 0) + delta;
      p.y += p.speedY * delta;
      p.x += (p.speedX + Math.sin(p.time * (p.swayFreq || 0.02)) * (p.swayAmp || 1)) * delta;
      p.rotation += p.rotSpeed * delta;

      if (p.decay) {
        p.opacity -= p.decay * delta;
      } else {
        if (p.y > this.canvas.height - 100) {
          p.opacity = Math.min(p.maxOpacity, p.opacity + 0.06 * delta);
        } else if (p.y < 100) {
          p.opacity -= 0.02 * delta;
        }
      }

      if (p.opacity <= 0 || p.y < -50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x | 0, p.y | 0);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.font = `${p.size | 0}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.symbol, 0, 0);
      this.ctx.restore();
    }

    // Render Side Fireworks Confetti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.vx *= c.drag;
      c.vy *= c.drag;
      c.vy += c.gravity * delta;
      c.x += c.vx * delta;
      c.y += c.vy * delta;
      c.opacity -= c.decay * delta;
      c.rotation += c.rotSpeed * delta;

      if (c.opacity <= 0 || c.y > this.canvas.height + 50) {
        this.confetti.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(c.x | 0, c.y | 0);
      this.ctx.rotate(c.rotation);
      this.ctx.globalAlpha = Math.max(0, c.opacity);
      this.ctx.font = `${c.size | 0}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(c.emoji, 0, 0);
      this.ctx.restore();
    }

    requestAnimationFrame(this.animate);
  }
}
