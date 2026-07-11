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
        { href: "management.html", label: "การจัดการฟาร์ม", icon: "fa-tasks", colorClass: "bg-gradient-to-br from-indigo-400 to-indigo-650 text-white" },
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
    badge.className = 'fixed bottom-4 right-4 z-[9999] bg-slate-900/95 dark:bg-slate-950/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/50 flex items-center gap-3 backdrop-blur-md transition-all duration-300 font-sans';
    badge.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
        <span class="text-xs font-bold">โหมดนำเสนอ: หน้าถัดไปใน <span id="autoTourSeconds" class="font-mono text-cyan-400">10</span> วินาที</span>
        <button onclick="stopAutoTourFromBadge(event)" class="text-[10px] bg-red-550/20 text-red-400 hover:bg-red-500 hover:text-white px-2.5 py-1 rounded-lg font-black transition cursor-pointer border-none">หยุดทัวร์</button>
    `;
    document.body.appendChild(badge);

    // 2. Create Virtual Ghost Cursor element
    const cursor = document.createElement('div');
    cursor.id = 'virtualCursor';
    cursor.style.cssText = 'position:fixed; pointer-events:none; z-index:10000; width:24px; height:24px; top:0; left:0; transform: translate3d(50vw, 50vh, 0); transition: transform 2.2s cubic-bezier(0.16, 1, 0.3, 1);';
    cursor.innerHTML = `
        <svg class="w-full h-full text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.5 3v15.3l4.3-4.3 3 5.3 2.1-1.2-3-5.2 5.5-.6L4.5 3z"/>
        </svg>
    `;
    document.body.appendChild(cursor);

    // 3. Auto-Scroll logic (Simulates random human reading patterns: scroll down, up, or pause on page & sidebar menu)
    let currentScroll = window.scrollY;
    const scrollTimer = setInterval(() => {
        if (localStorage.getItem('autoTourEnabled') !== 'true') return;
        
        // Scroll main page
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0) {
            const rand = Math.random();
            let scrollAmount = 0;
            if (rand < 0.5) {
                scrollAmount = 150 + Math.random() * 200;
            } else if (rand < 0.8) {
                scrollAmount = -(100 + Math.random() * 100);
            } else {
                scrollAmount = 0;
            }

            currentScroll = Math.max(0, Math.min(maxScroll, currentScroll + scrollAmount));
            window.scrollTo({
                top: currentScroll,
                behavior: 'smooth'
            });
        }

        // Scroll the sidebar menu container
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
    }, 1800);

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
            left: 24px;
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
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35), 0 0 0 0 rgba(16, 185, 129, 0.4);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            animation: helpFabPulse 3s ease-in-out infinite;
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
    initHelpGuide();
    initAutoTour();
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
