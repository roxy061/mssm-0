/* -----------------------------------------------
   CORE.js - Shared Engine
   Particles, Nav, Scroll, Progress
   ----------------------------------------------- */

// === MOBILE DETECTION UTILITY ===
const _isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

// === PARTICLE BACKGROUND ===
function initParticles(count) {
    const c = document.getElementById('particleCanvas');
    if (!c) return;
    // On mobile: fewer particles + skip if low-perf mode
    if (localStorage.getItem('performanceMode') === 'low') return;
    const mobileCount = _isMobile ? 8 : (count || 24);
    const ctx = c.getContext('2d');
    let particles = [], frame, lastTime = 0;
    const targetFPS = _isMobile ? 20 : 60;
    const frameInterval = 1000 / targetFPS;

    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    for (let i = 0; i < mobileCount; i++) {
        particles.push({
            x: Math.random() * c.width, y: Math.random() * -c.height,
            size: Math.random() * 14 + 6, speed: Math.random() * 0.6 + 0.3,
            type: Math.random() > 0.5 ? '🍄' : '🍃', opacity: Math.random() * 0.15 + 0.03
        });
    }

    function animate(timestamp) {
        frame = requestAnimationFrame(animate);
        const delta = timestamp - lastTime;
        if (delta < frameInterval) return;
        lastTime = timestamp - (delta % frameInterval);

        ctx.clearRect(0, 0, c.width, c.height);
        for (const p of particles) {
            p.y += p.speed;
            if (p.y > c.height + 20) { p.y = Math.random() * -c.height; p.x = Math.random() * c.width; }
            ctx.globalAlpha = p.opacity;
            ctx.font = `${p.size}px Arial`;
            ctx.fillText(p.type, p.x, p.y);
        }
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
}

// === HAMBURGER MENU (mobile) — Bulletproof Version ===
(function() {
    // Inject GPU-composited sidebar style once
    const s = document.createElement('style');
    s.textContent = `
        #mobileMenu {
            will-change: transform;
            contain: layout style;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
            touch-action: pan-y;
        }
        #menuOverlay {
            will-change: opacity;
        }
    `;
    document.head.appendChild(s);
})();

// State flag to prevent double-toggle glitch
let _menuOpen = false;

function _getMenuEls() {
    return {
        menu: document.getElementById('mobileMenu'),
        overlay: document.getElementById('menuOverlay')
    };
}

function openMenu() {
    const { menu, overlay } = _getMenuEls();
    if (!menu || _menuOpen) return;
    _menuOpen = true;
    // Remove hidden first so transition plays
    menu.classList.remove('hidden');
    // Force reflow to ensure transition fires
    void menu.offsetHeight;
    menu.classList.remove('-translate-x-full');
    menu.setAttribute('aria-hidden', 'false');
    overlay?.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeMenu() {
    if (window.innerWidth >= 1024) return;
    const { menu, overlay } = _getMenuEls();
    if (!menu) return;
    _menuOpen = false;
    menu.classList.add('-translate-x-full');
    menu.setAttribute('aria-hidden', 'true');
    overlay?.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    // Add hidden AFTER transition ends (300ms) to keep it off-screen
    setTimeout(() => {
        if (!_menuOpen) menu.classList.add('hidden');
    }, 310);
}

function toggleMenu() {
    _menuOpen ? closeMenu() : openMenu();
}

// Close menu on resize to desktop
let _resizeMTimer;
window.addEventListener('resize', () => {
    clearTimeout(_resizeMTimer);
    _resizeMTimer = setTimeout(() => {
        if (window.innerWidth >= 1024) {
            const { menu, overlay } = _getMenuEls();
            if (menu) {
                _menuOpen = false;
                menu.classList.remove('hidden', '-translate-x-full');
                menu.setAttribute('aria-hidden', 'false');
            }
            overlay?.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }, 150);
}, { passive: true });

// Swipe-left to close gesture on mobile
document.addEventListener('DOMContentLoaded', () => {
    const { menu } = _getMenuEls();
    if (!menu) return;
    let swipeStartX = 0, swipeStartY = 0;
    menu.addEventListener('touchstart', (e) => {
        swipeStartX = e.touches[0].clientX;
        swipeStartY = e.touches[0].clientY;
    }, { passive: true });
    menu.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - swipeStartX;
        const dy = Math.abs(e.changedTouches[0].clientY - swipeStartY);
        // Swipe left >= 60px and mostly horizontal
        if (dx < -60 && dy < 80) closeMenu();
    }, { passive: true });
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
    let bttTicking = false;
    window.addEventListener('scroll', () => {
        if (!bttTicking) {
            requestAnimationFrame(() => {
                const show = window.scrollY > 300;
                btn.style.opacity = show ? '1' : '0';
                btn.style.pointerEvents = show ? 'auto' : 'none';
                bttTicking = false;
            });
            bttTicking = true;
        }
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
        window.dispatchEvent(new Event('themechanged'));
        playClick();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            const dark = localStorage.getItem('theme') === 'dark';
            syncTheme(dark);
        }
        if (e.key === 'themeColor') {
            applyThemeColorOverride();
        }
    });

    // Run on boot to ensure current tab color override matches localStorage
    applyThemeColorOverride();
}

function syncTheme(dark) {
    const icon = document.getElementById('themeToggleIcon');
    if (dark) {
        document.documentElement.classList.add('dark');
        if (icon) {
            icon.className = 'fas fa-sun text-sm text-amber-400 transition-transform duration-500 rotate-0 scale-100';
        }
    } else {
        document.documentElement.classList.remove('dark');
        if (icon) {
            icon.className = 'fas fa-moon text-sm text-emerald-100 transition-transform duration-500 rotate-[360deg] scale-100';
        }
    }
}

function applyThemeColorOverride() {
    const themeColor = localStorage.getItem('themeColor') || 'emerald';
    const colorMap = {
        emerald: { brand: '#10b981', hover: '#059669', bg: 'rgba(16, 185, 129, 0.1)' },
        blue: { brand: '#3b82f6', hover: '#2563eb', bg: 'rgba(59, 130, 246, 0.1)' },
        violet: { brand: '#8b5cf6', hover: '#7c3aed', bg: 'rgba(139, 92, 246, 0.1)' },
        amber: { brand: '#f59e0b', hover: '#d97706', bg: 'rgba(245, 158, 11, 0.1)' },
        rose: { brand: '#f43f5e', hover: '#e11d48', bg: 'rgba(244, 63, 94, 0.1)' }
    };
    const colors = colorMap[themeColor] || colorMap.emerald;
    
    let style = document.getElementById('theme-color-override');
    if (!style) {
        style = document.createElement('style');
        style.id = 'theme-color-override';
        document.head.appendChild(style);
    }
    
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '16, 185, 129';
    };

    style.innerHTML = `
        :root {
            --color-brand: ${colors.brand};
            --color-brand-hover: ${colors.hover};
            --color-brand-bg: ${colors.bg};
        }
        .text-emerald-400 { color: ${colors.brand} !important; }
        .text-emerald-500 { color: ${colors.brand} !important; }
        .text-emerald-600 { color: ${colors.hover} !important; }
        .bg-emerald-500 { background-color: ${colors.brand} !important; }
        .bg-emerald-600 { background-color: ${colors.hover} !important; }
        .border-emerald-500 { border-color: ${colors.brand} !important; }
        .border-emerald-600 { border-color: ${colors.hover} !important; }
        .focus\\:border-emerald-500:focus { border-color: ${colors.brand} !important; }
        .focus\\:ring-emerald-500\\/20:focus { --tw-ring-color: rgba(${hexToRgb(colors.brand)}, 0.2) !important; }
        .hover\\:bg-emerald-50:hover { background-color: ${colors.bg} !important; }
        .hover\\:bg-emerald-600:hover { background-color: ${colors.hover} !important; }
        .hover\\:text-emerald-400:hover { color: ${colors.brand} !important; }
        .bg-gradient-to-br.from-emerald-500.to-emerald-800 { background-image: linear-gradient(135deg, ${colors.brand}, ${colors.hover}) !important; }
    `;
}

// === SMART SCROLL CONTROLS ===
function initSmartHeader() {
    let lastScrollY = window.scrollY;
    const themeBtn = document.getElementById('themeToggle');
    const hamBtn = document.getElementById('hamburgerBtn');
    const connBtn = document.getElementById('connBadge');
    let smartTicking = false;

    window.addEventListener('scroll', () => {
        if (!smartTicking) {
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                if (currentScrollY > 150) {
                    const hide = currentScrollY > lastScrollY;
                    const method = hide ? 'add' : 'remove';
                    themeBtn?.classList[method]('-translate-y-24', 'opacity-0', 'pointer-events-none');
                    hamBtn?.classList[method]('-translate-y-24', 'opacity-0', 'pointer-events-none');
                    connBtn?.classList[method]('-translate-y-24', 'opacity-0', 'pointer-events-none');
                } else {
                    themeBtn?.classList.remove('-translate-y-24', 'opacity-0', 'pointer-events-none');
                    hamBtn?.classList.remove('-translate-y-24', 'opacity-0', 'pointer-events-none');
                    connBtn?.classList.remove('-translate-y-24', 'opacity-0', 'pointer-events-none');
                }
                lastScrollY = currentScrollY;
                smartTicking = false;
            });
            smartTicking = true;
        }
    }, { passive: true });
}

