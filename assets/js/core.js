/* -----------------------------------------------
   CORE.js - Shared Engine
   Particles, Nav, Scroll, Progress
   ----------------------------------------------- */

// === PARTICLE BACKGROUND ===
function initParticles(count = 24) {
    const c = document.getElementById('particleCanvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    let particles = [], frame;

    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * c.width, y: Math.random() * -c.height,
            size: Math.random() * 14 + 6, speed: Math.random() * 0.6 + 0.3,
            type: Math.random() > 0.5 ? '🍄' : '🍃', opacity: Math.random() * 0.2 + 0.05
        });
    }

    function animate() {
        ctx.clearRect(0, 0, c.width, c.height);
        for (const p of particles) {
            p.y += p.speed;
            if (p.y > c.height + 20) { p.y = Math.random() * -c.height; p.x = Math.random() * c.width; }
            ctx.globalAlpha = p.opacity;
            ctx.font = `${p.size}px Arial`;
            ctx.fillText(p.type, p.x, p.y);
        }
        frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
}

// === HAMBURGER MENU (mobile) ===
function toggleMenu() {
    document.getElementById('mobileMenu')?.classList.toggle('-translate-x-full');
    document.getElementById('menuOverlay')?.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');
}

function closeMenu() {
    document.getElementById('mobileMenu')?.classList.add('-translate-x-full');
    document.getElementById('menuOverlay')?.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

// Close menu on resize to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 992) closeMenu();
});

// === READING PROGRESS ===
function initProgress() {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const st = document.documentElement.scrollTop || document.body.scrollTop;
                const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                bar.style.height = (sh > 0 ? (st / sh) * 100 : 0) + '%';
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// === BACK TO TOP ===
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        const show = window.scrollY > 300;
        btn.style.opacity = show ? '1' : '0';
        btn.style.pointerEvents = show ? 'auto' : 'none';
    }, { passive: true });
}

// === HAPTIC ===
function vibe() { navigator.vibrate?.(15); }
function playClick() { vibe(); }

// === THEME MANAGER ===
function initTheme() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;

    const storedTheme = localStorage.getItem('theme');
    let isDark = storedTheme ? (storedTheme === 'dark') : document.documentElement.classList.contains('dark');

    syncTheme(isDark);

    toggleBtn.addEventListener('click', () => {
        isDark = !isDark;
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        syncTheme(isDark);
        playClick();
    });

    function syncTheme(dark) {
        const icon = document.getElementById('themeToggleIcon');
        if (dark) {
            document.documentElement.classList.add('dark');
            if (icon) {
                icon.className = 'fas fa-sun text-lg text-amber-400 transition-transform duration-500 rotate-0 scale-100';
            }
        } else {
            document.documentElement.classList.remove('dark');
            if (icon) {
                icon.className = 'fas fa-moon text-lg text-emerald-600 transition-transform duration-500 rotate-[360deg] scale-100';
            }
        }
    }
}

// === BOOT ===
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initProgress();
    initBackToTop();
    initTheme();
});
