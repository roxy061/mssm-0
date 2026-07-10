/* -----------------------------------------------
   FORGE.js - MSSM Lab Engine
   Calculation, Economics, Charts, Dashboard
   ----------------------------------------------- */

const DB = [
    { id: 'hunu', name: 'เห็ดหูหนูดำ', growth: 0.42, yieldG: 247.3, flowerDay: 14.1, walkDay: 30, img: 'assets/images/hunu.webp' },
    { id: 'kraeng', name: 'เห็ดแครง', growth: 0.85, yieldG: 322.5, flowerDay: 8.2, walkDay: 30, img: 'assets/images/kraeng.webp' },
    { id: 'nfa', name: 'นางฟ้าภูฐาน', growth: 0.61, yieldG: 428.6, flowerDay: 9.6, walkDay: 7, img: 'assets/images/nangfa.webp' },
    { id: 'nrom', name: 'นางรมฮังการี', growth: 0.58, yieldG: 401.8, flowerDay: 10.4, walkDay: 7, img: 'assets/images/nangrom.webp' }
];
let charts = {};

function validateWeights() {
    let total = 0;
    for (let i = 1; i <= 6; i++) total += parseFloat(document.getElementById('w' + i)?.value) || 0;
    const el = document.getElementById('weightAlert');
    if (el) el.classList.toggle('hidden', Math.abs(total - 100) < 0.01);
}

function resetAll() {
    for (const [id, v] of Object.entries({
        inGons: 100, inCostPerGon: 18, inPriceHunu: 60,
        inPriceKraeng: 120, inPriceNangfa: 70, inPriceNangrom: 75
    })) {
        const el = document.getElementById(id);
        if (el) el.value = v;
    }
    const defaultWeights = [15, 25, 25, 15, 10, 10];
    for (let i = 1; i <= 6; i++) {
        const el = document.getElementById('w' + i);
        if (el) el.value = defaultWeights[i - 1];
    }
    localStorage.removeItem('mssm_lab_inputs');
    calc();
}

function calc() {
    validateWeights();
    const gonsVal = document.getElementById('inGons')?.value;
    const cpgVal = document.getElementById('inCostPerGon')?.value;
    const gons = parseFloat(gonsVal);
    const cpg = parseFloat(cpgVal);
    const tc = gons * cpg;

    const prices = {
        hunu: parseFloat(document.getElementById('inPriceHunu')?.value),
        kraeng: parseFloat(document.getElementById('inPriceKraeng')?.value),
        nfa: parseFloat(document.getElementById('inPriceNangfa')?.value),
        nrom: parseFloat(document.getElementById('inPriceNangrom')?.value)
    };

    const isInvalid = isNaN(gons) || gons <= 0 || isNaN(cpg) || cpg < 0 ||
                      isNaN(prices.hunu) || prices.hunu < 0 ||
                      isNaN(prices.kraeng) || prices.kraeng < 0 ||
                      isNaN(prices.nfa) || prices.nfa < 0 ||
                      isNaN(prices.nrom) || prices.nrom < 0;

    if (isInvalid) {
        showEmptyState();
        return;
    }

    const weights = [];
    for (let i = 1; i <= 6; i++) weights.push((parseFloat(document.getElementById('w' + i)?.value) || 0) / 100);

    saveInputs(gons, cpg, prices, weights);

    let results = DB.map(m => {
        const yKg = (m.yieldG * gons) / 1000;
        const rev = yKg * prices[m.id];
        const profit = rev - tc;
        const bcr = tc > 0 ? rev / tc : 0;
        const td = m.walkDay + m.flowerDay;
        const di = td > 0 ? rev / td : 0;
        return { ...m, yieldKg: yKg, revenue: rev, profit, bcr, payback: di > 0 ? tc / di : 0, totalDays: td };
    });

    const metrics = ['growth', 'yieldG', 'profit', 'bcr', 'flowerDay', 'payback'];
    const rm = results.map(r => metrics.map(m => r[m]));
    const mins = metrics.map((_, i) => Math.min(...rm.map(r => r[i])));
    const maxs = metrics.map((_, i) => Math.max(...rm.map(r => r[i])));

    results = results.map(r => {
        const nv = metrics.map((m, i) => {
            const diff = maxs[i] - mins[i];
            if (diff === 0) return 1;
            const v = r[m];
            return i < 4 ? (v - mins[i]) / diff : (maxs[i] - v) / diff;
        });
        const mpi = nv.reduce((s, v, i) => s + v * weights[i], 0);
        return { ...r, normValues: nv, mpi };
    }).sort((a, b) => b.mpi - a.mpi);

    renderDash(results);
    renderTable(results, gons, cpg);
    renderScore(results, weights);
    renderCharts(results);
}