// === NETWORK STATUS TOAST & LIVE BADGE ===
function initNetworkStatus() {
    const badge = document.createElement('div');
    badge.id = 'connBadge';
    // On mobile: skip heavy backdrop-blur
    const blurClass = _isMobile ? 'bg-white/95 dark:bg-gray-800/95' : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md';
    badge.className = `fixed top-3 right-16 md:top-5 md:right-24 z-[100] flex items-center gap-1.5 px-2.5 py-2 rounded-xl ${blurClass} border border-gray-200 dark:border-gray-700 shadow-md transition-all duration-300`;
    document.body.appendChild(badge);

    const toast = document.createElement('div');
    toast.id = 'network-status-toast';
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-full text-sm font-bold shadow-xl border backdrop-blur-md transition-all duration-500 translate-y-20 opacity-0 pointer-events-none flex items-center gap-2';
    document.body.appendChild(toast);

    function updateStatus(isOnline) {
        if (isOnline) {
            badge.innerHTML = `
                <span class="relative flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">LIVE</span>
            `;
            if (toast.dataset.initialized) {
                toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-full text-sm font-bold shadow-xl border backdrop-blur-md transition-all duration-500 translate-y-0 opacity-100 bg-emerald-500/90 dark:bg-emerald-600/90 text-white border-emerald-400/30 flex items-center gap-2 animate-pop-in';
                toast.innerHTML = '<i class="fas fa-bolt animate-pulse"></i> ออนไลน์แล้ว: ระบบพร้อมใช้งาน';
                setTimeout(() => {
                    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-full text-sm font-bold shadow-xl border backdrop-blur-md transition-all duration-500 translate-y-20 opacity-0 pointer-events-none flex items-center gap-2';
                }, 3000);
            }
        } else {
            badge.innerHTML = `
                <span class="relative flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider animate-pulse">OFFLINE</span>
            `;
            toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-full text-sm font-bold shadow-xl border backdrop-blur-md transition-all duration-500 translate-y-0 opacity-100 bg-red-500/90 dark:bg-red-600/90 text-white border-red-400/30 flex items-center gap-2 animate-pop-in';
            toast.innerHTML = '<i class="fas fa-wifi-slash animate-bounce"></i> ออฟไลน์อยู่: ตรวจสอบสัญญาณเน็ต';
        }
        toast.dataset.initialized = "true";
    }

    window.addEventListener('online', () => updateStatus(true));
    window.addEventListener('offline', () => updateStatus(false));

    updateStatus(navigator.onLine);
}

