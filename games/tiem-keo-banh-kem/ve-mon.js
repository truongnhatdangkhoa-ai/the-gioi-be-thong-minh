/* =========================================================
   VẼ MÓN - Tiệm kẹo – bánh – kem
   Mọi hình (kẹo, bánh, kem, tô trộn, lò nướng, máy làm kẹo)
   đều vẽ bằng SVG ngay trong trình duyệt, không cần file ảnh.
   Khung vẽ luôn là 300 x 300.
   ========================================================= */
const VeMon = (function () {
  'use strict';

  let dem = 0;
  function uid(tien) { dem++; return tien + dem; }
  function f(x) { return Math.round(x * 10) / 10; }

  /* ---------- Màu ---------- */
  function rgb(h) {
    h = h.replace('#', '');
    return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
  }
  function pha(a, b, t) {
    const x = rgb(a), y = rgb(b);
    return '#' + x.map(function (v, i) {
      const s = Math.round(v + (y[i] - v) * t).toString(16);
      return s.length < 2 ? '0' + s : s;
    }).join('');
  }
  function toi(h, t) { return pha(h, '#3a2350', t === undefined ? 0.38 : t); }
  function sang(h, t) { return pha(h, '#ffffff', t === undefined ? 0.45 : t); }

  // Số ngẫu nhiên cố định theo "hạt giống": vẽ lại không bị nhảy chỗ
  function rng(hat) {
    let s = hat % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
  }

  const MAU_CAU_VONG = ['#ff4d6d', '#ff9f1c', '#ffd23f', '#6fcf5a', '#4dabf7', '#9b6bff'];
  const MAU_COM = ['#ff4d6d', '#ffd23f', '#4dabf7', '#6fcf5a', '#ffffff', '#b86bff', '#ff9f1c'];

  function khung(noiDung, lop, nhan) {
    return '<svg class="' + (lop || '') + '" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"' +
      (nhan ? ' role="img" aria-label="' + nhan + '"' : ' aria-hidden="true"') + '>' + noiDung + '</svg>';
  }

  /* ---------- Hình cơ bản ---------- */
  function duongTron(cx, cy, r) {
    return 'M' + f(cx - r) + ',' + f(cy) + 'a' + f(r) + ',' + f(r) + ' 0 1,0 ' + f(2 * r) + ',0' +
      'a' + f(r) + ',' + f(r) + ' 0 1,0 ' + f(-2 * r) + ',0Z';
  }
  function duongTim(cx, cy, r) {
    return 'M' + f(cx) + ',' + f(cy + r * 0.95) +
      'C' + f(cx - r * 1.5) + ',' + f(cy + r * 0.05) + ' ' + f(cx - r * 0.95) + ',' + f(cy - r * 1.08) + ' ' + f(cx) + ',' + f(cy - r * 0.42) +
      'C' + f(cx + r * 0.95) + ',' + f(cy - r * 1.08) + ' ' + f(cx + r * 1.5) + ',' + f(cy + r * 0.05) + ' ' + f(cx) + ',' + f(cy + r * 0.95) + 'Z';
  }
  function duongSao(cx, cy, r, trong) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const g = -Math.PI / 2 + i * Math.PI / 5;
      const rr = i % 2 ? r * (trong || 0.5) : r;
      d += (i ? 'L' : 'M') + f(cx + rr * Math.cos(g)) + ',' + f(cy + rr * Math.sin(g));
    }
    return d + 'Z';
  }
  function duongHoa(cx, cy, r) {
    let d = '';
    for (let i = 0; i < 5; i++) {
      const g = -Math.PI / 2 + i * 2 * Math.PI / 5;
      d += duongTron(cx + r * 0.55 * Math.cos(g), cy + r * 0.55 * Math.sin(g), r * 0.5);
    }
    return d + duongTron(cx, cy, r * 0.5);
  }
  function duongLapLanh(x, y, s) {
    return 'M' + f(x) + ',' + f(y - s) + 'Q' + f(x) + ',' + f(y) + ' ' + f(x + s) + ',' + f(y) +
      'Q' + f(x) + ',' + f(y) + ' ' + f(x) + ',' + f(y + s) +
      'Q' + f(x) + ',' + f(y) + ' ' + f(x - s) + ',' + f(y) +
      'Q' + f(x) + ',' + f(y) + ' ' + f(x) + ',' + f(y - s) + 'Z';
  }
  function hinhKeo(hinh, cx, cy, r) {
    if (hinh === 'tim') return duongTim(cx, cy, r);
    if (hinh === 'sao') return duongSao(cx, cy, r * 1.12, 0.52);
    if (hinh === 'hoa') return duongHoa(cx, cy, r);
    return duongTron(cx, cy, r);
  }
  function gradientCauVong(id) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      MAU_CAU_VONG.map(function (m, i) { return '<stop offset="' + f(i / (MAU_CAU_VONG.length - 1)) + '" stop-color="' + m + '"/>'; }).join('') +
      '</linearGradient>';
  }
  function bong(cx, cy, rx) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="9" fill="rgba(58,35,80,.12)"/>';
  }
  function comMau(hat, soLuong, x0, x1, y0, y1, doDai) {
    const ng = rng(hat);
    let s = '';
    for (let i = 0; i < soLuong; i++) {
      const x = x0 + ng() * (x1 - x0), y = y0 + ng() * (y1 - y0), g = Math.round(ng() * 180);
      s += '<rect x="' + f(x - 2.5) + '" y="' + f(y - doDai / 2) + '" width="5" height="' + doDai + '" rx="2.5" fill="' +
        MAU_COM[i % MAU_COM.length] + '" transform="rotate(' + g + ' ' + f(x) + ' ' + f(y) + ')"/>';
    }
    return s;
  }
  function matCuoi(cx, cy, r) {
    const m = '#3a2350';
    return '<g class="mat-cuoi">' +
      '<circle cx="' + f(cx - r * 0.3) + '" cy="' + f(cy - r * 0.08) + '" r="' + f(r * 0.09) + '" fill="' + m + '"/>' +
      '<circle cx="' + f(cx + r * 0.3) + '" cy="' + f(cy - r * 0.08) + '" r="' + f(r * 0.09) + '" fill="' + m + '"/>' +
      '<circle cx="' + f(cx - r * 0.27) + '" cy="' + f(cy - r * 0.12) + '" r="' + f(r * 0.03) + '" fill="#fff"/>' +
      '<circle cx="' + f(cx + r * 0.33) + '" cy="' + f(cy - r * 0.12) + '" r="' + f(r * 0.03) + '" fill="#fff"/>' +
      '<path d="M' + f(cx - r * 0.16) + ',' + f(cy + r * 0.12) + ' Q' + f(cx) + ',' + f(cy + r * 0.3) + ' ' + f(cx + r * 0.16) + ',' + f(cy + r * 0.12) + '" stroke="' + m + '" stroke-width="' + f(r * 0.06) + '" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="' + f(cx - r * 0.5) + '" cy="' + f(cy + r * 0.12) + '" rx="' + f(r * 0.12) + '" ry="' + f(r * 0.07) + '" fill="#ff5d8f" opacity=".45"/>' +
      '<ellipse cx="' + f(cx + r * 0.5) + '" cy="' + f(cy + r * 0.12) + '" rx="' + f(r * 0.12) + '" ry="' + f(r * 0.07) + '" fill="#ff5d8f" opacity=".45"/>' +
      '</g>';
  }

  /* =========================================================
     KẸO  t = { kieu: mut|goi|deo, mau: '#hex'|'cau-vong', hinh, topping: {id: true} }
     ========================================================= */
  function keo(t, lop, nhan) {
    const id = uid('k');
    const laCauVong = t.mau === 'cau-vong';
    const mauGoc = laCauVong ? '#ff8fc8' : t.mau;
    const to = laCauVong ? 'url(#' + id + 'g)' : t.mau;
    const vien = laCauVong ? '#8a3f7a' : toi(mauGoc);
    const tp = t.topping || {};
    let cx = 150, cy = 118, r = 80;
    if (t.kieu === 'goi') { cy = 150; r = 66; }
    if (t.kieu === 'deo') { cy = 156; r = 92; }
    const d = hinhKeo(t.hinh, cx, cy, r);
    let s = '<defs>' + (laCauVong ? gradientCauVong(id + 'g') : '') +
      '<clipPath id="' + id + 'c"><path d="' + d + '"/></clipPath></defs>';
    s += bong(150, 284, t.kieu === 'mut' ? 40 : 88);

    if (t.kieu === 'mut') {
      const y0 = cy + r * 0.4;
      s += '<rect x="141" y="' + f(y0) + '" width="18" height="' + f(282 - y0) + '" rx="9" fill="#fff" stroke="#d6cfe9" stroke-width="4"/>' +
        '<path d="M143,' + f(y0 + 40) + ' L157,' + f(y0 + 30) + ' M143,' + f(y0 + 70) + ' L157,' + f(y0 + 60) + '" stroke="' + sang(mauGoc, 0.2) + '" stroke-width="5" stroke-linecap="round"/>';
    }
    if (t.kieu === 'goi') {
      const giay = sang(mauGoc, 0.4);
      [-1, 1].forEach(function (h) {
        const a = cx + h * r * 0.8, b = cx + h * r * 1.85, c = cx + h * r * 1.62;
        s += '<path d="M' + f(a) + ',' + f(cy - r * 0.2) + ' L' + f(b) + ',' + f(cy - r * 0.72) + ' Q' + f(c) + ',' + f(cy) + ' ' + f(b) + ',' + f(cy + r * 0.72) +
          ' L' + f(a) + ',' + f(cy + r * 0.2) + 'Z" fill="' + giay + '" stroke="' + vien + '" stroke-width="5" stroke-linejoin="round"/>' +
          '<path d="M' + f(a + h * 18) + ',' + f(cy - r * 0.12) + ' L' + f(b - h * 14) + ',' + f(cy - r * 0.4) + ' M' + f(a + h * 18) + ',' + f(cy + r * 0.12) + ' L' + f(b - h * 14) + ',' + f(cy + r * 0.4) +
          '" stroke="' + vien + '" stroke-width="3" stroke-linecap="round" opacity=".35"/>';
      });
    }
    // Viền: nét dày nằm dưới, phần màu phủ lên trên -> chỉ thấy viền ngoài
    s += '<path d="' + d + '" fill="' + vien + '" stroke="' + vien + '" stroke-width="11" stroke-linejoin="round"/>';
    s += '<path d="' + d + '" fill="' + to + '"/>';
    s += '<g clip-path="url(#' + id + 'c)">';
    if (t.kieu === 'deo') s += '<ellipse cx="' + cx + '" cy="' + f(cy + r * 0.9) + '" rx="' + f(r * 1.2) + '" ry="' + f(r * 0.5) + '" fill="#3a2350" opacity=".12"/>';
    if (tp.soc) {
      let p = '';
      const vong = 3.2 * 2 * Math.PI;
      for (let a = 0; a <= vong; a += 0.25) {
        const rr = r * 1.2 * a / vong;
        p += (a ? 'L' : 'M') + f(cx + rr * Math.cos(a)) + ',' + f(cy + rr * Math.sin(a));
      }
      s += '<path d="' + p + '" stroke="#fff" stroke-width="' + f(r * 0.14) + '" fill="none" stroke-linecap="round" opacity=".85"/>';
    }
    if (tp['com-mau']) s += comMau(7, 18, cx - r, cx + r, cy - r, cy + r, 13);
    s += '<ellipse cx="' + f(cx - r * 0.38) + '" cy="' + f(cy - r * 0.42) + '" rx="' + f(r * 0.26) + '" ry="' + f(r * 0.13) + '" fill="#fff" opacity=".6" transform="rotate(-35 ' + f(cx - r * 0.38) + ' ' + f(cy - r * 0.42) + ')"/>';
    s += '</g>';
    if (t.hinh === 'hoa') s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + f(r * 0.34) + '" fill="' + sang(mauGoc, 0.55) + '" opacity=".75"/>';
    if (tp['mat-cuoi']) s += matCuoi(cx, cy + (t.hinh === 'tim' ? -r * 0.05 : r * 0.05), r);
    if (tp['lap-lanh']) {
      const ng = rng(11);
      for (let i = 0; i < 5; i++) {
        s += '<path d="' + duongLapLanh(cx + (ng() - 0.5) * r * 1.2, cy + (ng() - 0.5) * r * 1.2, 5 + ng() * 5) + '" fill="#fff"/>';
      }
      [[-1.25, -0.9], [1.2, -0.75], [1.1, 0.6], [-1.05, 0.7]].forEach(function (v, i) {
        s += '<path class="lap-lanh" style="animation-delay:' + (i * 0.3) + 's" d="' + duongLapLanh(cx + v[0] * r, cy + v[1] * r, 11) + '" fill="#ffd23f" stroke="#fff" stroke-width="2"/>';
      });
    }
    return khung(s, lop, nhan);
  }

  /* =========================================================
     BÁNH - miếng trang trí
     ========================================================= */
  function mieng(loai, x, y, co) {
    const k = co || 1.3;
    let s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k + ')">';
    if (loai === 'dau') {
      s += '<path d="M0,15 C-15,6 -15,-9 0,-9 C15,-9 15,6 0,15Z" fill="#ff4d6d" stroke="#c21f45" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<circle cx="-5" cy="-1" r="1.3" fill="#ffe28a"/><circle cx="4" cy="1" r="1.3" fill="#ffe28a"/><circle cx="0" cy="7" r="1.3" fill="#ffe28a"/><circle cx="-2" cy="-5" r="1.2" fill="#ffe28a"/>' +
        '<path d="M-8,-9 L-3,-12 L0,-16 L3,-12 L8,-9 L2,-8 L0,-5 L-2,-8Z" fill="#4caf3a" stroke="#2f7d24" stroke-width="1.5" stroke-linejoin="round"/>';
    } else if (loai === 'cherry') {
      s += '<path d="M0,-2 Q2,-16 10,-22" stroke="#5f8a2a" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="9" cy="-21" rx="5" ry="2.5" fill="#6fcf5a" transform="rotate(-25 9 -21)"/>' +
        '<circle cx="0" cy="4" r="10" fill="#e11d48" stroke="#9f1239" stroke-width="2.5"/>' +
        '<ellipse cx="-3.5" cy="0" rx="3" ry="2" fill="#fff" opacity=".7"/>';
    } else if (loai === 'keo') {
      s += '<path d="' + duongSao(0, 0, 13, 0.5) + '" fill="#ffd23f" stroke="#d9a400" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<circle cx="-3" cy="-3" r="2" fill="#fff" opacity=".8"/>';
    }
    return s + '</g>';
  }

  /* BÁNH  t = { soCola, rac, mieng: [{loai, x, y}] } */
  function banh(t, lop, nhan) {
    let s = '';
    s += '<ellipse cx="150" cy="264" rx="130" ry="23" fill="#fff" stroke="#d6cfe9" stroke-width="4"/>' +
      '<ellipse cx="150" cy="262" rx="104" ry="15" fill="#f4f0fb"/>';
    // Thân bánh
    s += '<path d="M55,150 L55,245 A95,24 0 0,0 245,245 L245,150Z" fill="#f5c173" stroke="#c98d3e" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M57,196 A93,24 0 0,0 243,196 L243,212 A93,24 0 0,1 57,212Z" fill="#ff9fbd"/>' +
      '<path d="M70,176 A80,20 0 0,0 100,188 M190,224 A80,20 0 0,0 225,214" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".45"/>';
    // Lớp kem phủ + phần chảy xuống mặt trước
    const kem = t.soCola ? '#7a4a2c' : '#fff3f6';
    const vienKem = t.soCola ? '#4f2d18' : '#e7b7c6';
    let p = 'M55,150';
    const N = 10;
    for (let i = 0; i < N; i++) {
      const a0 = Math.PI * i / N, a1 = Math.PI * (i + 1) / N, am = (a0 + a1) / 2;
      const sau = (i % 2 ? 12 : 26) * (t.soCola ? 1.25 : 1);
      const xm = 150 - 95 * Math.cos(am), ym = 150 + 26 * Math.sin(am) + sau;
      const x1 = 150 - 95 * Math.cos(a1), y1 = 150 + 26 * Math.sin(a1);
      p += ' Q' + f(xm) + ',' + f(ym) + ' ' + f(x1) + ',' + f(y1);
    }
    p += ' A95,26 0 0,0 55,150Z';
    s += '<path d="' + p + '" fill="' + kem + '" stroke="' + vienKem + '" stroke-width="4" stroke-linejoin="round"/>';
    s += '<ellipse cx="120" cy="143" rx="30" ry="6" fill="#fff" opacity="' + (t.soCola ? '.25' : '.8') + '"/>';
    if (t.rac) {
      s += '<g class="rac-mau">' + comMau(3, 26, 70, 230, 132, 162, 10) + comMau(5, 10, 64, 236, 170, 188, 9) + '</g>';
    }
    (t.mieng || []).slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (m) {
      s += mieng(m.loai, m.x, m.y);
    });
    return khung(s, lop, nhan);
  }

  /* =========================================================
     TÔ TRỘN  t = { da: ['trung','sua',...], tron: 0..3 }
     ========================================================= */
  function to(t, lop, nhan) {
    const da = t.da || [];
    const muc = Math.min(3, t.tron || 0) / 3;
    const mo = 1 - muc;
    let s = bong(150, 272, 92);
    s += '<ellipse cx="150" cy="150" rx="100" ry="24" fill="#e6f6ff" stroke="#4a9fd8" stroke-width="5"/>';
    if (da.length) {
      const bot = pha('#fff8ea', '#f3c77a', muc);
      s += '<ellipse cx="150" cy="153" rx="92" ry="19" fill="' + bot + '"/>';
      if (da.indexOf('bot') >= 0) s += '<path d="M112,154 Q130,128 150,132 Q170,128 186,154Z" fill="#f4e3c1" stroke="#dcc293" stroke-width="3" opacity="' + mo + '"/>';
      if (da.indexOf('sua') >= 0) s += '<ellipse cx="186" cy="152" rx="26" ry="9" fill="#fff" stroke="#dfe9f7" stroke-width="3" opacity="' + mo + '"/>';
      if (da.indexOf('trung') >= 0) {
        s += '<g opacity="' + mo + '"><ellipse cx="106" cy="152" rx="20" ry="9" fill="#fff" stroke="#efe7d8" stroke-width="2"/><circle cx="106" cy="150" r="9" fill="#ffc93c" stroke="#e8a317" stroke-width="2"/></g>';
      }
      if (da.indexOf('duong') >= 0) {
        s += '<g opacity="' + mo + '">' +
          '<path d="' + duongLapLanh(150, 142, 6) + '" fill="#fff"/><path d="' + duongLapLanh(166, 148, 4) + '" fill="#fff"/><path d="' + duongLapLanh(136, 150, 4) + '" fill="#fff"/>' +
          '<circle cx="158" cy="155" r="2.5" fill="#fff"/><circle cx="142" cy="143" r="2" fill="#fff"/></g>';
      }
      if (muc > 0) {
        let p = '';
        const vong = 2.5 * 2 * Math.PI;
        for (let a = 0; a <= vong; a += 0.3) {
          const rr = 80 * a / vong;
          p += (a ? 'L' : 'M') + f(150 + rr * Math.cos(a)) + ',' + f(153 + rr * 0.2 * Math.sin(a));
        }
        s += '<path d="' + p + '" stroke="' + toi(bot, 0.25) + '" stroke-width="4" fill="none" opacity="' + f(0.25 + muc * 0.35) + '"/>';
      }
    }
    // Thân tô (che nửa dưới đồ bên trong)
    s += '<path d="M50,152 Q58,268 150,268 Q242,268 250,152 A100,24 0 0,1 50,152Z" fill="#9fd8ff" stroke="#4a9fd8" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M78,190 Q92,238 136,250" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".55"/>' +
      '<circle cx="190" cy="215" r="7" fill="#fff" opacity=".7"/><circle cx="212" cy="196" r="5" fill="#fff" opacity=".7"/><circle cx="168" cy="236" r="5" fill="#fff" opacity=".7"/>';
    if (t.coPhoi) {
      s += '<g class="phoi"><path d="M208,40 L168,138" stroke="#a36a3b" stroke-width="10" stroke-linecap="round"/>' +
        '<ellipse cx="164" cy="146" rx="14" ry="20" fill="#d9a066" stroke="#a36a3b" stroke-width="4" transform="rotate(22 164 146)"/></g>';
    }
    return khung(s, lop, nhan);
  }

  /* =========================================================
     LÒ NƯỚNG  t = { dangNuong, daChin }
     ========================================================= */
  function lo(t, lop, nhan) {
    const id = uid('l');
    let s = '<defs><radialGradient id="' + id + '" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#ffd166"/><stop offset=".6" stop-color="#ff8a3d"/><stop offset="1" stop-color="#e2553b"/></radialGradient></defs>';
    s += bong(150, 282, 110);
    if (t.dangNuong) {
      s += '<g class="hoi-nong" stroke="#ff9f6b" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7">' +
        '<path d="M110,50 q-10,-12 0,-24 q10,-12 0,-24"/><path d="M150,48 q-10,-12 0,-24 q10,-12 0,-24"/><path d="M190,50 q-10,-12 0,-24 q10,-12 0,-24"/></g>';
    }
    s += '<rect x="38" y="60" width="224" height="210" rx="30" fill="#ffb3c7" stroke="#d9547c" stroke-width="6"/>' +
      '<rect x="38" y="60" width="224" height="50" rx="26" fill="#ffc7d6" stroke="#d9547c" stroke-width="6"/>' +
      '<circle cx="78" cy="85" r="12" fill="#fff" stroke="#d9547c" stroke-width="4"/><path d="M78,85 L78,76" stroke="#d9547c" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="116" cy="85" r="12" fill="#fff" stroke="#d9547c" stroke-width="4"/><path d="M116,85 L124,81" stroke="#d9547c" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="160" y="74" width="80" height="22" rx="11" fill="#3b2d5c"/>' +
      '<circle class="' + (t.dangNuong ? 'den-lo' : '') + '" cx="226" cy="85" r="6" fill="' + (t.dangNuong ? '#ffd23f' : (t.daChin ? '#6fcf5a' : '#6b6490')) + '"/>' +
      '<rect x="68" y="120" width="164" height="16" rx="8" fill="#fff" stroke="#d9547c" stroke-width="4"/>' +
      '<rect x="66" y="146" width="168" height="104" rx="20" fill="#3b2d5c" stroke="#d9547c" stroke-width="5"/>';
    if (t.dangNuong || t.daChin) s += '<rect class="' + (t.dangNuong ? 'lua-lo' : '') + '" x="71" y="151" width="158" height="94" rx="16" fill="url(#' + id + ')" opacity="' + (t.dangNuong ? '1' : '.45') + '"/>';
    // Khay + bánh đang nở
    s += '<rect x="96" y="222" width="108" height="14" rx="5" fill="#9aa0b8" stroke="#6b7190" stroke-width="3"/>';
    if (t.dangNuong || t.daChin) {
      s += '<g class="' + (t.dangNuong ? 'banh-no' : '') + '"><path d="M104,222 L104,200 Q150,170 196,200 L196,222Z" fill="#f5c173" stroke="#c98d3e" stroke-width="4" stroke-linejoin="round"/></g>';
    }
    s += '<path d="M84,160 L110,160" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>' +
      '<rect x="62" y="268" width="26" height="12" rx="5" fill="#d9547c"/><rect x="212" y="268" width="26" height="12" rx="5" fill="#d9547c"/>';
    return khung(s, lop, nhan);
  }

  /* =========================================================
     MÁY LÀM KẸO (hoạt hình khi bấm hoàn thành)
     ========================================================= */
  function may(mau, lop) {
    const mauKeo = mau === 'cau-vong' ? '#ff8fc8' : mau;
    let s = bong(150, 284, 110);
    s += '<path d="M92,18 L208,18 L178,70 L122,70Z" fill="#ffe28a" stroke="#d9a400" stroke-width="5" stroke-linejoin="round"/>' +
      '<g class="may-rung">' +
      '<rect x="50" y="66" width="200" height="178" rx="34" fill="#7dd3fc" stroke="#2b86c5" stroke-width="6"/>' +
      '<circle cx="150" cy="150" r="52" fill="#fff" stroke="#2b86c5" stroke-width="6"/>' +
      '<g class="banh-rang"><path d="' + duongSao(150, 150, 34, 0.62) + '" fill="' + mauKeo + '" stroke="' + toi(mauKeo) + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<circle cx="150" cy="150" r="10" fill="#fff"/></g>' +
      '<circle class="den-may" cx="80" cy="92" r="8" fill="#ff5d8f"/><circle class="den-may" style="animation-delay:.2s" cx="220" cy="92" r="8" fill="#ffd23f"/>' +
      '<circle class="den-may" style="animation-delay:.4s" cx="80" cy="214" r="8" fill="#6fcf5a"/><circle class="den-may" style="animation-delay:.6s" cx="220" cy="214" r="8" fill="#9b6bff"/>' +
      '</g>' +
      '<rect x="118" y="240" width="64" height="30" rx="8" fill="#94a3b8" stroke="#64748b" stroke-width="5"/>';
    return khung(s, lop, 'Máy làm kẹo đang chạy');
  }

  /* =========================================================
     KEM  t = { kieu: '1'|'2'|'3'|'xoan', vi: ['#hex',...], vat: oc-que|ly|coc, topping: {} }
     tuyChon.vienChon: đánh dấu viên kem đang được chọn màu
     ========================================================= */
  function vienKemDuong(cx, cy, r) {
    let d = 'M' + f(cx - r) + ',' + f(cy) + ' A' + f(r) + ',' + f(r) + ' 0 0,1 ' + f(cx + r) + ',' + f(cy);
    const yMep = cy + r * 0.32;
    d += ' L' + f(cx + r) + ',' + f(yMep);
    const soSong = 5;
    for (let i = 0; i < soSong; i++) {
      const xa = cx + r - (2 * r) * i / soSong, xb = cx + r - (2 * r) * (i + 1) / soSong;
      d += ' Q' + f((xa + xb) / 2) + ',' + f(yMep + r * 0.42) + ' ' + f(xb) + ',' + f(yMep);
    }
    return d + 'Z';
  }
  function cacVienKem(t) {
    if (t.kieu === 'xoan') return [];
    const n = Number(t.kieu) || 1;
    const ds = [{ cx: 150, cy: 150, r: 52 }, { cx: 145, cy: 104, r: 47 }, { cx: 153, cy: 62, r: 42 }];
    return ds.slice(0, n);
  }
  function dinhKem(t) {
    if (t.kieu === 'xoan') return { cx: 150, y: 30, r: 40 };
    const v = cacVienKem(t);
    const cuoi = v[v.length - 1];
    return { cx: cuoi.cx, y: cuoi.cy - cuoi.r, r: cuoi.r, cy: cuoi.cy };
  }
  function vat(loai, phan) {
    let s = '';
    if (loai === 'ly') {
      if (phan === 'sau') return '<path d="M66,162 Q150,172 234,162" stroke="#8cc8ee" stroke-width="4" fill="none"/>';
      s += '<path d="M64,160 Q72,236 150,240 Q228,236 236,160Z" fill="#cdeeff" fill-opacity=".55" stroke="#6bb5e0" stroke-width="5" stroke-linejoin="round"/>' +
        '<path d="M84,178 Q92,218 124,228" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>' +
        '<rect x="141" y="238" width="18" height="30" fill="#cdeeff" stroke="#6bb5e0" stroke-width="5"/>' +
        '<ellipse cx="150" cy="274" rx="48" ry="11" fill="#cdeeff" stroke="#6bb5e0" stroke-width="5"/>';
      return s;
    }
    if (phan === 'sau') return '';
    if (loai === 'coc') {
      const id = uid('c');
      s += '<defs><clipPath id="' + id + '"><path d="M84,172 L216,172 L196,284 L104,284Z"/></clipPath></defs>' +
        '<path d="M84,172 L216,172 L196,284 L104,284Z" fill="#fff" stroke="#7b5cff" stroke-width="5" stroke-linejoin="round"/>' +
        '<g clip-path="url(#' + id + ')" fill="#ff8fc8" opacity=".85">' +
        '<rect x="96" y="160" width="16" height="140" transform="rotate(10 104 230)"/><rect x="132" y="160" width="16" height="140" transform="rotate(4 140 230)"/>' +
        '<rect x="168" y="160" width="16" height="140" transform="rotate(-4 176 230)"/><rect x="204" y="160" width="16" height="140" transform="rotate(-10 212 230)"/></g>' +
        '<rect x="78" y="164" width="144" height="16" rx="8" fill="#ffe28a" stroke="#7b5cff" stroke-width="5"/>';
      return s;
    }
    // ốc quế
    const id2 = uid('o');
    s += '<defs><clipPath id="' + id2 + '"><path d="M98,172 L202,172 L150,290Z"/></clipPath></defs>' +
      '<path d="M98,172 L202,172 L150,290Z" fill="#eab063" stroke="#b9772f" stroke-width="5" stroke-linejoin="round"/>' +
      '<g clip-path="url(#' + id2 + ')" stroke="#c98a3e" stroke-width="4">' +
      [0, 1, 2, 3, 4, 5].map(function (i) {
        return '<path d="M' + (70 + i * 30) + ',160 L' + (150 + i * 30) + ',300"/><path d="M' + (230 - i * 30) + ',160 L' + (150 - i * 30) + ',300"/>';
      }).join('') + '</g>';
    return s;
  }
  function kem(t, lop, nhan, tuyChon) {
    tuyChon = tuyChon || {};
    const tp = t.topping || {};
    const vi = t.vi && t.vi.length ? t.vi : ['#ff8fb1'];
    let s = bong(150, 288, t.vat === 'ly' ? 56 : 60);
    s += vat(t.vat, 'sau');
    const laLy = t.vat === 'ly';
    const dich = laLy ? 12 : 0; // trong ly thì kem ngồi thấp hơn một chút
    let kemHtml = '';
    let chiSoChon = '';
    if (t.kieu === 'xoan') {
      const m = vi[0];
      const tang = [{ y: 158, rx: 64, ry: 24 }, { y: 124, rx: 54, ry: 22 }, { y: 92, rx: 42, ry: 20 }, { y: 64, rx: 28, ry: 17 }];
      tang.forEach(function (g) {
        kemHtml += '<ellipse cx="150" cy="' + (g.y + dich) + '" rx="' + g.rx + '" ry="' + g.ry + '" fill="' + m + '" stroke="' + toi(m, 0.3) + '" stroke-width="5"/>' +
          '<path d="M' + (150 - g.rx * 0.6) + ',' + (g.y + dich - 5) + ' Q150,' + (g.y + dich - g.ry * 0.9) + ' ' + (150 + g.rx * 0.2) + ',' + (g.y + dich - g.ry * 0.7) + '" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>';
      });
      kemHtml += '<path d="M136,' + (54 + dich) + ' Q142,' + (22 + dich) + ' 164,' + (28 + dich) + ' Q150,' + (38 + dich) + ' 160,' + (54 + dich) + 'Z" fill="' + m + '" stroke="' + toi(m, 0.3) + '" stroke-width="5" stroke-linejoin="round"/>';
      if (tuyChon.vienChon !== undefined && tuyChon.vienChon >= 0) {
        chiSoChon = '<ellipse class="vong-chon" cx="150" cy="' + (110 + dich) + '" rx="80" ry="90" fill="none" stroke="#7b5cff" stroke-width="5" stroke-dasharray="12 9"/>';
      }
      kemHtml += '<ellipse data-vien="0" cx="150" cy="' + (110 + dich) + '" rx="70" ry="80" fill="transparent"/>';
    } else {
      cacVienKem(t).forEach(function (v, i) {
        const m = vi[i] || vi[0];
        const cy = v.cy + dich;
        kemHtml += '<path d="' + vienKemDuong(v.cx, cy, v.r) + '" fill="' + m + '" stroke="' + toi(m, 0.3) + '" stroke-width="5" stroke-linejoin="round"/>' +
          '<ellipse cx="' + f(v.cx - v.r * 0.4) + '" cy="' + f(cy - v.r * 0.45) + '" rx="' + f(v.r * 0.22) + '" ry="' + f(v.r * 0.12) + '" fill="#fff" opacity=".6" transform="rotate(-30 ' + f(v.cx - v.r * 0.4) + ' ' + f(cy - v.r * 0.45) + ')"/>';
        if (tuyChon.vienChon === i) {
          chiSoChon = '<circle class="vong-chon" cx="' + v.cx + '" cy="' + cy + '" r="' + (v.r + 12) + '" fill="none" stroke="#7b5cff" stroke-width="5" stroke-dasharray="12 9"/>';
        }
      });
      cacVienKem(t).forEach(function (v, i) {
        kemHtml += '<circle data-vien="' + i + '" cx="' + v.cx + '" cy="' + (v.cy + dich) + '" r="' + v.r + '" fill="transparent"/>';
      });
    }
    if (!laLy) s += vat(t.vat, 'truoc');
    s += '<g class="cac-vien">' + kemHtml + '</g>';
    if (laLy) s += vat(t.vat, 'truoc');

    // Topping
    const dinh = dinhKem(t);
    const yDinh = dinh.y + dich;
    if (tp.socola) {
      const cx = dinh.cx, r = dinh.r * (t.kieu === 'xoan' ? 1.1 : 1);
      const cy = t.kieu === 'xoan' ? 70 + dich : dinh.cy + dich;
      let d = 'M' + f(cx - r * 0.95) + ',' + f(cy - r * 0.15) + ' A' + f(r * 0.97) + ',' + f(r * 0.97) + ' 0 0,1 ' + f(cx + r * 0.95) + ',' + f(cy - r * 0.15);
      const n = 6;
      for (let i = 0; i < n; i++) {
        const xa = cx + r * 0.95 - (1.9 * r) * i / n, xb = cx + r * 0.95 - (1.9 * r) * (i + 1) / n;
        const sau = (i % 2 ? 0.2 : 0.5) * r;
        d += ' Q' + f((xa + xb) / 2) + ',' + f(cy - r * 0.15 + sau) + ' ' + f(xb) + ',' + f(cy - r * 0.15);
      }
      s += '<path d="' + d + 'Z" fill="#6b3f26" stroke="#4a2a18" stroke-width="4" stroke-linejoin="round"/>' +
        '<ellipse cx="' + f(cx - r * 0.35) + '" cy="' + f(cy - r * 0.62) + '" rx="' + f(r * 0.2) + '" ry="' + f(r * 0.08) + '" fill="#fff" opacity=".35"/>';
    }
    const vungRac = t.kieu === 'xoan' ? [{ cx: 150, cy: 120 + dich, r: 50 }] :
      cacVienKem(t).map(function (v) { return { cx: v.cx, cy: v.cy + dich, r: v.r * 0.75 }; });
    if (tp.hat) {
      vungRac.forEach(function (v, i) {
        s += comMau(21 + i * 5, 9, v.cx - v.r, v.cx + v.r, v.cy - v.r * 0.9, v.cy + v.r * 0.3, 9);
      });
    }
    if (tp.keo) {
      const ng = rng(41);
      const mau = ['#ff4d6d', '#4dabf7', '#ffd23f', '#6fcf5a', '#b86bff'];
      vungRac.forEach(function (v) {
        for (let i = 0; i < 3; i++) {
          const x = v.cx + (ng() - 0.5) * v.r * 1.6, y = v.cy + (ng() - 0.7) * v.r;
          const m = mau[Math.floor(ng() * mau.length)];
          s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="7" fill="' + m + '" stroke="' + toi(m, 0.35) + '" stroke-width="2.5"/><circle cx="' + f(x - 2) + '" cy="' + f(y - 2) + '" r="2" fill="#fff" opacity=".8"/>';
        }
      });
    }
    if (tp.dau) {
      s += mieng('dau', dinh.cx + 4, yDinh - 6, 1.6);
      if (t.kieu !== 'xoan') {
        const v0 = cacVienKem(t)[0];
        s += mieng('dau', v0.cx + v0.r * 0.72, v0.cy + dich - v0.r * 0.15, 1.05);
      }
    }
    s += chiSoChon;
    return khung(s, lop, nhan);
  }

  /* Một viên kem nhỏ để làm nút chọn vị */
  function vienKem(mau, lop) {
    const s = bong(150, 262, 80) +
      '<path d="' + vienKemDuong(150, 170, 96) + '" fill="' + mau + '" stroke="' + toi(mau, 0.3) + '" stroke-width="10" stroke-linejoin="round"/>' +
      '<ellipse cx="112" cy="126" rx="22" ry="12" fill="#fff" opacity=".6" transform="rotate(-30 112 126)"/>';
    return khung(s, lop);
  }

  return {
    keo: keo, banh: banh, to: to, lo: lo, may: may, kem: kem, vienKem: vienKem,
    cacVienKem: cacVienKem, toi: toi, sang: sang
  };
})();
