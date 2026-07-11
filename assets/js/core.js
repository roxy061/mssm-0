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
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('-translate-x-full');
        menu.classList.toggle('hidden');
    }
    document.getElementById('menuOverlay')?.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');
}

function closeMenu() {
    if (window.innerWidth >= 1024) return; // Don't close/hide menu on desktop sizes
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.add('-translate-x-full');
        menu.classList.add('hidden');
    }
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

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 150) {
            if (currentScrollY > lastScrollY) {
                // scrolling down -> hide
                themeBtn?.classList.add('-translate-y-24', 'opacity-0', 'pointer-events-none');
                hamBtn?.classList.add('-translate-y-24', 'opacity-0', 'pointer-events-none');
                connBtn?.classList.add('-translate-y-24', 'opacity-0', 'pointer-events-none');
            } else {
                // scrolling up -> show
                themeBtn?.classList.remove('-translate-y-24', 'opacity-0', 'pointer-events-none');
                hamBtn?.classList.remove('-translate-y-24', 'opacity-0', 'pointer-events-none');
                connBtn?.classList.remove('-translate-y-24', 'opacity-0', 'pointer-events-none');
            }
        } else {
            // near top -> show
            themeBtn?.classList.remove('-translate-y-24', 'opacity-0', 'pointer-events-none');
            hamBtn?.classList.remove('-translate-y-24', 'opacity-0', 'pointer-events-none');
            connBtn?.classList.remove('-translate-y-24', 'opacity-0', 'pointer-events-none');
        }
        lastScrollY = currentScrollY;
    }, { passive: true });
}

