/* ==========================================================================
   State & Configuration
   ========================================================================== */
const state = {
    isRevealed: false,
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    flashlight: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    radius: 120, // Flashlight illumination radius
    dissolveRadius: 0
};

// DOM Element References
const darknessCanvas = document.getElementById('darknessCanvas');
const darknessCtx = darknessCanvas.getContext('2d');

const particleCanvas = document.getElementById('particleCanvas');
const particleCtx = particleCanvas.getContext('2d');

const customCursor = document.getElementById('customCursor');
const secretCandle = document.getElementById('secretCandle');
const bgMusic = document.getElementById('bgMusic');
const surpriseBtn = document.getElementById('surpriseBtn');
const surpriseModal = document.getElementById('surpriseModal');
const closeModal = document.getElementById('closeModal');

/* ==========================================================================
   Canvas Resizing
   ========================================================================== */
function resizeCanvases() {
    darknessCanvas.width = window.innerWidth;
    darknessCanvas.height = window.innerHeight;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

/* ==========================================================================
   Mouse & Custom Sparkle Cursor Tracking
   ========================================================================== */
window.addEventListener('mousemove', (e) => {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;

    // Custom star cursor movement
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;

    // Leave subtle trail particles
    if (Math.random() < 0.3) {
        createCursorTrailParticle(e.clientX, e.clientY);
    }
});

function createCursorTrailParticle(x, y) {
    const p = document.createElement('div');
    p.className = 'cursor-particle';
    const size = Math.random() * 6 + 2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;

    const dx = (Math.random() - 0.5) * 30;
    const dy = (Math.random() - 0.5) * 30;
    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--dy', `${dy}px`);

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
}

/* ==========================================================================
   Cinematic Flashlight & Darkness Dissolve Engine
   ========================================================================== */
function renderDarkness() {
    const width = darknessCanvas.width;
    const height = darknessCanvas.height;

    // Smooth inertia for flashlight tracking
    state.flashlight.x += (state.mouse.x - state.flashlight.x) * 0.12;
    state.flashlight.y += (state.mouse.y - state.flashlight.y) * 0.12;

    darknessCtx.clearRect(0, 0, width, height);

    if (!state.isRevealed) {
        // Draw complete darkness cover
        darknessCtx.fillStyle = 'rgba(10, 5, 8, 0.98)';
        darknessCtx.fillRect(0, 0, width, height);

        // Radial cut-out gradient for flashlight
        darknessCtx.globalCompositeOperation = 'destination-out';

        const grad = darknessCtx.createRadialGradient(
            state.flashlight.x, state.flashlight.y, 0,
            state.flashlight.x, state.flashlight.y, state.radius
        );

        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(0.6, 'rgba(0,0,0,0.85)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        darknessCtx.fillStyle = grad;
        darknessCtx.beginPath();
        darknessCtx.arc(state.flashlight.x, state.flashlight.y, state.radius, 0, Math.PI * 2);
        darknessCtx.fill();

        darknessCtx.globalCompositeOperation = 'source-over';
    } else {
        // Post-click expanding radial dissolve sequence
        if (state.dissolveRadius < Math.max(width, height) * 1.5) {
            darknessCtx.fillStyle = 'rgba(10, 5, 8, 0.98)';
            darknessCtx.fillRect(0, 0, width, height);

            darknessCtx.globalCompositeOperation = 'destination-out';

            const candleRect = secretCandle.getBoundingClientRect();
            const candleCenterX = candleRect.left + candleRect.width / 2;
            const candleCenterY = candleRect.top + candleRect.height / 2;

            const grad = darknessCtx.createRadialGradient(
                candleCenterX, candleCenterY, 0,
                candleCenterX, candleCenterY, state.dissolveRadius
            );

            grad.addColorStop(0, 'rgba(0,0,0,1)');
            grad.addColorStop(0.8, 'rgba(0,0,0,0.9)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            darknessCtx.fillStyle = grad;
            darknessCtx.beginPath();
            darknessCtx.arc(candleCenterX, candleCenterY, state.dissolveRadius, 0, Math.PI * 2);
            darknessCtx.fill();

            darknessCtx.globalCompositeOperation = 'source-over';

            state.dissolveRadius += 25; // Dissolve expansion speed
        }
    }

    requestAnimationFrame(renderDarkness);
}
requestAnimationFrame(renderDarkness);

/* ==========================================================================
   Continuous Atmospheric Particles (Hearts, Stars, Petals)
   ========================================================================== */
const ambientParticles = [];
const particleTypes = ['✨', '💖', '🌸', '⭐', '🎈'];

class AmbientParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * particleCanvas.width;
        this.y = particleCanvas.height + 20;
        this.size = Math.random() * 14 + 10;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.symbol = particleTypes[Math.floor(Math.random() * particleTypes.length)];
        this.opacity = Math.random() * 0.6 + 0.4;
        this.rotation = Math.random() * 360;
        this.rotSpeed = (Math.random() - 0.5) * 2;
    }

    update() {
        this.y -= this.speedY;
        this.x += Math.sin(this.y * 0.02) + this.speedX;
        this.rotation += this.rotSpeed;

        if (this.y < -30) this.reset();
    }

    draw() {
        particleCtx.save();
        particleCtx.globalAlpha = this.opacity;
        particleCtx.font = `${this.size}px serif`;
        particleCtx.translate(this.x, this.y);
        particleCtx.rotate((this.rotation * Math.PI) / 180);
        particleCtx.fillText(this.symbol, 0, 0);
        particleCtx.restore();
    }
}

for (let i = 0; i < 35; i++) {
    ambientParticles.push(new AmbientParticle());
}

function animateParticles() {
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    if (state.isRevealed) {
        ambientParticles.forEach(p => {
            p.update();
            p.draw();
        });
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* ==========================================================================
   Interactive Candle Click Reveal Sequence
   ========================================================================== */
secretCandle.addEventListener('click', () => {
    if (state.isRevealed) return;

    // Step 1: Set State & Play Audio
    state.isRevealed = true;
    bgMusic.play().catch(() => console.log('Audio autoplay blocked until interaction'));

    // Step 2: Animate Flame Glow Intensity
    gsap.to('.flame-glow', {
        scale: 3,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
    });

    // Step 3: Trigger Premium Confetti Burst
    setTimeout(() => {
        fireConfetti();
    }, 400);

    // Step 4: Reveal UI Components & Animate Page Elements
    setTimeout(() => {
        surpriseBtn.classList.remove('hidden');
        
        gsap.from('.main-title', {
            scale: 0.8,
            opacity: 0,
            duration: 1.5,
            ease: 'back.out(1.7)'
        });

        gsap.from('.polaroid', {
            y: -50,
            opacity: 0,
            duration: 1.2,
            stagger: 0.2,
            ease: 'bounce.out'
        });
    }, 1000);
});

/* ==========================================================================
   Confetti Cannon Engine
   ========================================================================== */
function fireConfetti() {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        colors: ['#FFD6E8', '#FF7EB6', '#E8B4B8', '#FFD700', '#FFFFFF']
    };

    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
        });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}

/* ==========================================================================
   Modal Dialog Logic
   ========================================================================== */
surpriseBtn.addEventListener('click', () => {
    surpriseModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
    surpriseModal.classList.remove('active');
});

surpriseModal.addEventListener('click', (e) => {
    if (e.target === surpriseModal) {
        surpriseModal.classList.remove('active');
    }
});