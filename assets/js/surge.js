/* -----------------------------------------------
   SURGE.js - หน้าแรก Engine
   Tabs, Charts, Weights, Modals, Podium
   ----------------------------------------------- */

const SCORES = {
    1: [0.000, 1.000, 0.440, 0.373],
    2: [0.000, 0.412, 1.000, 0.852],
    3: [0.000, 1.000, 0.788, 0.688],
    4: [0.000, 1.000, 0.793, 0.680],
    5: [0.000, 1.000, 0.760, 0.630],
    6: [0.000, 1.000, 0.890, 0.830]
};
const LABELS = ['เห็ดหูหนู', 'เห็ดแครง', 'เห็ดนางฟ้าภูฐาน', 'เห็ดนางรมฮังการี'];
const IMGS = [
    'https://api2.krua.co/wp-content/uploads/2020/06/ImageBannerMobile_960x633-327-scaled.jpg',
    'https://f.ptcdn.info/545/083/000/sag26j103z5KPZfHnkB57-o.jpg',
    'https://image.makewebeasy.net/makeweb/m_1920x0/VpofhVYKS/Farm/messageImage_1618034207531.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0msmUXbDnvff6WfO7ATPvlMVxpJ1Uvy3wvDrlrpkBXA&s=10'
];
const TITLES = [
    '1. อัตราการเจริญเติบโตของเส้นใย', '2. ปริมาณผลผลิตรวม', '3. กำไรสุทธิ',
    '4. ค่า BCR', '5. ระยะเวลาออกดอกแรก', '6. ระยะเวลาคืนทุน'
];
const FIXED_W = [0.15, 0.25, 0.25, 0.15, 0.10, 0.10];
let customW = [...FIXED_W];
let tab = 1;
let sChart = null, dChart = null;

function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[id^="modal"]').forEach(m => {
        m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); });
    });
});

function switchTab(id) {
    tab = id;
    document.querySelectorAll('.chart-tab-btn').forEach((b, i) => {
        const act = i + 1 === id;
        b.classList.toggle('bg-emerald-500', act);
        b.classList.toggle('dark:bg-emerald-400', act);
        b.classList.toggle('text-white', act);
        b.classList.toggle('dark:text-gray-900', act);
        b.classList.toggle('border-transparent', act);
        b.classList.toggle('bg-white', !act);
        b.classList.toggle('dark:bg-gray-800', !act);
        b.classList.toggle('text-gray-600', !act);
        b.classList.toggle('dark:text-gray-400', !act);
        b.classList.toggle('border-gray-200', !act);
        b.classList.toggle('dark:border-gray-700', !act);
        b.classList.toggle('hover:border-emerald-500', !act);
        b.classList.toggle('hover:text-emerald-600', !act);
        b.classList.toggle('dark:hover:text-emerald-400', !act);
    });
    refresh();
    vibe();
}

function updateWeights(e) {
    const changed = e?.target?.id;
    let items = [], total = 0;
    for (let i = 1; i <= 6; i++) {
        const v = parseFloat(document.getElementById('w' + i)?.value) || 0;
        items.push({ id: 'w' + i, val: v });
        total += v;
    }
    if (total > 1.0001 && changed) {
        const c = items.find(w => w.id === changed);
        const oth = items.filter(w => w.id !== changed);
        const rem = Math.max(0, 1.0 - c.val);
        const sumO = oth.reduce((s, w) => s + w.val, 0);
        if (sumO > 0) oth.forEach(w => { document.getElementById(w.id).value = (w.val / sumO) * rem; });
    }
    for (let i = 1; i <= 6; i++) {
        customW[i - 1] = parseFloat(document.getElementById('w' + i)?.value) || 0;
        const el = document.getElementById('val' + (i));
        if (el) el.textContent = customW[i - 1].toFixed(2);
    }
    refresh();
}

function applyQuickProfile(p) {
    const map = {
        standard: [0.15, 0.25, 0.25, 0.15, 0.10, 0.10],
        'fast-rich': [0.10, 0.35, 0.35, 0.10, 0.05, 0.05],
        impatient: [0.30, 0.10, 0.10, 0.10, 0.20, 0.20],
        balanced: [0.16, 0.17, 0.17, 0.17, 0.16, 0.17]
    };
    const w = map[p] || map.standard;
    for (let i = 1; i <= 6; i++) {
        document.getElementById('w' + i).value = w[i - 1];
        customW[i - 1] = w[i - 1];
        const el = document.getElementById('val' + i);
        if (el) el.textContent = w[i - 1].toFixed(2);
    }
    refresh();
}

function colors(isDark) {
    return {
        bar: isDark
            ? ['rgba(255,255,255,0.15)', '#34d399', '#10b981', '#6ee7b7']
            : ['rgba(0,0,0,0.05)', '#10b981', '#34d399', '#a7f3d0'],
        text: isDark ? '#e2e8f0' : '#334155',
        grid: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
    };
}