// === LIGHTWEIGHT SCROLL REVEAL ENGINE ===
function initScrollReveal() {
    const style = document.createElement('style');
    style.innerHTML = `
        .scroll-reveal {
            opacity: 0;
            transform: translateY(15px);
            will-change: opacity, transform;
            transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        .scroll-reveal.reveal-active {
            opacity: 1;
            transform: translateY(0);
            will-change: auto;
        }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
    });

    // On mobile: target fewer elements to reduce layout thrashing
    const selector = _isMobile ? 'section' : 'section, .card-shine, .p-5, .p-7, main > div';
    const targets = document.querySelectorAll(selector);
    targets.forEach(t => {
        t.classList.add('scroll-reveal');
        observer.observe(t);
    });
}

// === COMMAND PALETTE (CTRL+K) ===
function initCommandPalette() {
    const el = document.createElement('div');
    el.id = 'cmdPalette';
    el.className = 'hidden fixed inset-0 z-[10000] bg-black/40 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4';
    el.innerHTML = `
        <div class="bg-white/95 dark:bg-gray-900/95 w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-pop-in">
            <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <i class="fas fa-search text-gray-400 dark:text-gray-500"></i>
                <input type="text" id="cmdInput" placeholder="ค้นหาเมนูหรือพิมพ์คำสั่งด่วน... (เช่น สลับโหมด, หน้าแรก)" class="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none">
                <span class="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-bold">ESC</span>
            </div>
            <div id="cmdList" class="max-h-[300px] overflow-y-auto p-2 space-y-0.5">
            </div>
        </div>
    `;
    document.body.appendChild(el);

    const commands = [
        { text: 'ไปหน้าแรก (Home Page)', icon: 'fa-home', action: () => location.href = 'index.html' },
        { text: 'ไปหน้า MSSM Lab', icon: 'fa-flask', action: () => location.href = 'lab.html' },
        { text: 'ไปหน้า AI Assistant', icon: 'fa-robot', action: () => location.href = 'ai.html' },
        { text: 'สลับโหมด มืด/สว่าง (Toggle Theme)', icon: 'fa-adjust', action: () => {
            const toggleBtn = document.getElementById('themeToggle');
            if (toggleBtn) toggleBtn.click();
        }},
        { text: 'คืนค่าเริ่มต้นระบบจำลอง (Reset Lab)', icon: 'fa-undo', action: () => {
            if (typeof resetAll === 'function') {
                resetAll();
            } else {
                localStorage.removeItem('mssm_lab_inputs');
                location.href = 'lab.html';
            }
        }},
        { text: 'เปิดตั้งค่า API Key', icon: 'fa-cog', action: () => {
            if (typeof openSettings === 'function') {
                openSettings();
            } else {
                location.href = 'ai.html?openSettings=true';
            }
        }}
    ];

    const cmdInput = document.getElementById('cmdInput');
    const cmdList = document.getElementById('cmdList');
    let selectedIdx = 0;
    let filteredCmds = [...commands];

    function renderList() {
        cmdList.innerHTML = '';
        if (filteredCmds.length === 0) {
            cmdList.innerHTML = `<div class="p-3 text-center text-xs text-gray-400 dark:text-gray-500 italic"><i class="fas fa-search-minus"></i> ไม่พบคำสั่งดังกล่าว</div>`;
            return;
        }
        filteredCmds.forEach((cmd, idx) => {
            const div = document.createElement('div');
            const activeClass = idx === selectedIdx ? 'bg-emerald-500 text-white shadow-md scale-[1.01]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60';
            div.className = `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${activeClass}`;
            div.innerHTML = `<i class="fas ${cmd.icon} w-5 text-center"></i> <span>${cmd.text}</span>`;
            div.addEventListener('click', () => {
                cmd.action();
                closePalette();
            });
            cmdList.appendChild(div);
        });
    }

    function openPalette() {
        el.classList.remove('hidden');
        cmdInput.value = '';
        selectedIdx = 0;
        filteredCmds = [...commands];
        renderList();
        setTimeout(() => cmdInput.focus(), 50);
    }

    function closePalette() {
        el.classList.add('hidden');
    }

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (el.classList.contains('hidden')) {
                openPalette();
            } else {
                closePalette();
            }
        }
        if (e.key === 'Escape') {
            closePalette();
        }
    });

    el.addEventListener('click', (e) => {
        if (e.target === el) closePalette();
    });

    cmdInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filteredCmds = commands.filter(cmd => cmd.text.toLowerCase().includes(query));
        selectedIdx = 0;
        renderList();
    });

    cmdInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIdx = (selectedIdx + 1) % filteredCmds.length;
            renderList();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIdx = (selectedIdx - 1 + filteredCmds.length) % filteredCmds.length;
            renderList();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCmds[selectedIdx]) {
                filteredCmds[selectedIdx].action();
                closePalette();
            }
        }
    });
}

// === CENTRALIZED SIDEBAR RENDERING ===
function renderSidebar() {
    const sidebar = document.getElementById('mobileMenu');
    if (!sidebar) return;
    
    // Parse URL parameter ?mode= to override global render mode
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    if (modeParam === '2d' || modeParam === '3d') {
        localStorage.setItem('globalRenderMode', modeParam);
    }
    
    const path = window.location.pathname;
    const isIndex = path.endsWith('index.html') || path.endsWith('/') || !path.includes('.html');
    const curFile = path.split('/').pop() || 'index.html';
    const curHash = window.location.hash;
    const curMode = new URLSearchParams(window.location.search).get('mode') || localStorage.getItem('globalRenderMode') || '2d';

    let builderBtnClass = "bg-gradient-to-br from-indigo-500 to-purple-600 text-white";
    let builderBadge = "";
    if (curMode === '3d') {
        builderBtnClass = "bg-gradient-to-br from-purple-600 via-pink-650 to-indigo-650 text-white animate-pulse shadow-md shadow-pink-500/20";
        builderBadge = '<span class="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[8px] font-black bg-pink-500 text-white rounded-full uppercase tracking-widest animate-bounce">3D</span>';
    }

    const menuGroups = [
        {
            id: "group_main",
            label: "1🏠 กลุ่มเมนูหลัก",
            items: [
                { href: "index.html", label: "1.1 หน้าแรก", icon: "fa-home", colorClass: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" },
                { href: isIndex ? "#products" : "index.html#products", label: "1.2 สายพันธุ์เห็ด", icon: "fa-seedling", colorClass: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" },
                { href: isIndex ? "#charts" : "index.html#charts", label: "1.3 ประเมินผล", icon: "fa-chart-bar", colorClass: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" },
                { href: isIndex ? "#zerowaste" : "index.html#zerowaste", label: "1.4 Zero Waste", icon: "fa-recycle", colorClass: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" },
                { href: isIndex ? "#contact" : "index.html#contact", label: "1.5 ติดต่อ", icon: "fa-envelope", colorClass: "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400" }
            ]
        },
        {
            id: "group_tools",
            label: "2⚙️ กลุ่มเครื่องมือการทำงาน",
            items: [
                { href: "lab.html", label: "2.1 MSSM Lab", icon: "fa-flask", colorClass: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white" },
                { href: "ai.html", label: "2.2 AI Assistant", icon: "fa-robot", colorClass: "bg-gradient-to-br from-amber-400 to-amber-600 text-white" },
                {
                    id: "group_tools_builder",
                    label: "2.3 ออกแบบโรงเรือน (Builder)",
                    icon: "fa-cubes",
                    colorClass: builderBtnClass,
                    isBuilder: true,
                    subitems: [
                        { href: "builder2d.html?mode=2d", label: "2.3.1 ออกแบบจำลอง 2D", icon: "fa-cubes", colorClass: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" },
                        { href: "mushroom_3d.html?mode=3d", label: "2.3.2 ออกแบบจำลอง 3D", icon: "fa-cube", colorClass: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" }
                    ]
                }
            ]
        },
        {
            id: "group_data",
            label: "3📊 กลุ่มข้อมูลและการจัดการ",
            items: [
                { href: "market.html", label: "3.1 ตลาดราคากลาง", icon: "fa-chart-line", colorClass: "bg-gradient-to-br from-rose-500 to-rose-600 text-white" },
                { href: "quiz_pvp.html", label: "3.2 ทดสอบความรู้", icon: "fa-trophy", colorClass: "bg-gradient-to-br from-amber-500 to-orange-600 text-white" },
                {
                    id: "group_data_research",
                    label: "3.3 คลังข้อมูลวิจัย",
                    icon: "fa-database",
                    colorClass: "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
                    subitems: [
                        { href: "dataset.html", label: "3.3.1 คลังข้อมูลวิจัย", icon: "fa-database", colorClass: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" },
                        { href: "doc.html", label: "3.3.2 คู่มือวิจัย", icon: "fa-book", colorClass: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" }
                    ]
                },
                { href: "management.html", label: "3.4 การจัดการฟาร์ม", icon: "fa-tasks", colorClass: "bg-gradient-to-br from-indigo-400 to-indigo-650 text-white" }
            ]
        },
        {
            id: "group_info",
            label: "4ℹ️กลุ่มข้อมูลโครงการและอื่นๆ",
            items: [
                { href: "https://docs.google.com/forms/d/e/1FAIpQLSfv9wysUClz6pVb4c6e1fMVbXUn-a0MU5Yj9ui9HSoSLch2Jw/viewform", label: "4.1 แบบสอบถาม", icon: "fa-poll", colorClass: "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400", target: "_blank" },
                { href: "settings.html", label: "4.2 ศูนย์ตั้งค่า", icon: "fa-cog", colorClass: "bg-gradient-to-br from-gray-500 to-slate-700 text-white" }
            ]
        }
    ];

    function isItemActive(item) {
        if (item.href.startsWith('http')) return false;
        
        const hrefParts = item.href.split('#');
        const hrefBase = hrefParts[0];
        const hrefHash = hrefParts[1] ? '#' + hrefParts[1] : '';
        
        const targetFile = hrefBase.split('?')[0] || 'index.html';
        const targetMode = new URLSearchParams(hrefBase.split('?')[1] || '').get('mode');
        
        const targetIsIndex = targetFile === 'index.html' || targetFile === '';
        
        if (targetIsIndex) {
            if (!isIndex) return false;
            if (hrefHash) {
                return curHash === hrefHash;
            }
            return curHash === '' || curHash === '#top';
        }
        
        const testCurFile = curFile === '' || curFile === '/' ? 'index.html' : curFile;
        if (testCurFile === targetFile) {
            if (targetMode) {
                return targetMode === curMode;
            }
            return true;
        }
        return false;
    }

    const isAutoTour = localStorage.getItem('autoTourEnabled') === 'true';

    function shouldExpand(groupId, defaultActive) {
        if (isAutoTour) return true;
        const stored = localStorage.getItem('sidebar_expanded_' + groupId);
        if (stored !== null) {
            return stored === 'true';
        }
        return defaultActive;
    }

    let html = '';
    menuGroups.forEach(group => {
        const isGroupActive = group.items.some(item => {
            if (item.subitems) {
                return item.subitems.some(sub => isItemActive(sub));
            }
            return isItemActive(item);
        });
        const isGroupExpanded = shouldExpand(group.id, isGroupActive);
        
        html += `
            <!-- Group: ${group.label} -->
            <div class="mb-2">
                <div onclick="toggleSidebarGroup('${group.id}')" class="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 cursor-pointer select-none transition-all duration-200 border border-transparent hover:border-emerald-500/10 dark:hover:border-emerald-500/5">
                    <span>${group.label}</span>
                    <span class="flex items-center justify-center w-5 h-5 rounded-full bg-gray-150/40 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500">
                        <i id="${group.id}_chevron" class="fas fa-chevron-down text-[8px] transition-transform duration-300 ${isGroupExpanded ? 'rotate-180' : ''}"></i>
                    </span>
                </div>
                <div id="${group.id}" class="overflow-hidden transition-all duration-300 ease-in-out pl-2 border-l border-slate-100 dark:border-slate-800/80 ml-3.5 space-y-1 mt-1 ${isGroupExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}">
        `;
        
        group.items.forEach(item => {
            if (item.subitems) {
                const isSubActive = item.subitems.some(sub => isItemActive(sub));
                const isSubExpanded = shouldExpand(item.id, isSubActive);
                
                html += `
                    <div class="mb-0.5">
                        <div onclick="toggleSidebarGroup('${item.id}')" class="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 cursor-pointer select-none transition-all duration-200">
                            <span class="flex items-center gap-3">
                                <span class="w-7 h-7 flex items-center justify-center rounded-lg ${item.colorClass} text-xs relative">
                                    <i class="fas ${item.icon}"></i>
                                    ${item.isBuilder && curMode === '3d' ? builderBadge : ''}
                                </span>
                                <span>${item.label}</span>
                            </span>
                            <span class="flex items-center justify-center w-5 h-5">
                                <i id="${item.id}_chevron" class="fas fa-chevron-down text-[8px] transition-transform duration-300 ${isSubExpanded ? 'rotate-180' : ''}"></i>
                            </span>
                        </div>
                        <div id="${item.id}" class="overflow-hidden transition-all duration-300 ease-in-out pl-3 border-l border-slate-100 dark:border-slate-800/80 ml-5.5 space-y-1 mt-0.5 ${isSubExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}">
                `;
                
                item.subitems.forEach(sub => {
                    const isActive = isItemActive(sub);
                    const activeClass = isActive
                        ? "nav-item active flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold text-gray-700 dark:text-gray-200 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/10 shadow-sm transition-all"
                        : "nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-gray-900 dark:hover:text-gray-100 transition-all";
                        
                    html += `
                        <a href="${sub.href}" class="${activeClass}">
                            <span class="w-5 h-5 flex items-center justify-center rounded-md ${sub.colorClass || 'bg-gray-100 dark:bg-gray-800'} text-[10px]"><i class="fas ${sub.icon}"></i></span>
                            <span>${sub.label}</span>
                        </a>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            } else {
                const isActive = isItemActive(item);
                const activeClass = isActive
                    ? "nav-item active flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/10 shadow-sm transition-all"
                    : "nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-gray-900 dark:hover:text-gray-100 transition-all";
                    
                html += `
                    <a href="${item.href}" ${item.target ? `target="${item.target}"` : ""} class="${activeClass} relative">
                        <span class="w-7 h-7 flex items-center justify-center rounded-lg ${item.colorClass} text-xs"><i class="fas ${item.icon}"></i></span>
                        <span>${item.label}</span>
                    </a>
                `;
            }
        });
        
        html += `
                </div>
            </div>
        `;
    });

    sidebar.innerHTML = `
        <!-- Brand Header -->
        <div class="bg-gradient-to-br from-emerald-500 to-emerald-800 dark:from-emerald-600 dark:to-gray-900 p-5 text-center shrink-0 relative overflow-hidden flex items-center justify-between">
            <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(circle at 20% 50%,#fff 0,transparent 50%)"></div>
            <div class="text-left relative z-10">
                <div class="text-base font-extrabold text-white drop-shadow-lg flex items-center gap-1">🍄 Mush-Up NVC</div>
                <div class="text-[9px] text-emerald-200 dark:text-emerald-300 font-medium -mt-0.5">MSSM Platform</div>
            </div>
            <button id="themeToggle" class="w-8 h-8 rounded-full bg-white/10 dark:bg-gray-800/30 text-white flex items-center justify-center border border-white/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer relative z-10">
                <i id="themeToggleIcon" class="fas fa-sun text-sm"></i>
            </button>
        </div>

        <!-- Close Button (Mobile) -->
        <button onclick="closeMenu()" class="lg:hidden absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"><i class="fas fa-times text-sm"></i></button>

        <!-- Nav Items -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            ${html}
        </nav>
    `;

    if (!window._hashListenerAdded) {
        window._hashListenerAdded = true;
        window.addEventListener('hashchange', renderSidebar);
    }
}