function renderDash(data) {
    const el = document.getElementById('podiumList');
    if (!el) return;
    const medals = ['🥇', '🥈', '🥉', '✨'];
    el.innerHTML = data.map((item, i) => {
        const win = i === 0 ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 bg-gradient-to-r from-emerald-500/5 to-transparent shadow-md' : '';
        const star = item.mpi > 0.85 ? '★★★★★' : item.mpi > 0.7 ? '★★★★☆' : '★★★☆☆';
        return `<div class="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/50 ${win}">
            <span class="text-lg md:text-xl font-black whitespace-nowrap">${medals[i]} ${i + 1}</span>
            <img src="${item.img}" class="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 shadow-sm">
            <div class="flex-1 min-w-0 px-2 text-left"><h4 class="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 truncate">${item.name}</h4><span class="text-[10px] md:text-xs text-amber-500">${star}</span></div>
            <div class="text-right"><span class="text-[10px] opacity-60 block">MPI</span><span class="text-sm md:text-base font-black text-amber-500">${item.mpi.toFixed(4)}</span></div>
        </div>`;
    }).join('');
}

function renderTable(data, gons, cpg) {
    const el = document.getElementById('ecoResultsBody');
    if (!el) return;
    const dark = document.documentElement.classList.contains('dark');
    el.innerHTML = data.map(item => {
        const pc = item.profit >= 0 ? (dark ? 'text-emerald-400' : 'text-emerald-600') : 'text-red-500';
        return `<tr class="border-b border-gray-100 dark:border-gray-700/50"><td class="p-2 md:p-3 text-left font-bold text-gray-700 dark:text-gray-200 text-xs md:text-sm">${item.name}</td><td class="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300">${item.yieldKg.toFixed(2)}</td><td class="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300">${(gons * cpg).toFixed(0)}</td><td class="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300">${item.revenue.toFixed(0)}</td><td class="p-2 md:p-3 text-center text-xs md:text-sm font-bold ${pc}">${item.profit.toFixed(0)}</td><td class="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300">${item.bcr.toFixed(2)}</td><td class="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300">${item.payback.toFixed(1)}</td></tr>`;
    }).join('');
}

function renderScore(data, weights) {
    const el = document.getElementById('scoreTableBody');
    if (!el) return;
    const order = ['เห็ดหูหนูดำ', 'เห็ดแครง', 'นางฟ้าภูฐาน', 'นางรมฮังการี'];
    const labels = ['อัตราเดินเส้นใย', 'ปริมาณผลผลิต', 'กำไรสุทธิ', 'ค่า BCR', 'วันออกดอกแรก', 'ระยะเวลาคืนทุน'];
    el.innerHTML = labels.map((l, i) => {
        let cells = `<td class="p-2 md:p-3 text-left text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200">${l} (${(weights[i] * 100).toFixed(0)}%)</td>`;
        order.forEach(n => { const o = data.find(d => d.name === n); cells += `<td class="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300">${o ? o.normValues[i].toFixed(4) : '0'}</td>`; });
        return `<tr class="border-b border-gray-100 dark:border-gray-700/50">${cells}</tr>`;
    }).join('');
}

function renderCharts(data) {
    const dark = document.documentElement.classList.contains('dark');
    const tc = dark ? '#e2e8f0' : '#334155';
    const gc = dark ? 'rgba(52,211,153,0.1)' : 'rgba(16,185,129,0.15)';
    const labels = data.map(d => d.name);
    const clrs = dark ? ['#34d399', '#f59e0b', '#06b6d4', '#ec4899'] : ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

    Object.values(charts).forEach(c => { try { c.destroy(); } catch (e) { } });
    charts = {};

    const mk = (id, cfg) => { const el = document.getElementById(id); if (!el) return null; try { return new Chart(el.getContext('2d'), { responsive: true, maintainAspectRatio: false, ...cfg }); } catch (e) { return null; } };

    charts.radar = mk('radarChart', {
        type: 'radar',
        data: { labels: ['เส้นใย', 'ผลผลิต', 'กำไร', 'BCR', 'วันออกดอก', 'คืนทุน'], datasets: data.map((d, i) => ({ label: d.name, data: d.normValues, borderColor: clrs[i], backgroundColor: clrs[i] + '20' })) },
        options: { scales: { r: { grid: { color: gc }, ticks: { display: false }, pointLabels: { color: tc } } }, plugins: { legend: { labels: { color: tc } } } }
    });
    charts.mpi = mk('mpiBarChart', {
        type: 'bar',
        data: { labels, datasets: [{ label: 'MPI', data: data.map(d => d.mpi), backgroundColor: dark ? ['#475569', '#f59e0b', '#f97316', '#34d399'] : ['#94a3b8', '#f59e0b', '#d97706', '#10b981'] }] },
        options: { scales: { y: { beginAtZero: true, max: 1.0, ticks: { color: tc }, grid: { color: gc } }, x: { ticks: { color: tc } } }, plugins: { legend: { display: false }, title: { display: true, text: 'อันดับ MPI', color: tc } } }
    });
    charts.profit = mk('profitChart', {
        type: 'bar',
        data: { labels, datasets: [{ label: 'กำไร (บาท)', data: data.map(d => d.profit), backgroundColor: dark ? '#34d399' : '#10b981' }] },
        options: { scales: { y: { ticks: { color: tc }, grid: { color: gc } }, x: { ticks: { color: tc } } }, plugins: { legend: { display: false }, title: { display: true, text: 'กำไรสุทธิ', color: tc } } }
    });
    charts.bcr = mk('bcrChart', {
        type: 'line',
        data: { labels, datasets: [{ label: 'BCR', data: data.map(d => d.bcr), borderColor: '#f59e0b', fill: false, tension: 0.4 }] },
        options: { scales: { y: { ticks: { color: tc }, grid: { color: gc } }, x: { ticks: { color: tc } } }, plugins: { legend: { display: false }, title: { display: true, text: 'BCR', color: tc } } }
    });
    charts.yield = mk('yieldChart', {
        type: 'bar',
        data: { labels, datasets: [{ label: 'ผลผลิต (กก.)', data: data.map(d => d.yieldKg), backgroundColor: dark ? '#06b6d4' : '#3b82f6' }] },
        options: { scales: { y: { ticks: { color: tc }, grid: { color: gc } }, x: { ticks: { color: tc } } }, plugins: { legend: { display: false }, title: { display: true, text: 'ผลผลิตรวม', color: tc } } }
    });
    charts.payback = mk('paybackChart', {
        type: 'bar',
        data: { labels, datasets: [{ label: 'คืนทุน (วัน)', data: data.map(d => d.payback), backgroundColor: dark ? '#ec4899' : '#ef4444' }] },
        options: { scales: { y: { ticks: { color: tc }, grid: { color: gc } }, x: { ticks: { color: tc } } }, plugins: { legend: { display: false }, title: { display: true, text: 'คืนทุน', color: tc } } }
    });
}