function renderChart(canvasId, ref, factorId, weightsArr, cols) {
    const el = document.getElementById(canvasId);
    if (!el) return ref;
    if (ref) ref.destroy();
    globalThis.Chart.defaults.font.family = "'Prompt', sans-serif";
    globalThis.Chart.defaults.font.size = 12;
    globalThis.Chart.defaults.color = cols.text;
    const w = weightsArr[factorId - 1];
    const data = LABELS.map((_, m) => ((SCORES[factorId]?.[m] ?? 0) < 0 ? 0 : (SCORES[factorId]?.[m] ?? 0)) * w);
    return new globalThis.Chart(el.getContext('2d'), {
        type: 'bar',
        data: { labels: LABELS, datasets: [{ label: 'ค่าดัชนี', data, backgroundColor: cols.bar, borderRadius: 8, barPercentage: 0.5 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, title: { display: false }, tooltip: { callbacks: { label: ctx => ' ค่าดัชนี: ' + ctx.parsed.y.toFixed(4) } } },
            scales: {
                y: { beginAtZero: true, max: 1.0, title: { display: true, text: 'ค่าดัชนีประสิทธิภาพ (MPI)', color: cols.text }, ticks: { stepSize: 0.2, color: cols.text }, grid: { color: cols.grid } },
                x: { grid: { display: false }, ticks: { color: cols.text } }
            },
            animation: { duration: 300 }
        }
    });
}

function renderPodium(id, w) {
    const el = document.getElementById(id);
    if (!el) return;
    const mpi = [0, 0, 0, 0];
    for (let i = 1; i <= 6; i++) for (let m = 0; m < 4; m++) mpi[m] += ((SCORES[i]?.[m] ?? 0) < 0 ? 0 : (SCORES[i]?.[m] ?? 0)) * w[i - 1];
    let r = LABELS.map((n, i) => ({ n, s: mpi[i], img: IMGS[i] })).sort((a, b) => b.s - a.s);
    const m = r[0].s || 1;
    const h = [70, Math.max(20, (r[1].s / m) * 70), Math.max(20, (r[2].s / m) * 70), Math.max(20, (r[3].s / m) * 70)];
    const pcls = ['podium-1', 'podium-2', 'podium-3', 'podium-4'];
    el.innerHTML = `<div class="flex items-end justify-center gap-3 h-[120px] md:h-[160px] border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto px-4">
        ${[[r[1], h[1], 2], [r[0], h[0], 1], [r[2], h[2], 3], [r[3], h[3], 4]].map(([item, hi, rank]) => `
        <div class="flex flex-col items-center justify-end w-[85px] shrink-0">
            <img src="${item.img}" class="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-emerald-500 dark:border-emerald-400 object-cover -mb-3 z-10 bg-white dark:bg-gray-800 shadow-md" alt="${item.n}">
            <div class="w-full ${pcls[rank - 1]} text-white dark:text-gray-900 text-center pt-2 md:pt-3 text-xs md:text-sm font-bold rounded-t-lg shadow-inner" style="height:${hi}px">${rank === 1 ? '<span class="text-base">🏆</span><br>' : ''}${rank}</div>
            <div class="text-center mt-1.5"><div class="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 leading-tight">${item.n}</div><div class="text-[10px] md:text-xs font-black text-emerald-600 dark:text-emerald-400">${item.s.toFixed(3)}</div></div>
        </div>`).join('')}</div>`;
}

function refresh() {
    const dark = document.documentElement.classList.contains('dark');
    const col = colors(dark);
    // Static
    if (tab === 7) {
        document.getElementById('static-chart-wrapper')?.classList.add('hidden');
        document.getElementById('static-podium-wrapper')?.classList.remove('hidden');
        renderPodium('static-podium', FIXED_W);
        document.getElementById('static-desc').innerHTML = '💡 <strong>ภาพรวมมาตรฐาน (MPI):</strong> ใช้ค่าน้ำหนักตามแบบจำลอง MSSM ต้นฉบับ';
    } else {
        document.getElementById('static-chart-wrapper')?.classList.remove('hidden');
        document.getElementById('static-podium-wrapper')?.classList.add('hidden');
        sChart = renderChart('staticChart', sChart, tab, FIXED_W, col);
        document.getElementById('static-desc').innerHTML = '💡 <strong>ปัจจัย:</strong> ' + TITLES[tab - 1];
    }
    // Dynamic
    if (tab === 7) {
        document.getElementById('dynamic-chart-wrapper')?.classList.add('hidden');
        document.getElementById('dynamic-podium-wrapper')?.classList.remove('hidden');
        renderPodium('dynamic-podium', customW);
        document.getElementById('dynamic-desc').innerHTML = '💡 <strong>ภาพรวมที่กำหนดเอง (MPI):</strong> คำนวณจากค่าน้ำหนักที่คุณปรับแต่ง';
    } else {
        document.getElementById('dynamic-chart-wrapper')?.classList.remove('hidden');
        document.getElementById('dynamic-podium-wrapper')?.classList.add('hidden');
        dChart = renderChart('dynamicChart', dChart, tab, customW, col);
        document.getElementById('dynamic-desc').innerHTML = '💡 <strong>ปัจจัย:</strong> ' + TITLES[tab - 1] + ' (ปรับตามที่คุณเลือก)';
    }
}

// Re-render on theme change


document.addEventListener('DOMContentLoaded', () => { refresh(); });