// === CENTRALIZED SIDEBAR GROUP COLLAPSE/EXPAND TOGGLE ===
window.toggleSidebarGroup = function(groupId) {
    const groupEl = document.getElementById(groupId);
    const chevronEl = document.getElementById(groupId + '_chevron');
    if (!groupEl) return;
    
    const isExpanded = groupEl.classList.contains('max-h-[1000px]');
    
    if (isExpanded) {
        groupEl.classList.remove('max-h-[1000px]', 'opacity-100');
        groupEl.classList.add('max-h-0', 'opacity-0', 'pointer-events-none');
        localStorage.setItem('sidebar_expanded_' + groupId, 'false');
        if (chevronEl) chevronEl.classList.remove('rotate-180');
    } else {
        groupEl.classList.remove('max-h-0', 'opacity-0', 'pointer-events-none');
        groupEl.classList.add('max-h-[1000px]', 'opacity-100');
        localStorage.setItem('sidebar_expanded_' + groupId, 'true');
        if (chevronEl) chevronEl.classList.add('rotate-180');
    }
};

// Deprecated alias for backward compatibility
function toggleBuilderSubmenu(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    window.toggleSidebarGroup('group_tools_builder');
}

// === PWA SETUP ===
function initPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('ServiceWorker registration successful with scope: ', reg.scope))
                .catch(err => console.log('ServiceWorker registration failed: ', err));
        });
    }
}

// === GLOBAL AUTO-TOUR PRESENTATION ENGINE ===
const TOUR_PAGES = [
    "index.html",
    "lab.html",
    "ai.html",
    "builder2d.html",
    "mushroom_3d.html",
    "market.html",
    "quiz_pvp.html",
    "dataset.html",
    "management.html",
    "doc.html",
    "settings.html"
];