// Re-calc on theme change

function showEmptyState() {
    const podium = document.getElementById('podiumList');
    if (podium) {
        podium.innerHTML = `
        <div class="p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-center my-2 animate-pop-in">
            <div class="text-5xl mb-3 text-amber-500 animate-pulse">📊</div>
            <h3 class="font-extrabold text-gray-800 dark:text-gray-100 text-base mb-1">ข้อมูลนำเข้าไม่ถูกต้อง</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto leading-relaxed">
                กรุณาตรวจสอบว่ากรอกข้อมูลถูกต้อง (จำนวนก้อนต้องมากกว่า 0 และราคา/ต้นทุนต้องไม่ติดลบหรือเว้นว่าง)
            </p>
            <button onclick="resetAll()" class="px-5 py-2 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"><i class="fas fa-undo"></i> คืนค่าเริ่มต้น</button>
        </div>
        `;
    }

    const ecoTable = document.getElementById('ecoResultsBody');
    if (ecoTable) {
        ecoTable.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-xs text-gray-400 dark:text-gray-500 italic"><i class="fas fa-calculator-slash"></i> ไม่สามารถคำนวณผลได้เนื่องจากมีข้อผิดพลาดข้อมูลนำเข้า</td></tr>`;
    }
    const scoreTable = document.getElementById('scoreTableBody');
    if (scoreTable) {
        scoreTable.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-xs text-gray-400 dark:text-gray-500 italic"><i class="fas fa-calculator-slash"></i> ไม่สามารถแสดงคะแนนได้</td></tr>`;
    }

    Object.values(charts).forEach(c => { try { c.destroy(); } catch (e) { } });
    charts = {};
}

function saveInputs(gons, cpg, prices, weights) {
    const data = { gons, cpg, prices, weights };
    localStorage.setItem('mssm_lab_inputs', JSON.stringify(data));
}

function loadSavedInputs() {
    const saved = localStorage.getItem('mssm_lab_inputs');
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        if (data.gons !== undefined) document.getElementById('inGons').value = data.gons;
        if (data.cpg !== undefined) document.getElementById('inCostPerGon').value = data.cpg;
        if (data.prices) {
            if (data.prices.hunu !== undefined) document.getElementById('inPriceHunu').value = data.prices.hunu;
            if (data.prices.kraeng !== undefined) document.getElementById('inPriceKraeng').value = data.prices.kraeng;
            if (data.prices.nfa !== undefined) document.getElementById('inPriceNangfa').value = data.prices.nfa;
            if (data.prices.nrom !== undefined) document.getElementById('inPriceNangrom').value = data.prices.nrom;
        }
        if (data.weights) {
            for (let i = 1; i <= 6; i++) {
                const val = data.weights[i - 1];
                if (val !== undefined) {
                    const el = document.getElementById('w' + i);
                    if (el) el.value = Math.round(val * 100);
                }
            }
        }
    } catch (e) {
        console.error("Error loading saved inputs", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSavedInputs();
    calc();
});
