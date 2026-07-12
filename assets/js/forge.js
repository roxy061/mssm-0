/* -----------------------------------------------
   FORGE.js - MSSM Lab Engine
   Calculation, Economics, Charts, Dashboard
   ----------------------------------------------- */

const DB = [
    { id: 'hunu', name: 'เห็ดหูหนูดำ', sciName: 'Auricularia auricula-judae', tempMin: 25, tempMax: 32, humMin: 85, humMax: 95, growth: 0.42, yieldG: 240.0, flowerDay: 13.5, walkDay: 27.5, resistance: 'สูงมาก (ทนทานต่อโรคพืชทั่วไป)', region: 'ภาคกลาง, ภาคใต้, ภาคเหนือ', img: 'assets/images/hunu.webp' },
    { id: 'kraeng', name: 'เห็ดแครง', sciName: 'Schizophyllum commune', tempMin: 25, tempMax: 30, humMin: 70, humMax: 85, growth: 0.85, yieldG: 335.0, flowerDay: 4.0, walkDay: 9.0, resistance: 'สูง (ทนทานต่อราเขียวและอากาศร้อน)', region: 'ภาคใต้, ภาคกลาง', img: 'assets/images/kraeng.webp' },
    { id: 'nfa', name: 'นางฟ้าภูฐาน', sciName: 'Pleurotus ostreatus (Bhutan)', tempMin: 23, tempMax: 28, humMin: 75, humMax: 90, growth: 0.61, yieldG: 425.0, flowerDay: 5.0, walkDay: 10.5, resistance: 'ปานกลาง (ค่อนข้างอ่อนไหวต่อราส้ม)', region: 'ภาคเหนือ, ภาคอีสาน, ภาคกลาง', img: 'assets/images/nangfa.webp' },
    { id: 'nrom', name: 'นางรมฮังการี', sciName: 'Pleurotus ostreatus (Hungary)', tempMin: 20, tempMax: 25, humMin: 80, humMax: 90, growth: 0.58, yieldG: 375.0, flowerDay: 8.5, walkDay: 17.5, resistance: 'ต่ำ (อ่อนไหวต่อน้ำขังและไรเห็ด)', region: 'ภาคเหนือ, ภาคอีสาน', img: 'assets/images/nangrom.webp' }
];
let charts = {};

function validateWeights() {
    let total = 0;
    for (let i = 1; i <= 6; i++) total += parseFloat(document.getElementById('w' + i)?.value) || 0;
    const el = document.getElementById('weightAlert');
    if (el) el.classList.toggle('hidden', Math.abs(total - 100) < 0.01);
}