function initAutoTour() {
    const isEnabled = localStorage.getItem('autoTourEnabled') === 'true';
    if (!isEnabled) return;

    // Get current filename
    let curPath = window.location.pathname;
    let curPage = curPath.split('/').pop() || 'index.html';
    if (curPage === '' || curPage === '/') curPage = 'index.html';

    // Find current index in tour pages
    let curIdx = TOUR_PAGES.findIndex(p => curPage.includes(p));
    if (curIdx === -1) {
        curIdx = 0;
    }

    const nextIdx = (curIdx + 1) % TOUR_PAGES.length;
    const nextUrl = TOUR_PAGES[nextIdx];

    // 1. Create floating countdown badge
    const badge = document.createElement('div');
    badge.id = 'autoTourBadge';
    const tourBlur = _isMobile ? 'bg-slate-900/98' : 'bg-slate-900/95 backdrop-blur-md';
    badge.className = `fixed bottom-4 right-4 z-[9999] ${tourBlur} dark:bg-slate-950/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/50 flex items-center gap-3 transition-all duration-300 font-sans`;
    badge.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-red-500" style="animation:pulse 2s ease-in-out infinite;"></span>
        <span class="text-xs font-bold">โหมดนำเสนอ: หน้าถัดไปใน <span id="autoTourSeconds" class="font-mono text-cyan-400">10</span> วินาที</span>
        <button onclick="stopAutoTourFromBadge(event)" class="text-[10px] bg-red-550/20 text-red-400 hover:bg-red-500 hover:text-white px-2.5 py-1 rounded-lg font-black transition cursor-pointer border-none">หยุดทัวร์</button>
    `;
    document.body.appendChild(badge);

    // 2. Create Virtual Ghost Cursor element
    const cursor = document.createElement('div');
    cursor.id = 'virtualCursor';
    cursor.style.cssText = 'position:fixed; pointer-events:none; z-index:10000; width:24px; height:24px; top:0; left:0; transform: translate3d(50vw, 50vh, 0); transition: transform 2.2s cubic-bezier(0.16, 1, 0.3, 1); will-change: transform;';
    cursor.innerHTML = `
        <svg class="w-full h-full text-cyan-400" style="filter:drop-shadow(0 0 6px rgba(6,182,212,0.6));" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.5 3v15.3l4.3-4.3 3 5.3 2.1-1.2-3-5.2 5.5-.6L4.5 3z"/>
        </svg>
    `;
    document.body.appendChild(cursor);

    // 3. Auto-Scroll logic — slower interval on mobile to prevent stuttering
    let currentScroll = window.scrollY;
    const scrollInterval = _isMobile ? 3000 : 1800;
    const scrollTimer = setInterval(() => {
        if (localStorage.getItem('autoTourEnabled') !== 'true') return;
        
        // Scroll main page
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0) {
            const rand = Math.random();
            let scrollAmount = 0;
            if (rand < 0.5) {
                scrollAmount = (_isMobile ? 100 : 150) + Math.random() * (_isMobile ? 120 : 200);
            } else if (rand < 0.8) {
                scrollAmount = -((_isMobile ? 60 : 100) + Math.random() * (_isMobile ? 60 : 100));
            } else {
                scrollAmount = 0;
            }

            currentScroll = Math.max(0, Math.min(maxScroll, currentScroll + scrollAmount));
            window.scrollTo({
                top: currentScroll,
                behavior: 'smooth'
            });
        }

        // Scroll sidebar — skip on mobile (sidebar hidden anyway)
        if (!_isMobile) {
            const menuNav = document.querySelector('#mobileMenu nav');
            if (menuNav) {
                const menuMaxScroll = menuNav.scrollHeight - menuNav.clientHeight;
                if (menuMaxScroll > 0) {
                    const menuRand = Math.random();
                    let menuScrollAmount = 0;
                    if (menuRand < 0.5) {
                        menuScrollAmount = 60 + Math.random() * 80;
                    } else if (menuRand < 0.8) {
                        menuScrollAmount = -(60 + Math.random() * 80);
                    }
                    menuNav.scrollTo({
                        top: Math.max(0, Math.min(menuMaxScroll, menuNav.scrollTop + menuScrollAmount)),
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, scrollInterval);

    // 4. Ghost Cursor Movement sequence
    if (curPage.includes('mushroom_3d.html')) {
        // --- 3D CAMERA ROTATION SIMULATION FOR MUSHROOM_3D.HTML ---
        setTimeout(() => {
            if (localStorage.getItem('autoTourEnabled') !== 'true') return;
            const container = document.getElementById('canvas3d') || document.querySelector('canvas');
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Move cursor to center of 3D view
            cursor.style.transform = `translate3d(${centerX}px, ${centerY}px, 0)`;

            setTimeout(() => {
                if (localStorage.getItem('autoTourEnabled') !== 'true') return;
                const canvas = container.querySelector('canvas') || container;

                // Helper to dispatch drag events (supports both modern PointerEvent and legacy MouseEvent)
                function sendDrag(type, cx, cy) {
                    try {
                        const pe = new PointerEvent(type.replace('mouse', 'pointer'), {
                            bubbles: true, cancelable: true, view: window,
                            clientX: cx, clientY: cy,
                            pointerId: 1, isPrimary: true
                        });
                        canvas.dispatchEvent(pe);
                    } catch (e) {}
                    try {
                        const me = new MouseEvent(type, {
                            bubbles: true, cancelable: true, view: window,
                            clientX: cx, clientY: cy
                        });
                        canvas.dispatchEvent(me);
                    } catch (e) {}
                }

                // Start dragging (pointerdown / mousedown)
                sendDrag('mousedown', centerX, centerY);

                // Slowly glide rightwards to rotate the camera
                let step = 0;
                const maxSteps = 30;
                const dragTimer = setInterval(() => {
                    if (localStorage.getItem('autoTourEnabled') !== 'true' || step >= maxSteps) {
                        clearInterval(dragTimer);
                        // Release drag
                        sendDrag('mouseup', centerX + (step * 5), centerY);
                        return;
                    }
                    step++;
                    const currX = centerX + (step * 5);
                    cursor.style.transform = `translate3d(${currX}px, ${centerY}px, 0)`;
                    sendDrag('mousemove', currX, centerY);
                }, 50);
            }, 2300);
        }, 1500);
    } else {
        // --- STANDARD NAVIGATION AND INTERACTION SIMULATION ---
        let targets = Array.from(document.querySelectorAll('a, button, input, select, [role="button"], .nav-item')).filter(el => {
            const r = el.getBoundingClientRect();
            const hasSize = r.width > 0 && r.height > 0;
            const isSelf = el.id === 'themeToggle' || el.closest('#autoTourBadge');
            const href = el.getAttribute('href') || '';
            const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);
            return hasSize && !isSelf && !isExternal;
        });

        if (targets.length > 0) {
            // Move to first target at 1.5 seconds
            setTimeout(() => {
                if (localStorage.getItem('autoTourEnabled') !== 'true') return;
                moveCursorToElement(targets[Math.floor(Math.random() * targets.length)]);
            }, 1500);

            // Move to second target at 4.5 seconds
            setTimeout(() => {
                if (localStorage.getItem('autoTourEnabled') !== 'true') return;
                const randomTarget = targets[Math.floor(Math.random() * targets.length)];
                moveCursorToElement(randomTarget);
                
                setTimeout(() => {
                    if (localStorage.getItem('autoTourEnabled') !== 'true') return;
                    
                    const rect = randomTarget.getBoundingClientRect();
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    
                    triggerClickRipple(x, y);

                    // True Event Dispatching using elementFromPoint with try-catch wrap
                    try {
                        const clickedElement = document.elementFromPoint(x, y);
                        if (clickedElement) {
                            const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
                            const mouseupEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
                            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
                            
                            clickedElement.dispatchEvent(mousedownEvent);
                            clickedElement.dispatchEvent(mouseupEvent);
                            clickedElement.dispatchEvent(clickEvent);
                        }
                    } catch (err) {
                        console.error("Auto-Tour Click Simulation Error: ", err);
                    }
                }, 2500);
            }, 4500);
        }
    }

    function moveCursorToElement(el) {
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    function triggerClickRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            border: 2px solid #06b6d4;
            border-radius: 50%;
            width: 10px;
            height: 10px;
            left: ${x - 5}px;
            top: ${y - 5}px;
            transition: all 0.6s ease-out;
            opacity: 1;
        `;
        document.body.appendChild(ripple);
        ripple.offsetWidth;
        ripple.style.width = '50px';
        ripple.style.height = '50px';
        ripple.style.left = `${x - 25}px`;
        ripple.style.top = `${y - 25}px`;
        ripple.style.opacity = '0';
        setTimeout(() => ripple.remove(), 600);
    }

    // 5. Countdown timer with simulated mouse click navigation
    let timeLeft = 10;
    const timer = setInterval(() => {
        timeLeft--;
        const lbl = document.getElementById('autoTourSeconds');
        if (lbl) lbl.textContent = timeLeft;

        // At 3 seconds remaining, glide cursor towards the sidebar menu link of nextUrl
        if (timeLeft === 3) {
            const nextLink = document.querySelector(`#mobileMenu a[href*="${nextUrl}"]`) || 
                             document.querySelector(`aside a[href*="${nextUrl}"]`) || 
                             document.querySelector(`a[href*="${nextUrl}"]`);
            if (nextLink) {
                const rect = nextLink.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    moveCursorToElement(nextLink);
                }
            }
        }

        // At 1 second remaining, simulate the click dispatch to open next page
        if (timeLeft === 1) {
            const nextLink = document.querySelector(`#mobileMenu a[href*="${nextUrl}"]`) || 
                             document.querySelector(`aside a[href*="${nextUrl}"]`) || 
                             document.querySelector(`a[href*="${nextUrl}"]`);
            if (nextLink) {
                const rect = nextLink.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    triggerClickRipple(x, y);

                    try {
                        const clickedElement = document.elementFromPoint(x, y) || nextLink;
                        if (clickedElement) {
                            const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
                            const mouseupEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
                            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
                            
                            clickedElement.dispatchEvent(mousedownEvent);
                            clickedElement.dispatchEvent(mouseupEvent);
                            clickedElement.dispatchEvent(clickEvent);
                        }
                    } catch (err) {
                        console.error("Auto-Tour Menu Click Simulation Error: ", err);
                    }
                }
            }
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            clearInterval(scrollTimer);
            if (cursor) cursor.remove();
            // Failsafe redirect in case click event did not successfully trigger navigation
            window.location.href = nextUrl;
        }
    }, 1000);

    window.autoTourInterval = timer;
    window.autoTourScrollInterval = scrollTimer;

    // Explicit unload cleanup to prevent memory leaks or stuttering
    window.addEventListener('beforeunload', () => {
        clearInterval(timer);
        clearInterval(scrollTimer);
    });
}

window.stopAutoTourFromBadge = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    localStorage.setItem('autoTourEnabled', 'false');
    if (window.autoTourInterval) {
        clearInterval(window.autoTourInterval);
    }
    if (window.autoTourScrollInterval) {
        clearInterval(window.autoTourScrollInterval);
    }
    const badge = document.getElementById('autoTourBadge');
    if (badge) badge.remove();

    const cursor = document.getElementById('virtualCursor');
    if (cursor) cursor.remove();

    const toggle = document.getElementById('tourToggle');
    if (toggle) {
        toggle.checked = false;
    }
};

