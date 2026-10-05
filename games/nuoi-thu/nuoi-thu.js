/* NUÔI THÚ - game nuôi thú thời gian thực: 10 bé thú, lên cấp, biến hình 1 lần,
   cho ăn rau củ/bánh/kẹo/nước/nước ngọt, mỗi bé một sân riêng. Lưu trong localStorage. */
(function () {
  'use strict';
  const CAP_BIEN_HINH = 5;
  const T = [
    { id: 'cun', n: 'Cún con', a: '🐶', b: '🐺', y: 'Sân cỏ xanh', s: '#bfe9ff', g: '#8fd36b', d: '🌳🏠🌳🌼' },
    { id: 'meo', n: 'Mèo con', a: '🐱', b: '🦁', y: 'Vườn nhà', s: '#ffe5b4', g: '#e9c46a', d: '🌻🏡🌷' },
    { id: 'tho', n: 'Thỏ con', a: '🐰', b: '🦄', y: 'Đồng cỏ cầu vồng', s: '#e6d4ff', g: '#b8f2a0', d: '🌈🌷🍄' },
    { id: 'ga', n: 'Gà con', a: '🐣', b: '🦚', y: 'Nông trại', s: '#cdeeff', g: '#d9b36c', d: '🌾🌽🌾' },
    { id: 'vit', n: 'Vịt con', a: '🐥', b: '🦢', y: 'Ao sen', s: '#cfefff', g: '#5bc0eb', d: '🌿🌸🌿' },
    { id: 'ca', n: 'Cá nhỏ', a: '🐟', b: '🐬', y: 'Bể nước xanh', s: '#7dd3fc', g: '#0ea5e9', d: '🌊🐚🌊' },
    { id: 'rua', n: 'Rùa con', a: '🐢', b: '🐉', y: 'Bãi biển', s: '#bde7ff', g: '#f6e2a8', d: '🌴🐚🌴' },
    { id: 'gau', n: 'Gấu con', a: '🐻', b: '🐼', y: 'Rừng tre', s: '#d7f5d0', g: '#7bc47f', d: '🎋🌲🎋' },
    { id: 'sau', n: 'Sâu nhỏ', a: '🐛', b: '🦋', y: 'Vườn hoa', s: '#ffd6ec', g: '#9be37d', d: '🌸🌺🌻🌷' },
    { id: 'chim', n: 'Chim non', a: '🐦', b: '🦅', y: 'Bầu trời mây', s: '#5ec8ff', g: '#cfeeff', d: '⛅☁️⛅' }
  ];
  // h: no, t: khát, v: vui, x: kinh nghiệm, s: đồ ngọt
  const F = [
    { e: '🍎', n: 'Táo', h: 12, t: 3, v: 3, x: 6 },
    { e: '🥕', n: 'Cà rốt', h: 15, t: 0, v: 2, x: 7 },
    { e: '🥦', n: 'Bông cải', h: 15, t: 0, v: 1, x: 8 },
    { e: '🍚', n: 'Cơm', h: 30, t: -3, v: 3, x: 10 },
    { e: '🍰', n: 'Bánh', h: 20, t: -5, v: 12, x: 12, s: 1 },
    { e: '🍬', n: 'Kẹo', h: 5, t: -5, v: 15, x: 10, s: 1 },
    { e: '💧', n: 'Nước', h: 0, t: 35, v: 3, x: 5 },
    { e: '🥤', n: 'Nước ngọt', h: 3, t: 20, v: 15, x: 9, s: 1 }
  ];
  const KEY = 'nuoiThuV1';
  const root = document.getElementById('khu-tro-choi');
  const $ = function (id) { return document.getElementById(id); };
  const kep = function (v) { return Math.max(0, Math.min(100, v)); };
  const can = function (lv) { return 30 + lv * 20; };
  let S = doc(), cur = null, p = null, vong = null, di = null, dem = 0;

  function doc() { try { return JSON.parse(localStorage.getItem(KEY)) || { pets: {} }; } catch (e) { return { pets: {} }; } }
  function luu() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function tienDo() {
    try {
      LuuTru.capNhatTroChoi('nuoi-thu', function (tc) {
        tc.soThu = Object.keys(S.pets).length;
        tc.soLanHoanThanh = Object.keys(S.pets).filter(function (k) { return S.pets[k].evo; }).length;
      });
    } catch (e) {}
  }
  function am(ten) { try { AmThanh.phat(ten); } catch (e) {} }

  function dung() { clearInterval(vong); clearInterval(di); vong = di = null; luu(); }

  function chonThu() {
    dung(); cur = p = null;
    root.innerHTML = '<h2 class="nt-tit">Chọn bé thú để nuôi 🐾</h2><div class="nt-luoi">' + T.map(function (t) {
      const q = S.pets[t.id];
      return '<button class="nt-the" data-id="' + t.id + '"><span class="nt-e">' + (q && q.evo ? t.b : t.a) + '</span><b>' + t.n + '</b><small>' + (q ? 'Cấp ' + q.lv : 'Nhận nuôi') + '</small></button>';
    }).join('') + '</div>';
    root.querySelectorAll('.nt-the').forEach(function (b) { b.onclick = function () { sanNuoi(b.dataset.id); }; });
  }

  function sanNuoi(id) {
    dung();
    cur = T.find(function (t) { return t.id === id; });
    if (!S.pets[id]) { S.pets[id] = { lv: 1, xp: 0, hun: 80, thi: 80, hap: 80, dg: 0, evo: false, t: Date.now() }; tienDo(); }
    p = S.pets[id];
    const giay = Math.min((Date.now() - p.t) / 1000, 3600);   // lúc bé đi vắng, thú vẫn đói dần
    p.hun = Math.max(10, kep(p.hun - 0.15 * giay)); p.thi = Math.max(10, kep(p.thi - 0.2 * giay)); p.hap = Math.max(10, kep(p.hap - 0.1 * giay)); p.dg = 0; p.t = Date.now();
    const dc = Array.from(cur.d);
    root.innerHTML =
      '<div class="nt-top"><button class="nt-quay" id="quay">⬅️ Chọn thú</button><div class="nt-ten"><span id="ten"></span><div class="nt-bar x"><i id="bx"></i></div></div></div>' +
      '<div class="nt-san" id="san" style="background:linear-gradient(' + cur.s + ' 0 40%,' + cur.g + ' 40%)">' +
      dc.map(function (c, i) { return '<span class="nt-dc" style="left:' + (6 + i * (84 / dc.length)) + '%">' + c + '</span>'; }).join('') +
      '<div class="nt-thu" id="thu"><span class="nt-ei" id="ei"></span></div><div class="nt-noi" id="noi"></div></div>' +
      '<div class="nt-chiso">' + [['hun', '🍽️'], ['thi', '💧'], ['hap', '😊']].map(function (k) { return '<div>' + k[1] + '<div class="nt-bar"><i id="b-' + k[0] + '"></i></div></div>'; }).join('') + '</div>' +
      '<div class="nt-khay">' + F.map(function (f, i) { return '<button class="nt-mon" data-i="' + i + '"><span>' + f.e + '</span><small>' + f.n + '</small></button>'; }).join('') + '</div>';
    $('quay').onclick = chonThu;
    $('thu').onclick = vuotVe;
    root.querySelectorAll('.nt-mon').forEach(function (b) { b.onclick = function () { choAn(+b.dataset.i); }; });
    datVitri(50, 65); ve();
    vong = setInterval(nhip, 1000);
    di = setInterval(dao, 3000);
  }

  function datVitri(x, y) { const e = $('thu'); e.style.left = x + '%'; e.style.top = y + '%'; }
  function dao() {
    const e = $('thu'); if (!e) return;
    const x = 12 + Math.random() * 76, y = 48 + Math.random() * 38;
    $('ei').style.setProperty('--f', x < parseFloat(e.style.left) ? 1 : -1);
    datVitri(x, y);
  }
  function noi(s) { const n = $('noi'); if (!n) return; n.textContent = s; clearTimeout(noi.h); if (s) noi.h = setTimeout(function () { n.textContent = ''; }, 2500); }
  function bay(s) {
    const e = $('thu'), san = $('san'); if (!e) return;
    const d = document.createElement('div'); d.className = 'nt-bay'; d.textContent = s;
    d.style.left = e.style.left; d.style.top = e.style.top; san.appendChild(d); setTimeout(function () { d.remove(); }, 1200);
  }

  function nhan(x) {
    p.xp += x;
    while (p.xp >= can(p.lv)) {
      p.xp -= can(p.lv); p.lv++;
      noi('🎉 Lên cấp ' + p.lv + '!'); am('nhan');
      if (p.lv >= CAP_BIEN_HINH && !p.evo) { p.evo = true; bienHinh(); tienDo(); }
    }
  }
  function bienHinh() {
    const d = document.createElement('div'); d.className = 'nt-bh';
    d.innerHTML = '✨ Biến hình! ✨<span>' + cur.a + ' ➜ ' + cur.b + '</span>';
    $('san').appendChild(d); am('nhan');
    try { App.phaoGiay(); } catch (e) {}
    setTimeout(function () { d.remove(); }, 3500);
  }

  function choAn(i) {
    const f = F[i];
    if (f.h > 0 && p.hun >= 98) return noi('Con no rồi! 😋');
    if (f.h === 0 && p.thi >= 98) return noi('Con không khát! 💦');
    if (f.s && p.dg >= 4) return noi('Ngọt nhiều sâu răng đó! Ăn rau, uống nước nhé 🦷');
    p.hun = kep(p.hun + f.h); p.thi = kep(p.thi + f.t); p.hap = kep(p.hap + f.v);
    if (f.s) p.dg += 1;
    nhan(f.x); bay(f.e + ' +' + f.x + '⭐'); am('nhan');
    const t = $('thu'); t.classList.add('vui'); setTimeout(function () { t.classList.remove('vui'); }, 1200);
    luu(); ve();
  }
  function vuotVe() { p.hap = kep(p.hap + 5); nhan(1); bay('💖'); noi('Hihi! 💕'); ve(); }

  function nhip() {   // mỗi giây: chỉ số giảm dần, thú khoẻ mạnh thì tự lớn
    p.hun = kep(p.hun - 0.15); p.thi = kep(p.thi - 0.2); p.hap = kep(p.hap - 0.1);
    p.dg = Math.max(0, p.dg - 0.05); p.t = Date.now();
    if (p.hun >= 50 && p.thi >= 50 && p.hap >= 50) nhan(0.3);
    if (++dem % 5 === 0) luu();
    ve();
  }
  function ve() {
    if (!cur) return;
    $('ten').textContent = (p.evo ? cur.b : cur.a) + ' ' + cur.n + ' – Cấp ' + p.lv + ' – ' + cur.y;
    $('bx').style.width = (p.xp / can(p.lv) * 100) + '%';
    ['hun', 'thi', 'hap'].forEach(function (k) { $('b-' + k).style.width = p[k] + '%'; });
    $('ei').textContent = p.evo ? cur.b : cur.a;
    $('thu').style.fontSize = Math.min(4 + p.lv * 0.12, 6) + 'rem';
    const buon = Math.min(p.hun, p.thi, p.hap) < 25;
    $('thu').classList.toggle('buon', buon);
    if (buon && !$('noi').textContent) noi(p.hun < 25 ? '🍽️ Con đói quá!' : p.thi < 25 ? '💧 Con khát nước!' : '😢 Chơi với con đi!');
  }

  try { App.khoiTao({ duongDanGoc: '../../' }); } catch (e) {}
  window.addEventListener('pagehide', luu);
  chonThu();
})();
