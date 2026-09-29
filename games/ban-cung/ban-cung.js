/* =========================================================
   TRÒ CHƠI: BẮN CUNG
   Kéo dây cung về phía sau rồi thả tay để bắn bóng bay.
   Có 4 loại bóng xuất hiện ngẫu nhiên:
     - bóng thú bông (bên trong có gấu bông, thỏ, cừu...)
     - bóng màu thường
     - bóng trái tim
     - bóng sao vàng (nhỏ, bay nhanh, thưởng thêm điểm)
   Không bao giờ trừ điểm: bắn trượt chỉ làm mất chuỗi thưởng.
   ========================================================= */
(function () {
  'use strict';

  const GOC_ANH = '../../assets/images/';
  const FONT_EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  // Thú bông trong bóng. Muốn thêm: chép ảnh vào assets/images/ rồi thêm một dòng { id, ten }.
  const THU_BONG = [
    { id: 'gau', ten: 'gấu nâu' },
    { id: 'gau-bac-cuc', ten: 'gấu trắng' },
    { id: 'tho', ten: 'thỏ trắng' },
    { id: 'cuu', ten: 'cừu non' },
    { id: 'heo', ten: 'heo hồng' },
    { id: 'cho', ten: 'chó vàng' },
    { id: 'cao', ten: 'cáo cam' },
    { id: 'khi', ten: 'khỉ con' },
    { id: 'soc', ten: 'sóc nâu' },
    { id: 'vit', ten: 'vịt vàng' },
    { id: 'voi', ten: 'voi xám' },
    { id: 'kangaroo', ten: 'chuột túi' }
  ];

  // Màu bóng: [màu sáng, màu đậm]
  const MAU_BONG = [
    ['#ff7a85', '#d6303f'], ['#5cb8ff', '#1c7ed6'], ['#ffdd57', '#f08c00'],
    ['#7ee08f', '#2f9e44'], ['#e28cf5', '#9c36b5'], ['#ffa94d', '#d9480f'], ['#ff9cc0', '#d6336c']
  ];

  const CAU_HINH_DO_KHO = {
    // muc: số bóng cần bắn trúng | soBong: số bóng trên trời | tocDo: tốc độ bay lên
    // co: cỡ bóng | duongNgam: độ dài đường ngắm (1 = dài nhất) | tiLe: tỉ lệ từng loại bóng
    'de': { muc: 8, soBong: 4, tocDo: 46, co: 1.15, duongNgam: 1.0, tiLe: { thu: 0.55, thuong: 0.25, tim: 0.12, sao: 0.08 } },
    'trung-binh': { muc: 12, soBong: 5, tocDo: 68, co: 1.0, duongNgam: 0.55, tiLe: { thu: 0.45, thuong: 0.27, tim: 0.16, sao: 0.12 } },
    'kho': { muc: 16, soBong: 6, tocDo: 92, co: 0.88, duongNgam: 0.28, tiLe: { thu: 0.4, thuong: 0.25, tim: 0.18, sao: 0.17 } }
  };

  const CAU_HINH = {
    id: 'ban-cung',
    ten: 'Bắn cung',
    bieuTuong: '🏹',
    huongDan: 'Kéo dây cung về phía sau rồi thả tay để bắn bóng bay. Bé nhớ sưu tầm thú bông nhé!',
    moTaDoKho: {
      'de': 'Trúng 8 bóng · bóng to, bay chậm',
      'trung-binh': 'Trúng 12 bóng · bóng nhỏ hơn',
      'kho': 'Trúng 16 bóng · bay nhanh, ngắm ngắn'
    }
  };

  const LOI_TRUOT = ['Suýt trúng rồi, thử lại nhé! 💪', 'Kéo xa hơn hoặc ngắm cao hơn nhé! 🌈', 'Bé bắn lại nào! 😊'];

  /* ---------- Ảnh ---------- */
  const anhDaTai = {};
  function layAnh(id) {
    if (!anhDaTai[id]) {
      const a = new Image();
      a.src = GOC_ANH + id + '.png';
      anhDaTai[id] = a;
    }
    return anhDaTai[id];
  }
  function anhSan(a) { return !!(a && a.complete && a.naturalWidth > 0); }
  THU_BONG.forEach(function (t) { layAnh(t.id); });
  layAnh('gau');

  function ngau(a, b) { return a + Math.random() * (b - a); }
  function kep(x, a, b) { return Math.max(a, Math.min(b, x)); }

  let soPhien = 0; // mỗi lần vào chơi là một phiên; phiên cũ tự dừng

  /* ---------- Vào chơi ---------- */
  function batDau(doKho) {
    const cfg = CAU_HINH_DO_KHO[doKho];
    const phien = ++soPhien;
    const k = document.getElementById('khu-tro-choi');
    DiemSo.datLaiChuoi();

    k.innerHTML =
      '<section class="man-ban-cung">' +
        '<div class="thanh-thong-tin">' +
          '<button type="button" class="nut nut-tron nut-trang nut-nho" id="nut-doi-do-kho" aria-label="Đổi độ khó" title="Đổi độ khó">🎚️</button>' +
          '<span class="o-thong-tin">🎈 Trúng: <b id="so-trung">0</b>/' + cfg.muc + '</span>' +
          '<span class="o-thong-tin">🏹 Đã bắn: <b id="so-ten">0</b></span>' +
          '<span class="o-thong-tin o-suu-tap" aria-label="Thú bông đã sưu tầm">🧸 <span class="dai-suu-tap" id="dai-suu-tap"></span></span>' +
        '</div>' +
        '<p class="huong-dan" id="loi-nhac">Kéo dây cung về phía sau rồi thả tay để bắn nhé! 🏹</p>' +
        '<div class="san-khau" id="san-khau"><canvas id="khung-ve" aria-label="Sân bắn cung"></canvas></div>' +
      '</section>';
    document.body.classList.add('dang-choi-cung');

    const sanKhau = k.querySelector('#san-khau');
    const canvas = k.querySelector('#khung-ve');
    const ctx = canvas.getContext('2d');
    const oTrung = k.querySelector('#so-trung');
    const oTen = k.querySelector('#so-ten');
    const loiNhac = k.querySelector('#loi-nhac');
    const daiSuuTap = k.querySelector('#dai-suu-tap');

    /* ----- Trạng thái ----- */
    let W = 0, H = 0, s = 1, dpr = 1;
    let groundY = 0, bowX = 0, bowY = 0, g = 0, vmax = 0, maxKeoTay = 0, doDaiTen = 0;
    let bong = [], ten = [], hat = [], vat = [];
    const may = [];
    for (let i = 0; i < 4; i++) may.push({ nx: Math.random(), ny: ngau(0.07, 0.36), sc: ngau(0.6, 1.1), toc: ngau(6, 14) });
    const suuTap = {};
    let soTrung = 0, soTen = 0, diemNhan = 0;
    let xong = false, chay = true, keo = null, nap = 0, tSpawn = 0, t = 0, raf = 0, truocDo = 0;
    let mocBuocKeo = 0;

    /* ----- Kích thước ----- */
    function doiCo() {
      const r = sanKhau.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
      const cuW = W, cuH = H, cuS = s;
      W = r.width; H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s = kep(Math.min(W / 900, H / 520), 0.55, 1.6);
      groundY = H * 0.86;
      bowX = kep(W * 0.15, 100 * s, 200 * s);
      bowY = groundY - 56 * s;
      g = H * 1.25;
      vmax = Math.sqrt(g * Math.max(W * 1.1, H * 1.5));
      maxKeoTay = 140 * s;
      doDaiTen = 108 * s;
      if (cuW) { // đổi kích thước giữa chừng (xoay màn hình): co giãn theo
        const rx = W / cuW, ry = H / cuH, rs = s / cuS;
        bong.forEach(function (b) { b.x0 *= rx; b.x = b.x0; b.y *= ry; b.r *= rs; b.vy *= rs; b.bienDo *= rs; });
        ten = []; hat = []; vat = []; keo = null;
      }
    }

    /* ----- Tạo bóng ----- */
    function chonKieu() {
      const p = cfg.tiLe, x = Math.random();
      if (x < p.thu) return 'thu';
      if (x < p.thu + p.thuong) return 'thuong';
      if (x < p.thu + p.thuong + p.tim) return 'tim';
      return 'sao';
    }
    const CO_BONG = { thu: 46, thuong: 38, tim: 40, sao: 34 };

    function taoBong(khoiDau) {
      const kieu = chonKieu();
      const r = CO_BONG[kieu] * s * cfg.co;
      const xMin = Math.max(bowX + 170 * s, W * 0.34) + r;
      const xMax = Math.max(xMin + 10, W - r - 16 * s);
      const yBatDau = khoiDau ? ngau(H * 0.18, groundY - r * 1.2) : groundY + r + 14 * s;
      let x = ngau(xMin, xMax);
      for (let i = 0; i < 14; i++) {
        const thu = ngau(xMin, xMax);
        const va = bong.some(function (o) {
          return !o.chet && Math.abs(o.x0 - thu) < (o.r + r) * 1.05 && Math.abs(o.y - yBatDau) < (o.r + r) * 1.1;
        });
        x = thu;
        if (!va) break;
      }
      let thu = null;
      if (kieu === 'thu') {
        const dangCo = bong.map(function (o) { return o.thu; });
        const kho = THU_BONG.filter(function (q) { return dangCo.indexOf(q.id) < 0; });
        thu = (kho.length ? kho : THU_BONG)[Math.floor(Math.random() * (kho.length ? kho.length : THU_BONG.length))];
      }
      bong.push({
        kieu: kieu, thu: thu ? thu.id : null, tenThu: thu ? thu.ten : '',
        x0: x, x: x, y: yBatDau, r: r,
        vy: cfg.tocDo * s * (kieu === 'sao' ? 1.35 : 1) * ngau(0.85, 1.15),
        bienDo: ngau(8, 22) * s, tanSo: ngau(0.8, 1.6), pha: ngau(0, 6.28), t: 0,
        mau: MAU_BONG[Math.floor(Math.random() * MAU_BONG.length)], chet: false
      });
    }

    /* ----- Hướng kéo dây cung ----- */
    const GOC_MAC_DINH = 42 * Math.PI / 180;
    const GOC_MAX = 88 * Math.PI / 180;
    const GOC_MIN = -8 * Math.PI / 180;

    function tinhKeo() {
      if (!keo) return { a: GOC_MAC_DINH, ratio: 0, dang: false };
      const dx = keo.x0 - keo.x, dy = keo.y0 - keo.y; // bắn ngược hướng kéo
      const len = Math.hypot(dx, dy);
      let a = len < 8 ? GOC_MAC_DINH : Math.atan2(-dy, dx);
      if (a > GOC_MAX) a = GOC_MAX; else if (a < GOC_MIN) a = GOC_MIN;
      return { a: a, ratio: Math.min(1, len / maxKeoTay), dang: true };
    }
    function tocDoBan(ratio) { return vmax * (0.28 + 0.72 * ratio); }

    /* ----- Bắn ----- */
    function ban(a, ratio) {
      const v = tocDoBan(ratio), cx = Math.cos(a), sy = -Math.sin(a);
      ten.push({
        x: bowX + cx * doDaiTen * 0.55, y: bowY + sy * doDaiTen * 0.55,
        vx: cx * v, vy: sy * v, ang: Math.atan2(sy, cx), tinh: false, tCam: 0, mo: 1, het: false
      });
      soTen++;
      oTen.textContent = soTen;
      nap = 0.32;
      AmThanh.phat('banCung');
    }

    /* ----- Trúng / trượt ----- */
    function trongBong(b, px, py) {
      if (b.chet || b.y - b.r > groundY) return false;
      const rx = b.kieu === 'tim' || b.kieu === 'sao' ? b.r * 0.95 : b.r * 0.9;
      const dx = (px - b.x) / (rx * 1.08), dy = (py - b.y) / (b.r * 1.08);
      return dx * dx + dy * dy <= 1;
    }

    function diemBayTai(x, y, noiDung) {
      const r = canvas.getBoundingClientRect();
      App.diemBay({ getBoundingClientRect: function () { return { left: r.left + x, top: r.top + y, width: 0 }; } }, noiDung);
    }

    function themVaoSuuTap(b) {
      if (!b.thu || suuTap[b.thu]) return;
      suuTap[b.thu] = b.tenThu;
      const a = document.createElement('img');
      a.className = 'anh-suu-tap';
      a.src = GOC_ANH + b.thu + '.png';
      a.alt = b.tenThu;
      a.title = b.tenThu;
      a.draggable = false;
      daiSuuTap.appendChild(a);
    }

    function noBong(b) {
      b.chet = true;
      soTrung++;
      oTrung.textContent = soTrung;
      const kq = DiemSo.traLoiDung();
      let them = kq.diem + kq.thuong;
      let loi = App.chon(TroChoiChung.LOI_KHEN);
      if (b.kieu === 'sao') {
        DiemSo.themDiem(10);
        them += 10;
        AmThanh.phat('bongVang');
        loi = '⭐ Bóng sao vàng! Thưởng thêm +10 điểm';
      } else {
        AmThanh.phat('noBong');
        if (b.thu) loi = 'Bé bắn được ' + b.tenThu + '! 🧸';
        if (b.kieu === 'tim') loi = 'Trái tim xinh quá! 💖';
      }
      if (kq.thuong) loi = '🔥 ' + kq.chuoi + ' quả liên tiếp! Thưởng +' + kq.thuong + ' điểm';
      diemNhan += them;
      loiNhac.textContent = loi;
      diemBayTai(b.x, b.y - b.r, '+' + them);
      themVaoSuuTap(b);

      // Hiệu ứng nổ
      const mauHat = b.kieu === 'sao' ? ['#ffd43b', '#fff3bf', '#f59f00'] : [b.mau[0], b.mau[1], '#ffffff'];
      for (let i = 0; i < 18; i++) {
        const goc = (i / 18) * Math.PI * 2 + ngau(-0.2, 0.2), toc = ngau(120, 320) * s;
        hat.push({
          x: b.x, y: b.y, vx: Math.cos(goc) * toc, vy: Math.sin(goc) * toc - 90 * s,
          r: ngau(3, 7) * s, c: mauHat[i % 3], t: 0, song: ngau(0.6, 1.1), vuong: i % 3 === 0, rot: ngau(0, 6.28)
        });
      }
      vat.push({ loai: 'vong', x: b.x, y: b.y, r: b.r * 0.7, t: 0, song: 0.35, c: b.kieu === 'sao' ? '#ffd43b' : b.mau[0] });
      if (b.thu) {
        vat.push({
          loai: 'thu', id: b.thu, x: b.x, y: b.y, vx: ngau(-90, 90) * s, vy: -260 * s,
          rot: 0, vr: ngau(-3, 3), t: 0, song: 1.5, co: b.r * 1.5
        });
      }
      if (soTrung >= cfg.muc && !xong) {
        xong = true;
        keo = null;
        canvas.classList.remove('dang-keo');
        setTimeout(ketThucLuot, 1100);
      }
    }

    function truot() {
      if (xong) return;
      DiemSo.traLoiSai();
      loiNhac.textContent = App.chon(LOI_TRUOT);
      AmThanh.phat('truot');
    }

    function kiemTraTrung(a) {
      if (xong) return false; // đã đủ số bóng: mũi tên còn bay chỉ để trang trí
      const cx = Math.cos(a.ang), sy = Math.sin(a.ang);
      const diem = [[a.x, a.y], [a.x - cx * doDaiTen * 0.3, a.y - sy * doDaiTen * 0.3]];
      for (let i = 0; i < bong.length; i++) {
        const b = bong[i];
        if (b.chet) continue;
        for (let j = 0; j < diem.length; j++) {
          if (trongBong(b, diem[j][0], diem[j][1])) { noBong(b); return true; }
        }
      }
      return false;
    }

    /* ----- Cập nhật ----- */
    function capNhat(dt) {
      t += dt;
      if (nap > 0) nap -= dt;

      // mây trôi
      may.forEach(function (m) { m.nx += m.toc * dt / Math.max(W, 1); if (m.nx > 1.2) m.nx = -0.2; });

      // bóng bay lên
      bong.forEach(function (b) {
        b.t += dt;
        b.y -= b.vy * dt;
        b.x = b.x0 + Math.sin(b.t * b.tanSo + b.pha) * b.bienDo;
      });
      bong = bong.filter(function (b) { return !b.chet && b.y + b.r + 70 * s > 0; });
      tSpawn -= dt;
      if (!xong && bong.length < cfg.soBong && tSpawn <= 0) {
        taoBong(false);
        tSpawn = ngau(0.5, 1.1);
      }

      // mũi tên
      const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
      ten.forEach(function (a) {
        if (a.tinh) {
          a.tCam += dt;
          a.mo = a.tCam > 1.4 ? Math.max(0, 1 - (a.tCam - 1.4) / 0.5) : 1;
          return;
        }
        for (let i = 0; i < n && !a.het; i++) {
          a.vy += g * h;
          a.x += a.vx * h;
          a.y += a.vy * h;
          a.ang = Math.atan2(a.vy, a.vx);
          if (kiemTraTrung(a)) { a.het = true; break; }
          if (a.y >= groundY + 4 * s && a.vy > 0) { a.tinh = true; a.tCam = 0; truot(); break; }
          if (a.x > W + 120 * s || a.x < -160 * s) { a.het = true; truot(); break; }
        }
      });
      ten = ten.filter(function (a) { return !a.het && !(a.tinh && a.tCam > 1.95); });

      // hạt nổ, vật rơi
      hat.forEach(function (p) { p.t += dt; p.vy += 900 * s * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 6; });
      hat = hat.filter(function (p) { return p.t < p.song; });
      vat.forEach(function (o) {
        o.t += dt;
        if (o.loai === 'thu') { o.vy += 800 * s * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.rot += o.vr * dt; }
      });
      vat = vat.filter(function (o) { return o.t < o.song; });
    }

    /* ----- Vẽ ----- */
    function veAnh(a, cx, cy, hop, hopCao) {
      if (!anhSan(a)) return;
      const tiLe = Math.min(hop / a.naturalWidth, (hopCao || hop) / a.naturalHeight);
      const w = a.naturalWidth * tiLe, hh = a.naturalHeight * tiLe;
      ctx.drawImage(a, cx - w / 2, cy - hh / 2, w, hh);
    }

    function veMay(m) {
      const x = m.nx * W, y = m.ny * H, u = 22 * m.sc * s;
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      ctx.beginPath();
      ctx.arc(x, y, u, 0, 6.29);
      ctx.arc(x + u * 1.1, y - u * 0.7, u * 1.15, 0, 6.29);
      ctx.arc(x + u * 2.3, y - u * 0.2, u * 0.95, 0, 6.29);
      ctx.arc(x + u * 3.2, y + u * 0.15, u * 0.7, 0, 6.29);
      ctx.rect(x, y, u * 3.2, u * 0.85);
      ctx.fill();
    }

    function veDoi(mau, y0, bienDo, tanSo, pha) {
      ctx.fillStyle = mau;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W + 12; x += 12) ctx.lineTo(x, y0 - bienDo * Math.sin(x / W * tanSo + pha));
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    }

    function veNen() {
      const gr = ctx.createLinearGradient(0, 0, 0, groundY);
      gr.addColorStop(0, '#7cc8ff');
      gr.addColorStop(1, '#e4f6ff');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, H);
      // mặt trời
      const sx = W * 0.9, sy = H * 0.15, sr = 34 * s;
      ctx.fillStyle = 'rgba(255,210,63,.14)'; ctx.beginPath(); ctx.arc(sx, sy, sr + 34 * s, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(255,210,63,.26)'; ctx.beginPath(); ctx.arc(sx, sy, sr + 16 * s, 0, 6.29); ctx.fill();
      const gs = ctx.createRadialGradient(sx - sr * 0.2, sy - sr * 0.2, sr * 0.1, sx, sy, sr);
      gs.addColorStop(0, '#fff4a8'); gs.addColorStop(1, '#ffd23f');
      ctx.fillStyle = gs; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.29); ctx.fill();
      may.forEach(veMay);
      veDoi('#4caf3a', groundY - 16 * s, 24 * s, 5.2, 1.0);
    }

    function veDoiTruoc() { veDoi('#6fcf5a', groundY + 8 * s, 8 * s, 9, 0.4); }

    /* --- các hình bóng --- */
    function duongBong(rx, ry) {
      ctx.beginPath();
      ctx.moveTo(0, ry);
      ctx.bezierCurveTo(-rx * 0.35, ry * 0.92, -rx * 1.05, ry * 0.35, -rx * 1.02, -ry * 0.15);
      ctx.bezierCurveTo(-rx * 1.0, -ry * 0.78, -rx * 0.45, -ry, 0, -ry);
      ctx.bezierCurveTo(rx * 0.45, -ry, rx * 1.0, -ry * 0.78, rx * 1.02, -ry * 0.15);
      ctx.bezierCurveTo(rx * 1.05, ry * 0.35, rx * 0.35, ry * 0.92, 0, ry);
      ctx.closePath();
    }
    function duongTim(r) {
      ctx.beginPath();
      ctx.moveTo(0, r * 0.98);
      ctx.bezierCurveTo(-r * 1.55, -r * 0.05, -r * 0.95, -r * 1.12, 0, -r * 0.4);
      ctx.bezierCurveTo(r * 0.95, -r * 1.12, r * 1.55, -r * 0.05, 0, r * 0.98);
      ctx.closePath();
    }
    function duongSao(R) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const goc = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * 0.52 : R;
        const px = Math.cos(goc) * rr, py = Math.sin(goc) * rr;
        if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.closePath();
    }

    function veBong(b) {
      const r = b.r, rx = r * 0.86;
      ctx.save();
      ctx.translate(b.x, b.y);
      // điểm buộc dây (đáy bóng)
      const yDay = b.kieu === 'sao' ? r * 0.5 : (b.kieu === 'tim' ? r * 0.98 : r);
      const lac = Math.sin(t * 3 + b.pha);
      ctx.strokeStyle = 'rgba(43,35,80,.42)';
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.moveTo(0, yDay);
      ctx.bezierCurveTo(8 * s * lac, yDay + 20 * s, -8 * s * lac, yDay + 40 * s, 3 * s * Math.sin(t * 2 + b.pha), yDay + 64 * s);
      ctx.stroke();

      if (b.kieu === 'sao') {
        ctx.rotate(Math.sin(t * 2 + b.pha) * 0.14);
        const R = r * 1.08;
        const gr = ctx.createRadialGradient(-R * 0.25, -R * 0.3, R * 0.1, 0, 0, R);
        gr.addColorStop(0, '#fff3a3'); gr.addColorStop(0.6, '#ffd43b'); gr.addColorStop(1, '#f59f00');
        ctx.fillStyle = gr; ctx.strokeStyle = '#f59f00'; ctx.lineWidth = 5 * s; ctx.lineJoin = 'round';
        duongSao(R); ctx.stroke(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.65)';
        ctx.beginPath(); ctx.ellipse(-R * 0.22, -R * 0.28, R * 0.1, R * 0.2, -0.5, 0, 6.29); ctx.fill();
      } else if (b.kieu === 'tim') {
        const gr = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.3);
        gr.addColorStop(0, '#ffb3c6'); gr.addColorStop(0.55, '#ff5d8f'); gr.addColorStop(1, '#d6336c');
        ctx.fillStyle = gr; duongTim(r); ctx.fill();
        ctx.fillStyle = '#d6336c';
        ctx.beginPath(); ctx.moveTo(0, r * 0.96); ctx.lineTo(-5 * s, r * 0.96 + 8 * s); ctx.lineTo(5 * s, r * 0.96 + 8 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        ctx.beginPath(); ctx.ellipse(-r * 0.55, -r * 0.45, r * 0.13, r * 0.24, -0.7, 0, 6.29); ctx.fill();
      } else {
        const gr = ctx.createRadialGradient(-rx * 0.3, -r * 0.35, r * 0.1, 0, 0, r * 1.2);
        gr.addColorStop(0, b.mau[0]); gr.addColorStop(1, b.mau[1]);
        ctx.fillStyle = gr; duongBong(rx, r); ctx.fill();
        ctx.fillStyle = b.mau[1];
        ctx.beginPath(); ctx.moveTo(0, r - 1 * s); ctx.lineTo(-5 * s, r + 8 * s); ctx.lineTo(5 * s, r + 8 * s); ctx.closePath(); ctx.fill();
        if (b.thu) {
          ctx.fillStyle = 'rgba(255,255,255,.93)';
          ctx.beginPath(); ctx.ellipse(0, -r * 0.05, rx * 0.76, r * 0.74, 0, 0, 6.29); ctx.fill();
          veAnh(layAnh(b.thu), 0, -r * 0.04, rx * 1.28, r * 1.24);
        }
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.beginPath(); ctx.ellipse(-rx * 0.62, -r * 0.55, rx * 0.12, r * 0.24, -0.6, 0, 6.29); ctx.fill();
      }
      ctx.restore();
    }

    /* --- mũi tên: mũi ở (0,0), đuôi ở (-L,0) --- */
    function veThanTen(L) {
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#8b5a2b';
      ctx.lineWidth = 3.4 * s;
      ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(-9 * s, 0); ctx.stroke();
      ctx.fillStyle = '#ff5d6c';
      ctx.beginPath(); ctx.moveTo(-L + 20 * s, 0); ctx.lineTo(-L + 2 * s, -8 * s); ctx.lineTo(-L - 5 * s, -8 * s); ctx.lineTo(-L + 8 * s, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4dabf7';
      ctx.beginPath(); ctx.moveTo(-L + 20 * s, 0); ctx.lineTo(-L + 2 * s, 8 * s); ctx.lineTo(-L - 5 * s, 8 * s); ctx.lineTo(-L + 8 * s, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f1f3f5'; ctx.strokeStyle = '#868e96'; ctx.lineWidth = 1.6 * s; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-15 * s, -6.5 * s); ctx.lineTo(-11 * s, 0); ctx.lineTo(-15 * s, 6.5 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    function veTenBay(a) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.ang);
      ctx.globalAlpha = a.mo;
      veThanTen(doDaiTen);
      ctx.restore();
    }

    /* --- gấu cung thủ + cây cung --- */
    function veGauCungThu() {
      const gau = layAnh('gau');
      const cao = 132 * s;
      if (anhSan(gau)) {
        const w = gau.naturalWidth * cao / gau.naturalHeight;
        ctx.drawImage(gau, bowX - 58 * s - w / 2, groundY + 22 * s - cao, w, cao);
      }
    }

    function veCung(tk) {
      const R = 58 * s, bung = R * 0.9;
      const keoVe = tk.ratio * 70 * s;
      ctx.save();
      ctx.translate(bowX, bowY);
      ctx.rotate(-tk.a);
      // dây cung
      ctx.strokeStyle = '#fffbe6';
      ctx.lineWidth = 2.4 * s;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, -R); ctx.lineTo(-keoVe, 0); ctx.lineTo(0, R); ctx.stroke();
      // thân cung
      ctx.strokeStyle = '#7a4a21'; ctx.lineWidth = 8 * s;
      ctx.beginPath(); ctx.moveTo(0, -R); ctx.quadraticCurveTo(bung, 0, 0, R); ctx.stroke();
      ctx.strokeStyle = '#d19a5c'; ctx.lineWidth = 3 * s;
      ctx.beginPath(); ctx.moveTo(0, -R); ctx.quadraticCurveTo(bung, 0, 0, R); ctx.stroke();
      ctx.fillStyle = '#e5484d';
      ctx.fillRect(bung / 2 - 4.5 * s, -10 * s, 9 * s, 20 * s);
      // mũi tên đã lắp sẵn
      if (nap <= 0) {
        ctx.save();
        ctx.translate(-keoVe + doDaiTen, 0);
        veThanTen(doDaiTen);
        ctx.restore();
      }
      ctx.restore();
    }

    function veDuongNgam(tk) {
      const so = Math.max(3, Math.round(20 * cfg.duongNgam));
      const v = tocDoBan(tk.ratio), cx = Math.cos(tk.a), sy = -Math.sin(tk.a);
      const x0 = bowX + cx * doDaiTen * 0.55, y0 = bowY + sy * doDaiTen * 0.55;
      const vx = cx * v, vy = sy * v;
      // Chấm ngắm nhiều màu cầu vồng, có viền trắng + viền xanh đậm nên nổi bật trên cả trời lẫn cỏ
      const MAU_NGAM = ['#ff3b5c', '#ff8a00', '#ffd000', '#22c55e', '#2f80ff', '#a855f7'];
      for (let i = 1; i <= so; i++) {
        const tt = i * 0.055;
        const px = x0 + vx * tt, py = y0 + vy * tt + 0.5 * g * tt * tt;
        if (py > groundY || px > W + 20) break;
        const f = 1 - (i - 1) / (so + 4);          // nhỏ dần về phía xa, nhưng vẫn rõ
        const r = (9.5 * f + 3.5) * s;
        ctx.globalAlpha = 0.6 + 0.4 * f;           // không bao giờ mờ hơn 60%
        ctx.fillStyle = '#1f2a6b';                 // viền ngoài xanh đậm
        ctx.beginPath(); ctx.arc(px, py, r + 3.6 * s, 0, 6.29); ctx.fill();
        ctx.fillStyle = '#ffffff';                 // viền trong trắng
        ctx.beginPath(); ctx.arc(px, py, r + 1.8 * s, 0, 6.29); ctx.fill();
        ctx.fillStyle = MAU_NGAM[(i - 1) % MAU_NGAM.length];
        ctx.beginPath(); ctx.arc(px, py, r, 0, 6.29); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function veGoiY() {
      if (soTen > 0 || keo || xong) return;
      const pha = (t % 2.6) / 2.6, e = pha < 0.7 ? pha / 0.7 : 1;
      const px = bowX + 70 * s, py = bowY - 78 * s;
      const qx = px - 90 * s * e, qy = py + 60 * s * e;
      ctx.save();
      ctx.globalAlpha = pha < 0.85 ? 1 : 1 - (pha - 0.85) / 0.15;
      ctx.setLineDash([7 * s, 8 * s]);
      ctx.strokeStyle = 'rgba(43,35,80,.55)'; ctx.lineWidth = 3 * s;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = Math.round(40 * s) + 'px ' + FONT_EMOJI;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('👆', qx, qy + 16 * s);
      ctx.restore();
    }

    function veHatVaVat() {
      hat.forEach(function (p) {
        const con = 1 - p.t / p.song;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, con * 1.6));
        ctx.fillStyle = p.c;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.vuong) ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
        else { ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 6.29); ctx.fill(); }
        ctx.restore();
      });
      vat.forEach(function (o) {
        const con = 1 - o.t / o.song;
        if (o.loai === 'vong') {
          const e = o.t / o.song;
          ctx.save();
          ctx.globalAlpha = 1 - e;
          ctx.strokeStyle = o.c; ctx.lineWidth = (7 - 5 * e) * s;
          ctx.beginPath(); ctx.arc(o.x, o.y, o.r * (1 + e * 1.4), 0, 6.29); ctx.stroke();
          ctx.restore();
        } else {
          ctx.save();
          ctx.globalAlpha = con < 0.3 ? con / 0.3 : 1;
          ctx.translate(o.x, o.y);
          ctx.rotate(o.rot);
          veAnh(layAnh(o.id), 0, 0, o.co);
          ctx.restore();
        }
      });
    }

    function ve() {
      const tk = tinhKeo();
      ctx.clearRect(0, 0, W, H);
      veNen();
      bong.forEach(veBong);
      veDoiTruoc();
      veGauCungThu();
      ten.forEach(veTenBay);
      veCung(tk);
      if (tk.dang && tk.ratio > 0.05) veDuongNgam(tk);
      veHatVaVat();
      veGoiY();
    }

    /* ----- Vòng lặp ----- */
    function vong(now) {
      if (!chay || phien !== soPhien) return;
      const dt = truocDo ? Math.min(0.05, (now - truocDo) / 1000) : 0.016;
      truocDo = now;
      capNhat(dt);
      ve();
      raf = requestAnimationFrame(vong);
    }

    function dung() {
      chay = false;
      cancelAnimationFrame(raf);
      if (quanSat) quanSat.disconnect();
    }

    /* ----- Điều khiển: kéo rồi thả ----- */
    function toaDo(e) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    canvas.addEventListener('pointerdown', function (e) {
      if (xong || keo || nap > 0) return;
      const p = toaDo(e);
      keo = { id: e.pointerId, x0: p.x, y0: p.y, x: p.x, y: p.y };
      mocBuocKeo = 0;
      try { canvas.setPointerCapture(e.pointerId); } catch (loi) { /* bỏ qua */ }
      canvas.classList.add('dang-keo');
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!keo || e.pointerId !== keo.id) return;
      const p = toaDo(e);
      keo.x = p.x; keo.y = p.y;
      const buoc = Math.floor(tinhKeo().ratio * 4);
      if (buoc > mocBuocKeo) AmThanh.phat('keoCung', buoc / 4);
      mocBuocKeo = buoc;
      e.preventDefault();
    });
    function tha(e) {
      if (!keo || e.pointerId !== keo.id) return;
      const tk = tinhKeo();
      keo = null;
      canvas.classList.remove('dang-keo');
      if (e.type === 'pointercancel') return;
      if (tk.ratio < 0.12) {
        loiNhac.textContent = 'Kéo dây cung xa hơn chút nữa nhé! 🏹';
        return;
      }
      ban(tk.a, tk.ratio);
    }
    canvas.addEventListener('pointerup', tha);
    canvas.addEventListener('pointercancel', tha);
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    k.querySelector('#nut-doi-do-kho').addEventListener('click', function () {
      AmThanh.phat('nhan');
      dung();
      moDau();
    });

    /* ----- Kết thúc lượt chơi ----- */
    function ketThucLuot() {
      if (phien !== soPhien) return;
      dung();
      document.body.classList.remove('dang-choi-cung');
      const tenThu = Object.keys(suuTap).map(function (id) { return suuTap[id]; });
      TroChoiChung.ketThuc(CAU_HINH, {
        doKho: doKho,
        diemNhan: diemNhan,
        danhGia: Math.min(1, (cfg.muc * 1.5) / Math.max(1, soTen)),
        thongDiep: 'Bé bắn trúng <b>' + soTrung + '</b> quả bóng bằng <b>' + soTen + '</b> mũi tên!',
        thongDiepPhu: tenThu.length ? '🧸 Bé sưu tầm được <b>' + tenThu.length + '</b> bạn thú bông: ' + tenThu.join(', ') + '.' : ''
      }, {
        choiLai: function () { batDau(doKho); },
        doiDoKho: moDau
      });
    }

    /* ----- Chạy ----- */
    doiCo();
    for (let i = 0; i < cfg.soBong; i++) taoBong(true);
    let quanSat = null;
    if (window.ResizeObserver) {
      quanSat = new ResizeObserver(doiCo);
      quanSat.observe(sanKhau);
    }
    raf = requestAnimationFrame(vong);
  }

  function moDau() {
    document.body.classList.remove('dang-choi-cung');
    TroChoiChung.chonDoKho(CAU_HINH, batDau);
  }

  TroChoiChung.khoiDongTrang(moDau);
})();