let _pricesSynced = false;
function syncPricesFromMarket() {
    if (_pricesSynced) return;
    const saved = localStorage.getItem('mssm_market_prices');
    if (saved) {
        try {
            const marketPrices = JSON.parse(saved);
            const map = {
                'เห็ดหูหนู': 'inPriceHunu',
                'เห็ดแครง': 'inPriceKraeng',
                'เห็ดนางฟ้าภูฐาน': 'inPriceNangfa',
                'เห็ดนางรมฮังการี': 'inPriceNangrom'
            };
            for (const [thaiName, elId] of Object.entries(map)) {
                const el = document.getElementById(elId);
                if (el && marketPrices[thaiName] !== undefined) {
                    el.value = Math.round(marketPrices[thaiName]);
                }
            }
            _pricesSynced = true;
        } catch (e) { }
    }
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
    syncPricesFromMarket();
    const gonsVal = document.getElementById('inGons')?.value;
    const cpgVal = document.getElementById('inCostPerGon')?.value;
    const regionVal = document.getElementById('inRegion')?.value || 'south';
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

    const regionWeather = {
        south: { name: 'ภาคใต้', tempMin: 25, tempMax: 34, humMin: 80, humMax: 95 },
        north: { name: 'ภาคเหนือ', tempMin: 18, tempMax: 32, humMin: 65, humMax: 85 },
        central: { name: 'ภาคกลาง', tempMin: 24, tempMax: 36, humMin: 70, humMax: 90 },
        northeast: { name: 'ภาคอีสาน', tempMin: 22, tempMax: 35, humMin: 60, humMax: 85 }
    };
    const reg = regionWeather[regionVal];

    let results = DB.map(m => {
        const yKg = (m.yieldG * gons) / 1000;
        const rev = yKg * prices[m.id];
        const profit = rev - tc;
        const bcr = tc > 0 ? rev / tc : 0;
        const td = m.walkDay + m.flowerDay;
        const di = td > 0 ? rev / td : 0;

        const mTempMid = (m.tempMin + m.tempMax) / 2;
        const rTempMid = (reg.tempMin + reg.tempMax) / 2;
        const dTemp = Math.abs(mTempMid - rTempMid);
        const sTemp = Math.max(0, 100 - dTemp * 8);

        const mHumMid = (m.humMin + m.humMax) / 2;
        const rHumMid = (reg.humMin + reg.humMax) / 2;
        const dHum = Math.abs(mHumMid - rHumMid);
        const sHum = Math.max(0, 100 - dHum * 4);

        const suitability = Math.round((sTemp + sHum) / 2);

        const costMix = tc * 0.50;
        const costSter = tc * 0.20;
        const costLabor = tc * 0.30;

        return { 
            ...m, 
            yieldKg: yKg, 
            revenue: rev, 
            profit, 
            bcr, 
            payback: rev > 0 ? (tc / rev) * 90 : 0, 
            totalDays: td,
            suitability,
            costMix,
            costSter,
            costLabor,
            costTotal: tc
        };
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

    const latestReport = {
        gons,
        cpg,
        regionName: reg.name,
        regionCode: regionVal,
        results: results.map(r => ({
            id: r.id,
            name: r.name,
            sciName: r.sciName,
            mpi: r.mpi,
            suitability: r.suitability,
            yieldKg: r.yieldKg,
            costTotal: r.costTotal,
            revenue: r.revenue,
            profit: r.profit,
            bcr: r.bcr,
            payback: r.payback,
            spawnDays: r.walkDay,
            firstFlushDays: r.flowerDay,
            resistance: r.resistance
        }))
    };
    localStorage.setItem('mssm_latest_report', JSON.stringify(latestReport));

    renderDash(results);
    renderTable(results, gons, cpg);
    renderScore(results, weights);
    renderMPICard(results, reg);
    renderYieldCostComparison(results, gons, cpg);
    renderSubstrateMix(gons);
    renderCharts(results);
}

function renderDash(data) {
    const el = document.getElementById('podiumList');
    if (!el) return;
    const medals = ['🥇', '🥈', '🥉', '✨'];
    el.innerHTML = data.map((item, i) => {
        const win = i === 0 ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 bg-gradient-to-r from-emerald-500/5 to-transparent shadow-md' : '';
        const star = item.mpi > 0.85 ? '★★★★★' : item.mpi > 0.7 ? '★★★★☆' : '★★★☆☆';
        return `<div class="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/55 ${win}">
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
        let bcrBadge = '';
        if (item.bcr > 1.5) {
            bcrBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">คุ้มค่ามาก</span>`;
        } else if (item.bcr >= 1.0) {
            bcrBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">คุ้มค่า</span>`;
        } else {
            bcrBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20">ขาดทุน</span>`;
        }
        return `<tr class="border-b border-gray-100 dark:border-gray-700/50">
            <td class="p-2 md:p-3 text-left font-bold text-gray-700 dark:text-gray-200 text-xs md:text-sm">${item.name}</td>
            <td class="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300 font-mono">${item.yieldKg.toFixed(2)}</td>
            <td class="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300 font-mono">${(gons * cpg).toLocaleString(undefined, {maximumFractionDigits:0})}</td>
            <td class="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300 font-mono">${item.revenue.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
            <td class="p-2 md:p-3 text-center text-xs md:text-sm font-bold ${pc} font-mono">${item.profit.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
            <td class="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300 font-mono flex items-center justify-center gap-1.5">${item.bcr.toFixed(2)} ${bcrBadge}</td>
            <td class="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300 font-mono">${item.payback.toFixed(1)}</td>
        </tr>`;
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

    const mk = (id, cfg) => {
        const el = document.getElementById(id);
        if (!el) return null;
        try {
            if (!cfg.options) cfg.options = {};
            cfg.options.animation = {
                duration: 800,
                easing: 'easeOutQuart'
            };
            return new Chart(el.getContext('2d'), { responsive: true, maintainAspectRatio: false, ...cfg });
        } catch (e) {
            return null;
        }
    };

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

window.addEventListener('themechanged', calc);

function exportCSV() {
    const headers = ['สายพันธุ์', 'ระยะเดินเส้นใย (วัน)', 'ระยะออกดอกแรก (วัน)', 'ผลผลิตรวม (กก.)', 'รายได้รวม (บาท)', 'ต้นทุนรวม (บาท)', 'กำไรสุทธิ (บาท)', 'BCR', 'ระยะเวลาคืนทุน (วัน)'];
    const rows = [headers];
    
    const gons = parseFloat(document.getElementById('inGons')?.value) || 0;
    const cpg = parseFloat(document.getElementById('inCostPerGon')?.value) || 0;
    const tc = gons * cpg;
    
    const prices = {
        hunu: parseFloat(document.getElementById('inPriceHunu')?.value) || 0,
        kraeng: parseFloat(document.getElementById('inPriceKraeng')?.value) || 0,
        nfa: parseFloat(document.getElementById('inPriceNangfa')?.value) || 0,
        nrom: parseFloat(document.getElementById('inPriceNangrom')?.value) || 0
    };
    
    DB.forEach(m => {
        const yKg = (m.yieldG * gons) / 1000;
        const rev = yKg * prices[m.id];
        const profit = rev - tc;
        const bcr = tc > 0 ? (rev / tc) : 0;
        const payback = profit > 0 ? (tc / (profit / 365)) : 9999;
        
        rows.push([
            m.name,
            m.walkDay,
            m.flowerDay,
            yKg.toFixed(2),
            rev.toFixed(2),
            tc.toFixed(2),
            profit.toFixed(2),
            bcr.toFixed(2),
            payback > 365 ? 'เกิน 1 ปี' : `${Math.round(payback)} วัน`
        ]);
    });
    
    let csvContent = "\ufeff"; // BOM for UTF-8 Excel support in Thai
    rows.forEach(row => {
        csvContent += row.map(v => `"${v}"`).join(",") + "\r\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mssm_lab_economics_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function renderMPICard(results, reg) {
    const list = document.getElementById('mpiDetailsList');
    if (!list) return;
    const sorted = [...results].sort((a, b) => b.mpi - a.mpi);
    list.innerHTML = sorted.map((item, idx) => {
        let level = '';
        let colorClass = '';
        if (item.mpi >= 0.8) {
            level = 'เหมาะสมมากที่สุด (Excellent)';
            colorClass = 'bg-emerald-500';
        } else if (item.mpi >= 0.6) {
            level = 'เหมาะสมดี (Very Good)';
            colorClass = 'bg-teal-500';
        } else if (item.mpi >= 0.4) {
            level = 'เหมาะสมปานกลาง (Fair)';
            colorClass = 'bg-amber-500';
        } else {
            level = 'เหมาะสมต่ำ (Low)';
            colorClass = 'bg-rose-500';
        }
        return `
            <div class="p-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-150 dark:border-gray-800">
                <div class="flex justify-between items-center mb-1">
                    <span class="font-extrabold text-xs text-gray-850 dark:text-gray-250">อันดับ ${idx + 1}: ${item.name}</span>
                    <strong class="text-amber-550 dark:text-amber-450 text-xs font-black">MPI: ${item.mpi.toFixed(4)}</strong>
                </div>
                <div class="flex justify-between items-center text-[10px] text-gray-400 mb-1.5">
                    <span>ระดับ: ${level}</span>
                    <span>อากาศภาค${reg.name}: <strong class="text-emerald-500 font-bold">${item.suitability}%</strong></span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div class="${colorClass} h-full rounded-full" style="width: ${Math.round(item.mpi * 100)}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderYieldCostComparison(results, gons, cpg) {
    const tbody = document.getElementById('yieldCostComparisonBody');
    if (!tbody) return;
    tbody.innerHTML = results.map(item => {
        return `
            <tr class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10">
                <td class="p-2 md:p-3 text-left font-bold text-gray-700 dark:text-gray-200">${item.name}</td>
                <td class="p-2 md:p-3 font-mono">${(item.costMix / gons).toFixed(2)} บ.</td>
                <td class="p-2 md:p-3 font-mono">${(item.costSter / gons).toFixed(2)} บ.</td>
                <td class="p-2 md:p-3 font-mono">${(item.costLabor / gons).toFixed(2)} บ.</td>
                <td class="p-2 md:p-3 font-mono font-bold text-rose-500">${item.costTotal.toLocaleString()} บ.</td>
                <td class="p-2 md:p-3 font-mono font-black text-emerald-500">${item.yieldKg.toFixed(2)} กก.</td>
            </tr>
        `;
    }).join('');
}

function renderSubstrateMix(gons) {
    const dryWeightPerBag = 227.5;
    const totalDryWeight = (gons * dryWeightPerBag) / 1000;
    const sawdust = totalDryWeight * 0.885;
    const riceBran = totalDryWeight * 0.08;
    const lime = totalDryWeight * 0.02;
    const minerals = totalDryWeight * 0.015;
    const water = gons * 0.4225;
    const setVal = (id, val, unit) => {
        const el = document.getElementById(id);
        if (el) el.textContent = `${val.toFixed(2)} ${unit}`;
    };
    setVal('mixSawdust', sawdust, 'กิโลกรัม');
    setVal('mixRiceBran', riceBran, 'กิโลกรัม');
    setVal('mixLime', lime, 'กิโลกรัม');
    setVal('mixMinerals', minerals, 'กิโลกรัม');
    setVal('mixWater', water, 'ลิตร (กก.)');
}