// === HELP GUIDE SYSTEM ===
function initHelpGuide() {
    const curPath = window.location.pathname;
    let curPage = curPath.split('/').pop() || 'index.html';
    if (curPage === '' || curPage === '/') curPage = 'index.html';

    const helpData = {
        'index.html': {
            title: '🏠 หน้าแรก (Home)',
            steps: [
                { icon: 'fa-eye', text: 'ดูภาพรวมของโปรเจกต์วิจัยเห็ดทั้งหมดได้ในหน้านี้' },
                { icon: 'fa-seedling', text: 'เลื่อนลงเพื่อดูรายละเอียดสายพันธุ์เห็ดทั้ง 4 ชนิด' },
                { icon: 'fa-chart-bar', text: 'ดูแผนภูมิวิเคราะห์ผลผลิตและกราฟเปรียบเทียบ' },
                { icon: 'fa-recycle', text: 'ศึกษาแนวคิด Zero Waste จากขยะก้อนเชื้อสู่ปุ๋ยชีวภาพ' },
                { icon: 'fa-bars', text: 'ใช้แถบเมนูด้านซ้ายเพื่อเปลี่ยนหน้าไปยังโมดูลต่าง ๆ' }
            ]
        },
        'lab.html': {
            title: '🧪 MSSM Lab (ห้องปฏิบัติการ)',
            steps: [
                { icon: 'fa-sliders-h', text: 'ปรับค่าพารามิเตอร์สิ่งแวดล้อม เช่น อุณหภูมิ ความชื้น แสง' },
                { icon: 'fa-calculator', text: 'ระบบจะคำนวณผลลัพธ์การจำลองสภาพแวดล้อมอัตโนมัติ' },
                { icon: 'fa-chart-line', text: 'ดูกราฟแสดงผลการเจริญเติบโตของเห็ดแบบ Real-time' },
                { icon: 'fa-save', text: 'ข้อมูลจะถูกบันทึกอัตโนมัติในเครื่องของคุณ (LocalStorage)' },
                { icon: 'fa-undo', text: 'กดปุ่ม Reset เพื่อคืนค่าเริ่มต้นทั้งหมด' }
            ]
        },
        'ai.html': {
            title: '🤖 AI Assistant (ผู้ช่วยปัญญาประดิษฐ์)',
            steps: [
                { icon: 'fa-keyboard', text: 'พิมพ์คำถามเกี่ยวกับเห็ดลงในช่องแชท' },
                { icon: 'fa-paper-plane', text: 'กดส่งหรือ Enter เพื่อรับคำตอบจาก AI' },
                { icon: 'fa-brain', text: 'AI จะวิเคราะห์และตอบกลับด้วยข้อมูลเกี่ยวกับเห็ด' },
                { icon: 'fa-cog', text: 'ตั้งค่า API Key ได้ที่ปุ่มตั้งค่าในหน้านี้' },
                { icon: 'fa-trash', text: 'กดปุ่ม Reset เพื่อล้างประวัติการสนทนา' }
            ]
        },
        'builder2d.html': {
            title: '📐 ออกแบบโรงเรือน 2D (Builder)',
            steps: [
                { icon: 'fa-mouse-pointer', text: 'คลิกบนพื้นที่ Canvas เพื่อวางชิ้นส่วนโรงเรือน' },
                { icon: 'fa-arrows-alt', text: 'ลากเพื่อย้ายตำแหน่งองค์ประกอบที่วางแล้ว' },
                { icon: 'fa-palette', text: 'เลือกประเภทวัสดุและอุปกรณ์จากแถบเครื่องมือ' },
                { icon: 'fa-save', text: 'ระบบจะบันทึกแบบโรงเรือนอัตโนมัติ' },
                { icon: 'fa-cube', text: 'เปลี่ยนไปโหมด 3D ได้จากเมนูด้านซ้าย' }
            ]
        },
        'mushroom_3d.html': {
            title: '🎮 แบบจำลอง 3D (3D Viewer)',
            steps: [
                { icon: 'fa-hand-pointer', text: 'คลิกค้างแล้วลากเพื่อหมุนมุมมองกล้อง 360°' },
                { icon: 'fa-search-plus', text: 'เลื่อน Scroll Wheel เพื่อซูมเข้า-ออก' },
                { icon: 'fa-arrows-alt', text: 'คลิกขวาค้างแล้วลากเพื่อเลื่อนตำแหน่ง' },
                { icon: 'fa-sync', text: 'ระบบจะหมุนโมเดลอัตโนมัติเมื่อไม่มีการสัมผัส' },
                { icon: 'fa-cubes', text: 'ดูโครงสร้างโรงเรือนจำลองในมุมมอง 3 มิติ' }
            ]
        },
        'market.html': {
            title: '📈 ตลาดราคากลางสด (Market)',
            steps: [
                { icon: 'fa-chart-line', text: 'ดูราคาเห็ดสดล่าสุดจากตลาดกลางนครศรีธรรมราช' },
                { icon: 'fa-filter', text: 'กรองข้อมูลตามสายพันธุ์เห็ดที่ต้องการ' },
                { icon: 'fa-table', text: 'ดูตารางเปรียบเทียบราคาย้อนหลัง' },
                { icon: 'fa-bell', text: 'ระบบจะแจ้งเตือนเมื่อราคาเปลี่ยนแปลงอย่างมีนัยสำคัญ' },
                { icon: 'fa-download', text: 'ส่งออกข้อมูลราคาได้ในรูปแบบต่าง ๆ' }
            ]
        },
        'quiz_pvp.html': {
            title: '🏆 ทดสอบความรู้ (Quiz PvP)',
            steps: [
                { icon: 'fa-play', text: 'กดเริ่มเพื่อทำแบบทดสอบความรู้เกี่ยวกับเห็ด' },
                { icon: 'fa-check-circle', text: 'เลือกคำตอบที่ถูกต้องภายในเวลาที่กำหนด' },
                { icon: 'fa-star', text: 'ได้คะแนนสะสมและดูผลลัพธ์เมื่อจบแบบทดสอบ' },
                { icon: 'fa-redo', text: 'ทำซ้ำได้ไม่จำกัดเพื่อฝึกฝนความรู้' },
                { icon: 'fa-trophy', text: 'ท้าทายตัวเองเพื่อทำคะแนนสูงสุด!' }
            ]
        },
        'dataset.html': {
            title: '📊 คลังข้อมูลวิจัย (Dataset)',
            steps: [
                { icon: 'fa-database', text: 'ดูชุดข้อมูลวิจัยเห็ดที่รวบรวมจากการทดลองจริง' },
                { icon: 'fa-search', text: 'ค้นหาข้อมูลตามหมวดหมู่หรือคำสำคัญ' },
                { icon: 'fa-chart-pie', text: 'ดูแผนภูมิสรุปข้อมูลเชิงสถิติ' },
                { icon: 'fa-file-csv', text: 'ส่งออกข้อมูลในรูปแบบ CSV เพื่อใช้ใน Excel' },
                { icon: 'fa-lock', text: 'ข้อมูลถูกจัดเก็บอย่างปลอดภัยในเครื่อง' }
            ]
        },
        'management.html': {
            title: '💼 ระบบบริหารจัดการฟาร์ม (Control Suite)',
            steps: [
                { icon: 'fa-tachometer-alt', text: 'ดูสถิติสรุปฟาร์ม 4 การ์ด: BCR, ก้อนเชื้อ, เก็บเกี่ยว, Zero Waste' },
                { icon: 'fa-calendar-alt', text: 'ใช้ปฏิทินเพาะปลูกวางแผนกิจกรรมดูแลเห็ด' },
                { icon: 'fa-plus-circle', text: 'กดปุ่ม "เพิ่มแผนงาน" เพื่อเพิ่มกิจกรรมใหม่' },
                { icon: 'fa-wallet', text: 'บันทึกรายรับ-รายจ่ายในสมุดบัญชีต้นทุนฟาร์ม' },
                { icon: 'fa-file-csv', text: 'กดปุ่ม "ส่งออก (.CSV)" เพื่อดาวน์โหลดข้อมูลบัญชี' }
            ]
        },
        'doc.html': {
            title: '📖 คู่มือวิจัย (Documentation)',
            steps: [
                { icon: 'fa-book-open', text: 'อ่านเอกสารวิจัยฉบับเต็มจากโปรเจกต์ MSSM' },
                { icon: 'fa-list', text: 'เลือกบทที่ต้องการอ่านจากสารบัญ' },
                { icon: 'fa-bookmark', text: 'ระบบจะจดจำตำแหน่งที่อ่านล่าสุด' },
                { icon: 'fa-print', text: 'สามารถพิมพ์เอกสารออกมาเป็นกระดาษได้' },
                { icon: 'fa-search', text: 'ใช้ Ctrl+F เพื่อค้นหาคำในเอกสาร' }
            ]
        },
        'settings.html': {
            title: '⚙️ ศูนย์ตั้งค่าอัจฉริยะ (Settings)',
            steps: [
                { icon: 'fa-palette', text: 'เปลี่ยนสีธีมหลักของแพลตฟอร์ม (5 สีให้เลือก)' },
                { icon: 'fa-moon', text: 'สลับโหมดมืด/สว่าง (Dark/Light Mode)' },
                { icon: 'fa-play-circle', text: 'เปิด/ปิดโหมดนำเสนออัตโนมัติ (Auto-Tour)' },
                { icon: 'fa-key', text: 'ตั้งค่า API Key สำหรับ AI Assistant' },
                { icon: 'fa-database', text: 'จัดการข้อมูลที่จัดเก็บใน LocalStorage' }
            ]
        }
    };

    const pageHelp = helpData[curPage] || {
        title: '📋 วิธีใช้งานหน้านี้',
        steps: [
            { icon: 'fa-bars', text: 'ใช้แถบเมนูด้านซ้ายเพื่อนำทางไปยังหน้าต่าง ๆ' },
            { icon: 'fa-mouse-pointer', text: 'คลิกที่ปุ่มหรือลิงก์เพื่อใช้งานฟีเจอร์ต่าง ๆ' },
            { icon: 'fa-moon', text: 'สลับโหมดมืด/สว่างได้ที่ปุ่มด้านบนของเมนู' },
            { icon: 'fa-keyboard', text: 'กด Ctrl+K เพื่อเปิดค้นหาด่วน (Command Palette)' }
        ]
    };

    // Create floating help FAB button
    const fab = document.createElement('button');
    fab.id = 'helpGuideFab';
    fab.setAttribute('aria-label', 'วิธีใช้งาน');
    fab.className = 'help-guide-fab';
    fab.innerHTML = '<i class="fas fa-question"></i>';
    document.body.appendChild(fab);

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
        .help-guide-fab {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9990;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 2px solid rgba(16, 185, 129, 0.4);
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #fff;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @media (min-width: 768px) {
            .help-guide-fab { animation: helpFabPulse 3s ease-in-out infinite; }
        }
        .help-guide-fab:hover {
            transform: scale(1.12) rotate(15deg);
            box-shadow: 0 6px 28px rgba(16, 185, 129, 0.5);
        }
        .help-guide-fab:active {
            transform: scale(0.92);
        }
        @keyframes helpFabPulse {
            0%, 100% { box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35), 0 0 0 0 rgba(16, 185, 129, 0.4); }
            50% { box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35), 0 0 0 8px rgba(16, 185, 129, 0); }
        }
        .help-guide-overlay {
            position: fixed;
            inset: 0;
            z-index: 10001;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .help-guide-overlay.show { opacity: 1; }
        .help-guide-modal {
            background: linear-gradient(165deg, rgba(15,23,42,0.97) 0%, rgba(30,41,59,0.97) 100%);
            border: 1px solid rgba(51,65,85,0.6);
            border-radius: 24px;
            padding: 0;
            width: 100%;
            max-width: 460px;
            max-height: 85vh;
            overflow: hidden;
            box-shadow: 0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
            transform: scale(0.9) translateY(20px);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .help-guide-overlay.show .help-guide-modal {
            transform: scale(1) translateY(0);
        }
        .help-guide-header {
            background: linear-gradient(135deg, #10b981 0%, #047857 100%);
            padding: 24px 28px;
            position: relative;
            overflow: hidden;
        }
        .help-guide-header::before {
            content: '';
            position: absolute;
            top: -20px;
            right: -20px;
            width: 100px;
            height: 100px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            pointer-events: none;
        }
        .help-guide-header-title {
            font-size: 16px;
            font-weight: 900;
            color: #fff;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .help-guide-header-sub {
            font-size: 10px;
            color: rgba(255,255,255,0.7);
            margin-top: 4px;
            font-weight: 500;
            letter-spacing: 0.5px;
        }
        .help-guide-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255,255,255,0.15);
            border: none;
            color: #fff;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        .help-guide-close:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
        .help-guide-steps {
            padding: 20px 24px;
            overflow-y: auto;
            max-height: calc(85vh - 140px);
        }
        .help-guide-step {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding: 14px 0;
            border-bottom: 1px solid rgba(51,65,85,0.3);
            opacity: 0;
            transform: translateX(-12px);
            animation: helpStepIn 0.4s ease forwards;
        }
        .help-guide-step:last-child { border-bottom: none; }
        .help-guide-step-num {
            width: 32px;
            height: 32px;
            border-radius: 10px;
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.25);
            color: #10b981;
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .help-guide-step-text {
            font-size: 13px;
            color: #cbd5e1;
            line-height: 1.6;
            padding-top: 4px;
        }
        .help-guide-step-text strong {
            color: #f1f5f9;
        }
        .help-guide-footer {
            padding: 16px 24px;
            border-top: 1px solid rgba(51,65,85,0.4);
            text-align: center;
        }
        .help-guide-footer-text {
            font-size: 10px;
            color: #64748b;
        }
        .help-guide-footer-text i { color: #10b981; }
        @keyframes helpStepIn {
            to { opacity: 1; transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);

    // Build the modal
    function showHelpModal() {
        // Remove if already exists
        const old = document.getElementById('helpGuideOverlay');
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.id = 'helpGuideOverlay';
        overlay.className = 'help-guide-overlay';

        let stepsHTML = '';
        pageHelp.steps.forEach((step, idx) => {
            stepsHTML += `
                <div class="help-guide-step" style="animation-delay: ${idx * 0.08}s">
                    <div class="help-guide-step-num"><i class="fas ${step.icon}"></i></div>
                    <div class="help-guide-step-text">${step.text}</div>
                </div>
            `;
        });

        overlay.innerHTML = `
            <div class="help-guide-modal">
                <div class="help-guide-header">
                    <h3 class="help-guide-header-title">
                        <span style="font-size:22px;">🍄</span> ${pageHelp.title}
                    </h3>
                    <p class="help-guide-header-sub">MSSM Platform · วิธีใช้งานหน้านี้ Step-by-Step</p>
                    <button class="help-guide-close" id="helpGuideCloseBtn"><i class="fas fa-times"></i></button>
                </div>
                <div class="help-guide-steps">
                    ${stepsHTML}
                </div>
                <div class="help-guide-footer">
                    <span class="help-guide-footer-text"><i class="fas fa-lightbulb"></i> กด <strong>Ctrl+K</strong> เพื่อเปิดค้นหาด่วนได้ทุกหน้า</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        // Close handlers
        document.getElementById('helpGuideCloseBtn').onclick = () => closeHelpModal(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeHelpModal(overlay);
        });
        window.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeHelpModal(overlay);
                window.removeEventListener('keydown', escHandler);
            }
        });
    }

    function closeHelpModal(overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    }

    fab.addEventListener('click', showHelpModal);
}

// === SPLIT SCREEN / DUAL VIEW SYSTEM ===
window.activateSplitView = function() {
    // Prevent duplicate
    if (document.getElementById('splitViewOverlay')) return;

    const PAGES = [
        { url: 'index.html', label: '🏠 หน้าแรก' },
        { url: 'lab.html', label: '🧪 MSSM Lab' },
        { url: 'ai.html', label: '🤖 AI Assistant' },
        { url: 'builder2d.html', label: '📐 Builder 2D' },
        { url: 'mushroom_3d.html', label: '🎮 3D Viewer' },
        { url: 'market.html', label: '📈 ตลาดราคา' },
        { url: 'quiz_pvp.html', label: '🏆 ทดสอบความรู้' },
        { url: 'dataset.html', label: '📊 คลังข้อมูล' },
        { url: 'management.html', label: '💼 จัดการฟาร์ม' },
        { url: 'doc.html', label: '📖 คู่มือวิจัย' },
        { url: 'settings.html', label: '⚙️ ตั้งค่า' }
    ];

    // Detect current page
    let curPage = window.location.pathname.split('/').pop() || 'index.html';
    if (curPage === '' || curPage === '/') curPage = 'index.html';
    const curIdx = PAGES.findIndex(p => curPage.includes(p.url));
    const leftUrl = PAGES[curIdx >= 0 ? curIdx : 0].url;
    const rightUrl = PAGES[curIdx >= 0 ? (curIdx + 1) % PAGES.length : 1].url;

    // Build dropdown options
    function buildOptions(selectedUrl) {
        return PAGES.map(p => `<option value="${p.url}" ${p.url === selectedUrl ? 'selected' : ''}>${p.label}</option>`).join('');
    }

    // Inject styles
    const style = document.createElement('style');
    style.id = 'splitViewStyles';
    style.textContent = `
        .split-overlay {
            position: fixed; inset: 0; z-index: 99999;
            background: #0b0f19;
            display: flex; flex-direction: column;
            opacity: 0; transition: opacity 0.35s ease;
        }
        .split-overlay.show { opacity: 1; }
        .split-toolbar {
            height: 48px; flex-shrink: 0;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-bottom: 1px solid #334155;
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 16px; gap: 12px;
        }
        .split-toolbar-title {
            font-size: 13px; font-weight: 900; color: #fff;
            display: flex; align-items: center; gap: 8px;
        }
        .split-toolbar-title i { color: #818cf8; }
        .split-toolbar select {
            background: #1e293b; border: 1px solid #475569;
            color: #e2e8f0; font-size: 11px; font-weight: 700;
            padding: 6px 10px; border-radius: 10px; cursor: pointer;
            outline: none; transition: border-color 0.2s;
        }
        .split-toolbar select:focus { border-color: #818cf8; }
        .split-close-btn {
            width: 34px; height: 34px; border-radius: 10px;
            background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
            color: #f87171; font-size: 14px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
        }
        .split-close-btn:hover { background: #ef4444; color: #fff; transform: scale(1.08); }
        .split-body {
            flex: 1; display: flex; min-height: 0; position: relative;
        }
        .split-panel {
            flex: 1; min-width: 80px; overflow: hidden; position: relative;
        }
        .split-panel iframe {
            width: 100%; height: 100%; border: none; background: #0b0f19;
        }
        .split-panel-label {
            position: absolute; top: 8px; left: 12px; z-index: 2;
            font-size: 9px; font-weight: 900; color: #94a3b8;
            background: rgba(15,23,42,0.85); backdrop-filter: blur(8px);
            padding: 4px 10px; border-radius: 8px;
            border: 1px solid rgba(51,65,85,0.5);
            text-transform: uppercase; letter-spacing: 1px;
            pointer-events: none;
        }
        .split-gutter {
            width: 6px; background: #1e293b; cursor: col-resize;
            position: relative; flex-shrink: 0;
            border-left: 1px solid #334155; border-right: 1px solid #334155;
            transition: background 0.2s;
        }
        .split-gutter:hover, .split-gutter.dragging {
            background: #818cf8;
        }
        .split-gutter::after {
            content: ''; position: absolute;
            top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 2px; height: 32px;
            background: #475569; border-radius: 2px;
        }
        .split-gutter:hover::after, .split-gutter.dragging::after {
            background: #fff;
        }
        .split-selector-group {
            display: flex; align-items: center; gap: 8px;
        }
        .split-selector-label {
            font-size: 10px; font-weight: 800; color: #64748b;
            text-transform: uppercase; letter-spacing: 0.5px;
        }
    `;
    document.head.appendChild(style);

    // Build overlay
    const overlay = document.createElement('div');
    overlay.id = 'splitViewOverlay';
    overlay.className = 'split-overlay';
    overlay.innerHTML = `
        <div class="split-toolbar">
            <div class="split-toolbar-title"><i class="fas fa-columns"></i> โหมดจอคู่ขนาน (Split View)</div>
            <div style="display:flex;align-items:center;gap:16px;flex:1;justify-content:center;">
                <div class="split-selector-group">
                    <span class="split-selector-label">ฝั่งซ้าย</span>
                    <select id="splitLeftSelect">${buildOptions(leftUrl)}</select>
                </div>
                <div class="split-selector-group">
                    <span class="split-selector-label">ฝั่งขวา</span>
                    <select id="splitRightSelect">${buildOptions(rightUrl)}</select>
                </div>
            </div>
            <button class="split-close-btn" id="splitCloseBtn" title="ปิดจอคู่ขนาน"><i class="fas fa-times"></i></button>
        </div>
        <div class="split-body" id="splitBody">
            <div class="split-panel" id="splitLeft">
                <span class="split-panel-label">◀ ฝั่งซ้าย</span>
                <iframe id="splitLeftFrame" src="${leftUrl}"></iframe>
            </div>
            <div class="split-gutter" id="splitGutter"></div>
            <div class="split-panel" id="splitRight">
                <span class="split-panel-label">▶ ฝั่งขวา</span>
                <iframe id="splitRightFrame" src="${rightUrl}"></iframe>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Trigger show animation
    requestAnimationFrame(() => overlay.classList.add('show'));

    // Page selector change handlers
    document.getElementById('splitLeftSelect').addEventListener('change', function() {
        document.getElementById('splitLeftFrame').src = this.value;
    });
    document.getElementById('splitRightSelect').addEventListener('change', function() {
        document.getElementById('splitRightFrame').src = this.value;
    });

    // Close button
    document.getElementById('splitCloseBtn').addEventListener('click', function() {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.remove();
            style.remove();
        }, 350);
    });

    // ESC to close
    function escHandler(e) {
        if (e.key === 'Escape') {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
                style.remove();
            }, 350);
            window.removeEventListener('keydown', escHandler);
        }
    }
    window.addEventListener('keydown', escHandler);

    // Resizable Splitter (drag to resize)
    const gutter = document.getElementById('splitGutter');
    const splitBody = document.getElementById('splitBody');
    const leftPanel = document.getElementById('splitLeft');
    const rightPanel = document.getElementById('splitRight');
    let isDragging = false;

    function onDragStart(e) {
        e.preventDefault();
        isDragging = true;
        gutter.classList.add('dragging');

        // Create cover iframes overlay to prevent iframe from eating mouse events
        const coverL = document.createElement('div');
        coverL.id = 'splitCoverL';
        coverL.style.cssText = 'position:absolute;inset:0;z-index:5;cursor:col-resize;';
        leftPanel.appendChild(coverL);
        const coverR = document.createElement('div');
        coverR.id = 'splitCoverR';
        coverR.style.cssText = 'position:absolute;inset:0;z-index:5;cursor:col-resize;';
        rightPanel.appendChild(coverR);

        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);
    }

    function onDragMove(e) {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const bodyRect = splitBody.getBoundingClientRect();
        const offset = clientX - bodyRect.left;
        const totalW = bodyRect.width;
        const gutterW = 6;
        const minW = 80;

        let leftW = Math.max(minW, Math.min(totalW - minW - gutterW, offset));
        let rightW = totalW - leftW - gutterW;

        leftPanel.style.flex = 'none';
        leftPanel.style.width = leftW + 'px';
        rightPanel.style.flex = 'none';
        rightPanel.style.width = rightW + 'px';
    }

    function onDragEnd() {
        isDragging = false;
        gutter.classList.remove('dragging');
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('touchend', onDragEnd);

        const coverL = document.getElementById('splitCoverL');
        const coverR = document.getElementById('splitCoverR');
        if (coverL) coverL.remove();
        if (coverR) coverR.remove();
    }

    gutter.addEventListener('mousedown', onDragStart);
    gutter.addEventListener('touchstart', onDragStart, { passive: false });
};

// === BOOT ===
document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    initParticles();
    initProgress();
    initBackToTop();
    initTheme();
    initSmartHeader();
    initNetworkStatus();
    // Defer non-critical systems on mobile to avoid initial jank
    if (_isMobile) {
        requestAnimationFrame(() => {
            initScrollReveal();
            initCommandPalette();
            initPWA();
            initHelpGuide();
            initAutoTour();
        });
    } else {
        initScrollReveal();
        initCommandPalette();
        initPWA();
        initHelpGuide();
        initAutoTour();
    }
});