// === NETWORK STATUS TOAST & LIVE BADGE ===
function initNetworkStatus() {
    const badge = document.createElement('div');
    badge.id = 'connBadge';
    badge.className = 'fixed top-3 right-16 md:top-5 md:right-24 z-[100] flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-md backdrop-blur-md transition-all duration-300';
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
            transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scroll-reveal.reveal-active {
            opacity: 1;
            transform: translateY(0);
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

    const targets = document.querySelectorAll('section, .card-shine, .p-5, .p-7, main > div');
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
    const navContainers = document.querySelectorAll('nav.flex-1, nav.flex-grow, aside nav, #mobileMenu nav');
    const path = window.location.pathname;
    const isIndex = path.endsWith('index.html') || path.endsWith('/') || !path.includes('.html');
    const mode = localStorage.getItem('globalRenderMode') || '2d';

    let builderBtnClass = "bg-gradient-to-br from-indigo-500 to-purple-600 text-white";
    let builderBadge = "";
    if (mode === '3d') {
        builderBtnClass = "bg-gradient-to-br from-purple-600 via-pink-650 to-indigo-650 text-white animate-pulse shadow-md shadow-pink-500/20";
        builderBadge = '<span class="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[8px] font-black bg-pink-500 text-white rounded-full uppercase tracking-widest animate-bounce">3D</span>';
    }

    const menuItems = [
        { href: "index.html", label: "หน้าแรก", icon: "fa-home", colorClass: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" },
        { href: "lab.html", label: "MSSM Lab", icon: "fa-flask", colorClass: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white" },
        { href: "ai.html", label: "AI Assistant", icon: "fa-robot", colorClass: "bg-gradient-to-br from-amber-400 to-amber-600 text-white" },
        { href: "builder2d.html", label: "ออกแบบโรงเรือน (Builder)", icon: "fa-cubes", colorClass: builderBtnClass, isBuilder: true },
        { href: "market.html", label: "ตลาดราคากลางสด", icon: "fa-chart-line", colorClass: "bg-gradient-to-br from-rose-500 to-rose-600 text-white" },
        { href: "quiz_pvp.html", label: "ทดสอบความรู้", icon: "fa-trophy", colorClass: "bg-gradient-to-br from-amber-500 to-orange-600 text-white" },
        { href: "dataset.html", label: "คลังข้อมูลวิจัย", icon: "fa-database", colorClass: "bg-gradient-to-br from-blue-400 to-blue-600 text-white" },
        { href: "doc.html", label: "คู่มือวิจัย", icon: "fa-book", colorClass: "bg-gradient-to-br from-purple-400 to-purple-600 text-white" },
        { href: "settings.html", label: "ศูนย์ตั้งค่าอัจฉริยะ", icon: "fa-cog", colorClass: "bg-gradient-to-br from-gray-500 to-slate-700 text-white" },
        { href: "https://docs.google.com/forms/d/e/1FAIpQLSfv9wysUClz6pVb4c6e1fMVbXUn-a0MU5Yj9ui9HSoSLch2Jw/viewform", label: "แบบสอบถาม", icon: "fa-poll", colorClass: "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400", target: "_blank" }
    ];

    const indexAnchors = [
        { href: isIndex ? "#products" : "index.html#products", label: "สายพันธุ์เห็ด", icon: "fa-seedling", colorClass: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" },
        { href: isIndex ? "#charts" : "index.html#charts", label: "ประเมินผล", icon: "fa-chart-bar", colorClass: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" },
        { href: isIndex ? "#zerowaste" : "index.html#zerowaste", label: "Zero Waste", icon: "fa-recycle", colorClass: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" },
        { href: isIndex ? "#contact" : "index.html#contact", label: "ติดต่อ", icon: "fa-envelope", colorClass: "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400" }
    ];

    let html = `<div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">เมนูหลัก</div>`;

    menuItems.forEach((item, idx) => {
        let isCurrent = path.includes(item.href);
        if (item.isBuilder && (path.includes('builder2d.html') || path.includes('mushroom_3d.html'))) isCurrent = true;
        else if (item.href === 'index.html' && isIndex) isCurrent = true;

        let activeClass = isCurrent 
            ? "nav-item active flex items-center gap-3 px-3 py-3.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 bg-emerald-50 dark:bg-emerald-900/20 transition-all" 
            : "nav-item flex items-center gap-3 px-3 py-3.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-gray-900 dark:hover:text-gray-100 transition-all";

        let linkContent = `
            <a href="${item.href}" ${item.target ? `target="${item.target}"` : ""} class="${activeClass} relative">
                <span class="w-7 h-7 flex items-center justify-center rounded-lg ${item.colorClass} text-xs"><i class="fas ${item.icon}"></i></span>
                <span>${item.label}</span>
                ${item.isBuilder ? builderBadge : ""}
            </a>
        `;

        if (item.isBuilder) {
            const isAnyActive = path.includes('builder2d.html') || path.includes('mushroom_3d.html');
            linkContent = linkContent.replace('<span>ออกแบบโรงเรือน (Builder)</span>', `
                <span>ออกแบบโรงเรือน (Builder)</span>
                <span onclick="toggleBuilderSubmenu(event)" class="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer z-20"><i id="builderChevron" class="fas ${isAnyActive ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px]"></i></span>
            `);
            html += linkContent + `
                <div id="builderSubmenu" class="mt-1 space-y-0.5 border-l border-slate-100 dark:border-slate-800 ml-6 pl-1 ${isAnyActive ? '' : 'hidden'}">
                    <a href="builder2d.html?mode=2d" class="pl-11 nav-item flex items-center gap-2.5 py-2.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"><i class="fas fa-cubes text-[10px]"></i> โหมด 2D</a>
                    <a href="mushroom_3d.html?mode=3d" class="pl-11 nav-item flex items-center gap-2.5 py-2.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"><i class="fas fa-cube text-[10px]"></i> โหมด 3D</a>
                </div>`;
        } else {
            html += linkContent;
        }

        if (idx === 0) {
            html += `<div class="border-t border-gray-100 dark:border-gray-800 my-3 pt-3">`;
            indexAnchors.forEach(anchor => {
                html += `
                    <a href="${anchor.href}" class="nav-item flex items-center gap-3 px-3 py-3.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-gray-900 dark:hover:text-gray-100 transition-all">
                        <span class="w-7 h-7 flex items-center justify-center rounded-lg ${anchor.colorClass} text-xs"><i class="fas ${anchor.icon}"></i></span>
                        ${anchor.label}
                    </a>
                `;
            });
            html += `</div><div class="border-t border-gray-100 dark:border-gray-800 my-3 pt-3">
                    <div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">เครื่องมือ</div>`;
        }
    });

    html += `
        </div>
        </div>
    `;

    navContainers.forEach(container => {
        container.outerHTML = `<nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">${html}</nav>`;
    });
}

// === COLLAPSIBLE BUILDER SUBMENU TOGGLE ===
function toggleBuilderSubmenu(event) {
    event.preventDefault();
    event.stopPropagation();
    const submenu = document.getElementById('builderSubmenu');
    const chevron = document.getElementById('builderChevron');
    if (submenu) {
        submenu.classList.toggle('hidden');
        const isHidden = submenu.classList.contains('hidden');
        if (chevron) {
            chevron.className = isHidden ? "fas fa-chevron-down text-[10px]" : "fas fa-chevron-up text-[10px]";
        }
    }
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

// === BOOT ===
document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    initParticles();
    initProgress();
    initBackToTop();
    initTheme();
    initSmartHeader();
    initNetworkStatus();
    initScrollReveal();
    initCommandPalette();
    initPWA();
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