function filterMushrooms() {
    const query = document.getElementById('mushroomSearch')?.value.toLowerCase().trim();
    if (query === undefined) return;
    const cards = document.querySelectorAll('#products .grid > div');
    cards.forEach(card => {
        const name = card.querySelector('img')?.getAttribute('alt')?.toLowerCase() || '';
        const content = card.textContent.toLowerCase();
        if (name.includes(query) || content.includes(query)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// === MUSHROOM STYLE CUSTOM DIALOGS ===
window.showMushroomConfirm = function(message, onOk, onCancel) {
    const oldModal = document.getElementById('mushroomModalContainer');
    if (oldModal) oldModal.remove();

    const container = document.createElement('div');
    container.id = 'mushroomModalContainer';
    container.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 font-sans';
    container.innerHTML = `
        <div class="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-center relative overflow-hidden shadow-2xl transition-all duration-300">
            <div class="absolute w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -top-10 -right-10 pointer-events-none"></div>
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-xl shadow-emerald-500/30">
                🍄
            </div>
            <h3 class="text-sm font-black text-white mb-2">แจ้งเตือนระบบ MSSM</h3>
            <p class="text-xs text-slate-300 mb-6 leading-relaxed">${message}</p>
            
            <div class="flex items-center gap-3">
                <button id="mushroomModalBtnOk" class="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer border-none">ตกลง</button>
                <button id="mushroomModalBtnCancel" class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs transition cursor-pointer border-none">ยกเลิก</button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    document.getElementById('mushroomModalBtnOk').onclick = () => {
        container.remove();
        if (onOk) onOk();
    };

    document.getElementById('mushroomModalBtnCancel').onclick = () => {
        container.remove();
        if (onCancel) onCancel();
    };
};

window.showMushroomAlert = function(message, onOk) {
    const oldModal = document.getElementById('mushroomModalContainer');
    if (oldModal) oldModal.remove();

    const container = document.createElement('div');
    container.id = 'mushroomModalContainer';
    container.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 font-sans';
    container.innerHTML = `
        <div class="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-center relative overflow-hidden shadow-2xl transition-all duration-300">
            <div class="absolute w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -top-10 -right-10 pointer-events-none"></div>
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-xl shadow-emerald-500/30">
                🍄
            </div>
            <h3 class="text-sm font-black text-white mb-2">แจ้งเตือนระบบ MSSM</h3>
            <p class="text-xs text-slate-300 mb-6 leading-relaxed">${message}</p>
            
            <div class="flex items-center justify-center">
                <button id="mushroomModalBtnOk" class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer border-none">ตกลง</button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    document.getElementById('mushroomModalBtnOk').onclick = () => {
        container.remove();
        if (onOk) onOk();
    };
};

// Override window.alert globally
window.alert = function(message) {
    window.showMushroomAlert(message);
};

// === GLOBAL FULLSCREEN AUTO-ENTER (all pages via localStorage) ===
(function initGlobalFullscreen() {
    if (localStorage.getItem('fullscreenAutoEnabled') !== 'true') return;

    // Fullscreen API requires a user gesture — listen for first click/touch
    function _tryEnterFullscreen() {
        const doc = document.documentElement;
        const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (isFS) return; // already fullscreen

        const req = doc.requestFullscreen || doc.webkitRequestFullscreen || doc.mozRequestFullScreen || doc.msRequestFullscreen;
        if (req) {
            req.call(doc).catch(() => {});
        }
        // Remove listener after first successful attempt
        document.removeEventListener('click', _tryEnterFullscreen, true);
        document.removeEventListener('touchstart', _tryEnterFullscreen, true);
    }

    // Use capture phase to catch clicks before any other handler
    document.addEventListener('click', _tryEnterFullscreen, { capture: true, once: true, passive: true });
    document.addEventListener('touchstart', _tryEnterFullscreen, { capture: true, once: true, passive: true });
})();
