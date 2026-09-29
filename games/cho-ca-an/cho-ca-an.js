/* =========================================================
   TRÒ CHƠI: CHO CÁ ĂN
   Bé chọn món ăn ở khay phía dưới, rồi chạm vào nước để thả.
   Mỗi bạn cá đang đói có một bong bóng ghi món mình thích
   và số chấm = số viên cần ăn. Cá ăn đủ thì no bụng.
   Không bao giờ trừ điểm: thả hụt chỉ làm mất chuỗi thưởng.
   ========================================================= */
(function () {
  'use strict';

  const GOC_ANH = '../../assets/images/';
  const FONT_EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  // Các bạn cá. huong: -1 nếu ảnh gốc quay đầu sang trái, 1 nếu quay sang phải.
  // Muốn thêm: chép ảnh vào assets/images/ rồi thêm một dòng { id, ten, huong, rong }.
  const LOAI_CA = [
    { id: 'ca-he', ten: 'cá hề', huong: -1, rong: 118 },
    { id: 'ca-hoi', ten: 'cá hồi', huong: -1, rong: 128 },
    { id: 'ca', ten: 'cá ngừ', huong: -1, rong: 128 },
    { id: 'ca-map', ten: 'cá mập con', huong: -1, rong: 128 },
    { id: 'ca-duoi', ten: 'cá đuối', huong: -1, rong: 118 },
    { id: 'rua-bien', ten: 'rùa biển', huong: 1, rong: 120 }
  ];

  // Món ăn. bt = biểu tượng vẽ trên canvas và trên nút.
  const MON_AN = [
    { id: 'tom', bt: '🦐', ten: 'Tôm' },
    { id: 'rau', bt: '🥬', ten: 'Rau' },
    { id: 'banh', bt: '🍞', ten: 'Bánh mì' }
  ];

  const CAU_HINH_DO_KHO = {
    // soCa: số bạn cá | can: số viên mỗi bạn cần | soMon: số món khác nhau | toc: tốc độ bơi
    'de': { soCa: 3, can: 2, soMon: 1, toc: 62 },
    'trung-binh': { soCa: 4, can: 3, soMon: 2, toc: 88 },
    'kho': { soCa: 5, can: 3, soMon: 3, toc: 118 }
  };

  const CAU_HINH = {
    id: 'cho-ca-an',
    ten: 'Cho cá ăn',
    bieuTuong: '🐠',
    huongDan: 'Chọn món ăn rồi chạm vào nước để thả. Bé xem bong bóng của mỗi bạn cá để biết bạn ấy thích món gì nhé!',
    moTaDoKho: {
      'de': '3 bạn cá · 1 món ăn · bơi chậm',
      'trung-binh': '4 bạn cá · 2 món ăn',
      'kho': '5 bạn cá · 3 món ăn · bơi nhanh'
    }
  };

  const LOI_NGON = ['Ngon quá! 😋', 'Cá thích lắm! 🐟', 'Nhồm nhoàm! 🍤', 'Cá vui quá! 💙'];

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
  LOAI_CA.forEach(function (l) { layAnh(l.id); });
  layAnh('cua'); layAnh('sao-bien');

  function ngau(a, b) { return a + Math.random() * (b - a); }
  function kep(x, a, b) { return Math.max(a, Math.min(b, x)); }

  let soPhien = 0; // mỗi lần vào chơi là một phiên; phiên cũ tự dừng

  /* ---------- Vào chơi ---------- */
  function batDau(doKho) {
    const cfg = CAU_HINH_DO_KHO[doKho];
    const phien = ++soPhien;
    const k = document.getElementById('khu-tro-choi');
    DiemSo.datLaiChuoi();

    // Chọn món ăn cho ván này, gán mỗi bạn cá một món (mỗi món có ít nhất một bạn)
    const monVan = App.layNhieu(MON_AN, cfg.soMon);

    k.innerHTML =
      '<section class="man-cho-ca">' +
        '<div class="thanh-thong-tin">' +
          '<button type="button" class="nut nut-tron nut-trang nut-nho" id="nut-doi-do-kho" aria-label="Đổi độ khó" title="Đổi độ khó">🎚️</button>' +
          '<span class="o-thong-tin">😋 Cá no: <b id="so-no">0</b>/' + cfg.soCa + '</span>' +
          '<span class="o-thong-tin">🍤 Đã thả: <b id="so-vien">0</b></span>' +
        '</div>' +
        '<p class="huong-dan" id="loi-nhac">Chọn món ăn rồi chạm vào nước để cho cá ăn nhé! 🐠</p>' +
        '<div class="san-khau-ca" id="san-khau"><canvas id="khung-ve" aria-label="Bể cá"></canvas></div>' +
        '<div class="khay-mon-an" id="khay-mon-an">' +
          monVan.map(function (m) {
            return '<button type="button" class="nut-mon" data-mon="' + m.id + '" aria-label="' + m.ten + '">' +
              '<span class="mon-bt" aria-hidden="true">' + m.bt + '</span><span>' + m.ten + '</span><span class="mon-so"></span></button>';
          }).join('') +
        '</div>' +
      '</section>';
    document.body.classList.add('dang-choi-ca');

    const sanKhau = k.querySelector('#san-khau');
    const canvas = k.querySelector('#khung-ve');
    const ctx = canvas.getContext('2d');
    const oNo = k.querySelector('#so-no');
    const oVien = k.querySelector('#so-vien');
    const loiNhac = k.querySelector('#loi-nhac');
    const khay = k.querySelector('#khay-mon-an');

    /* ----- Trạng thái ----- */
    let W = 0, H = 0, s = 1, dpr = 1, dayY = 0;
    let ca = [], moi = [], hat = [], bot = [];
    let monChon = monVan[0].id;
    let soNo = 0, soVien = 0, diemNhan = 0;
    let xong = false, chay = true, t = 0, raf = 0, truocDo = 0, quanSat = null;
    const rong = [];
    for (let i = 0; i < 9; i++) rong.push({ nx: (i + 0.5) / 9 + ngau(-0.03, 0.03), cao: ngau(50, 120), pha: ngau(0, 6.28), sang: Math.random() < 0.5 });

    function monTheoId(id) { return MON_AN.filter(function (m) { return m.id === id; })[0]; }

    /* ----- Kích thước ----- */
    function doiCo() {
      const r = sanKhau.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
      const cuW = W, cuH = H;
      W = r.width; H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s = kep(Math.min(W / 900, H / 520), 0.55, 1.6);
      dayY = H * 0.88;
      if (cuW) {
        const rx = W / cuW, ry = H / cuH;
        ca.forEach(function (c) { c.x *= rx; c.y *= ry; c.tx *= rx; c.ty *= ry; });
        moi.forEach(function (m) { m.x *= rx; m.y *= ry; });
      }
    }

    /* ----- Tạo cá ----- */
    function taoCa() {
      const loai = App.layNhieu(LOAI_CA, cfg.soCa);
      const mon = [];
      for (let i = 0; i < cfg.soCa; i++) mon.push(monVan[i % monVan.length].id);
      App.tron(mon).forEach(function (m, i) {
        const l = loai[i];
        ca.push({
          loai: l, mon: m, an: 0, can: cfg.can, no: false,
          x: W * (i + ngau(0.25, 0.75)) / cfg.soCa, y: ngau(H * 0.2, dayY - 90 * s),
          tx: 0, ty: 0, doiDich: 0, dir: Math.random() < 0.5 ? -1 : 1, sx: 1,
          toc: cfg.toc * ngau(0.9, 1.1), pha: ngau(0, 6.28), mieng: 0, w: 0, h: 0
        });
        ca[ca.length - 1].sx = ca[ca.length - 1].dir;
      });
    }

    /* ----- Thả mồi ----- */
    function thaMoi(x, y) {
      if (xong) return;
      const m = monTheoId(monChon);
      soVien++;
      oVien.textContent = soVien;
      const conDoi = ca.some(function (c) { return !c.no && c.mon === m.id; });
      moi.push({ x: x, y: y, mon: m.id, bt: m.bt, pha: ngau(0, 6.28), x0: x, t: 0, an: false, chim: false, mo: 1 });
      AmThanh.phat('thaMoi');
      for (let i = 0; i < 4; i++) hat.push({ loai: 'bot', x: x + ngau(-8, 8) * s, y: y, vx: ngau(-15, 15), vy: ngau(-60, -25), r: ngau(2, 4.5) * s, t: 0, song: ngau(0.5, 0.9) });
      loiNhac.textContent = conDoi ? 'Cá đang bơi tới ăn nè! 🐟' : 'Chưa bạn cá nào đói món ' + m.ten.toLowerCase() + ' nhé, bé chọn món khác đi! 👉';
    }

    function diemBayTai(x, y, noiDung) {
      const r = canvas.getBoundingClientRect();
      App.diemBay({ getBoundingClientRect: function () { return { left: r.left + x, top: r.top + y, width: 0 }; } }, noiDung);
    }

    /* ----- Khay thức ăn ----- */
    function conDoiMon(id) { return ca.filter(function (c) { return !c.no && c.mon === id; }).length; }
    function capNhatKhay() {
      khay.querySelectorAll('.nut-mon').forEach(function (nut) {
        const id = nut.getAttribute('data-mon'), so = conDoiMon(id);
        nut.classList.toggle('chon', id === monChon);
        nut.classList.toggle('het', so === 0);
        nut.querySelector('.mon-so').textContent = so;
      });
    }
    khay.querySelectorAll('.nut-mon').forEach(function (nut) {
      nut.addEventListener('click', function () {
        AmThanh.phat('nhan');
        monChon = nut.getAttribute('data-mon');
        capNhatKhay();
      });
    });

    /* ----- Cá ăn mồi ----- */
    function anMoi(c, m) {
      m.an = true;
      c.an++;
      c.mieng = 0.28;
      const kq = DiemSo.traLoiDung();
      let them = kq.diem + kq.thuong;
      AmThanh.phat('anMoi');
      let loi = App.chon(LOI_NGON);
      if (kq.thuong) loi = '🔥 ' + kq.chuoi + ' viên liên tiếp! Thưởng +' + kq.thuong + ' điểm';
      for (let i = 0; i < 3; i++) hat.push({ loai: 'tim', x: c.x + c.dir * c.w * 0.3, y: c.y - c.h * 0.3, vx: ngau(-30, 30) * s, vy: ngau(-90, -50) * s, r: ngau(14, 20) * s, t: 0, song: ngau(0.7, 1.1) });
      if (c.an >= c.can) {
        c.no = true;
        soNo++;
        oNo.textContent = soNo;
        DiemSo.themDiem(10);
        them += 10;
        AmThanh.phat('bongVang');
        loi = 'Bạn ' + c.loai.ten + ' no bụng rồi! 😋 Thưởng +10 điểm';
        for (let i = 0; i < 14; i++) {
          const goc = (i / 14) * Math.PI * 2;
          hat.push({ loai: 'sao', x: c.x, y: c.y, vx: Math.cos(goc) * ngau(80, 200) * s, vy: Math.sin(goc) * ngau(80, 200) * s - 40 * s, r: ngau(8, 14) * s, t: 0, song: ngau(0.7, 1.2) });
        }
        if (soNo >= cfg.soCa && !xong) {
          xong = true;
          loi = '🎉 Cả bể cá no bụng rồi!';
          setTimeout(ketThucLuot, 1300);
        }
      }
      diemNhan += them;
      loiNhac.textContent = loi;
      diemBayTai(c.x, c.y - c.h * 0.6, '+' + them);
      // nếu món đang chọn đã hết bạn đói thì tự chuyển sang món còn cá đói
      if (conDoiMon(monChon) === 0) {
        const con = monVan.filter(function (q) { return conDoiMon(q.id) > 0; })[0];
        if (con) monChon = con.id;
      }
      capNhatKhay();
    }

    function moiHut(m) {
      DiemSo.traLoiSai(); // chỉ mất chuỗi thưởng, không trừ điểm
      if (!xong) loiNhac.textContent = App.chon(['Thả gần bạn cá hơn nhé! 🐟', 'Mồi chìm mất rồi, bé thả lại nào! 😊', 'Bé nhìn bong bóng của cá để chọn đúng món nhé! 💭']);
    }

    /* ----- Cập nhật ----- */
    function timMoi(c) {
      let tot = null, xa = 1e9;
      moi.forEach(function (m) {
        if (m.an || m.chim || m.mon !== c.mon) return;
        const d = Math.hypot(m.x - c.x, m.y - c.y);
        if (d < xa) { xa = d; tot = m; }
      });
      return tot;
    }

    function capNhat(dt) {
      t += dt;

      // mồi chìm dần
      moi.forEach(function (m) {
        m.t += dt;
        if (m.chim) { m.mo -= dt / 0.6; return; }
        m.y += 52 * s * dt;
        m.x = m.x0 + Math.sin(m.t * 2.2 + m.pha) * 7 * s;
        if (m.y >= dayY - 6 * s) { m.chim = true; m.y = dayY - 6 * s; moiHut(m); }
      });
      moi = moi.filter(function (m) { return !m.an && m.mo > 0; });

      // cá bơi / đuổi theo mồi
      ca.forEach(function (c) {
        const anh = layAnh(c.loai.id);
        c.w = c.loai.rong * s * 1.12;
        c.h = anhSan(anh) ? c.w * anh.naturalHeight / anh.naturalWidth : c.w * 0.65;
        if (c.mieng > 0) c.mieng -= dt;
        const dich = c.no ? null : timMoi(c);
        let dx, dy, v;
        if (dich) {
          dx = dich.x - c.x; dy = dich.y - c.y; v = c.toc * 1.6 * s;
          if (Math.abs(dx) < c.w * 0.4 && Math.abs(dy) < c.h * 0.42) { anMoi(c, dich); return; }
        } else {
          c.doiDich -= dt;
          if (c.doiDich <= 0 || Math.hypot(c.tx - c.x, c.ty - c.y) < 12 * s) {
            c.tx = ngau(c.w * 0.6, W - c.w * 0.6);
            c.ty = ngau(H * 0.14, dayY - c.h * 0.8 - 20 * s);
            c.doiDich = ngau(2.5, 5);
          }
          dx = c.tx - c.x; dy = c.ty - c.y; v = c.toc * 0.55 * s;
        }
        const d = Math.hypot(dx, dy) || 1;
        c.x += dx / d * Math.min(v * dt, d);
        c.y += dy / d * Math.min(v * 0.7 * dt, d);
        c.x = kep(c.x, c.w * 0.4, W - c.w * 0.4);
        c.y = kep(c.y, H * 0.1, dayY - c.h * 0.5 - 6 * s);
        if (Math.abs(dx) > 6 * s) c.dir = dx > 0 ? 1 : -1;
        c.sx += (c.dir - c.sx) * Math.min(1, dt * 9);
      });

      // cá không chồng lên nhau: đẩy nhẹ ra xa nhau
      for (let i = 0; i < ca.length; i++) {
        for (let j = i + 1; j < ca.length; j++) {
          const a = ca[i], b = ca[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const ox = (a.w + b.w) * 0.34 - Math.abs(dx), oy = (a.h + b.h) * 0.45 - Math.abs(dy);
          if (ox > 0 && oy > 0) {
            const day = 70 * s * dt;
            if (oy < ox) { const d = (dy >= 0 ? 1 : -1) * day; a.y -= d; b.y += d; }
            else { const d = (dx >= 0 ? 1 : -1) * day; a.x -= d; b.x += d; }
          }
        }
      }

      // bong bóng nền
      if (Math.random() < dt * 2.2) bot.push({ x: ngau(0, W), y: dayY, r: ngau(2, 6) * s, v: ngau(25, 60) * s, pha: ngau(0, 6.28) });
      bot.forEach(function (b) { b.y -= b.v * dt; b.x += Math.sin(t * 2 + b.pha) * 8 * dt; });
      bot = bot.filter(function (b) { return b.y > -10; });

      // hạt hiệu ứng
      hat.forEach(function (p) {
        p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.loai === 'sao') p.vy += 160 * s * dt;
      });
      hat = hat.filter(function (p) { return p.t < p.song; });
    }

    /* ----- Vẽ ----- */
    function veAnh(a, w, hCao) {
      if (!anhSan(a)) return;
      ctx.drawImage(a, -w / 2, -hCao / 2, w, hCao);
    }
    function emoji(ky, x, y, co) {
      ctx.font = Math.round(co) + 'px ' + FONT_EMOJI;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(ky, x, y);
    }

    function veNen() {
      const gr = ctx.createLinearGradient(0, 0, 0, dayY);
      gr.addColorStop(0, '#8fdcff'); gr.addColorStop(0.55, '#3aa6e8'); gr.addColorStop(1, '#1b6fb5');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, H);
      // tia nắng
      ctx.fillStyle = 'rgba(255,255,255,.09)';
      for (let i = 0; i < 4; i++) {
        const x = W * (0.12 + i * 0.26) + Math.sin(t * 0.4 + i) * 18 * s, r = 34 * s + i * 8 * s;
        ctx.beginPath(); ctx.moveTo(x - r * 0.5, 0); ctx.lineTo(x + r * 0.5, 0); ctx.lineTo(x + r * 2.4, dayY); ctx.lineTo(x - r * 1.4, dayY); ctx.closePath(); ctx.fill();
      }
      // rong biển
      rong.forEach(function (r) {
        const x = r.nx * W, cao = r.cao * s, sw = Math.sin(t * 1.3 + r.pha) * 14 * s;
        ctx.strokeStyle = r.sang ? '#3fbf6b' : '#2a9d55';
        ctx.lineWidth = 9 * s; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, dayY + 6 * s); ctx.quadraticCurveTo(x - sw, dayY - cao * 0.5, x + sw, dayY - cao); ctx.stroke();
      });
      // cát
      ctx.fillStyle = '#f3d9a4';
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W + 12; x += 12) ctx.lineTo(x, dayY - 4 * s * Math.sin(x / W * 7 + 0.6));
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      // sao biển, cua
      const sao = layAnh('sao-bien'), cua = layAnh('cua');
      if (anhSan(sao)) { ctx.drawImage(sao, W * 0.08, dayY - 4 * s, 58 * s, 58 * s); ctx.drawImage(sao, W * 0.86, dayY + 4 * s, 46 * s, 46 * s); }
      if (anhSan(cua)) { const cw = 74 * s, cx = W * (0.5 + 0.3 * Math.sin(t * 0.18)); ctx.drawImage(cua, cx - cw / 2, dayY + 2 * s, cw, cw * cua.naturalHeight / cua.naturalWidth); }
    }

    function veBongBong(x, y, r) {
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.strokeStyle = 'rgba(43,35,80,.35)'; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 5 * s, y + r - 1); ctx.lineTo(x, y + r + 8 * s); ctx.lineTo(x + 5 * s, y + r - 1); ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fill();
    }

    function veCa(c) {
      const bob = Math.sin(t * 2.4 + c.pha) * 4 * s;
      const pop = c.mieng > 0 ? 1 + 0.14 * Math.sin(c.mieng / 0.28 * Math.PI) : 1;
      ctx.save();
      ctx.translate(c.x, c.y + bob);
      ctx.rotate(Math.sin(t * 3 + c.pha) * 0.05 * c.sx);
      ctx.scale(c.sx * c.loai.huong * pop, pop);
      const anh = layAnh(c.loai.id);
      if (c.no) { ctx.shadowColor = 'rgba(255,220,80,.95)'; ctx.shadowBlur = 22 * s; }
      veAnh(anh, c.w, c.h);
      ctx.restore();

      // bong bóng ý nghĩ phía trên đầu cá
      const bx = c.x, by = c.y + bob - c.h / 2 - 30 * s, br = 23 * s;
      ctx.save();
      if (c.no) {
        veBongBong(bx, by, br * 0.85);
        ctx.fillStyle = '#000'; emoji('😋', bx, by + 1 * s, 26 * s);
      } else {
        veBongBong(bx, by, br);
        ctx.fillStyle = '#000'; emoji(monTheoId(c.mon).bt, bx, by + 1 * s, 28 * s);
        // chấm: mỗi chấm là một viên cần ăn
        const gap = 13 * s, x0 = bx - (c.can - 1) * gap / 2;
        for (let i = 0; i < c.can; i++) {
          ctx.beginPath(); ctx.arc(x0 + i * gap, by + br + 22 * s, 5 * s, 0, 6.29);
          ctx.fillStyle = i < c.an ? '#ffc400' : 'rgba(255,255,255,.75)'; ctx.fill();
          ctx.strokeStyle = 'rgba(43,35,80,.5)'; ctx.lineWidth = 1.5 * s; ctx.stroke();
        }
      }
      ctx.restore();
    }

    function veMoi(m) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, m.mo);
      ctx.translate(m.x, m.y);
      ctx.rotate(Math.sin(m.t * 3 + m.pha) * 0.3);
      ctx.fillStyle = '#000';
      emoji(m.bt, 0, 0, 30 * s);
      ctx.restore();
    }

    function veHat() {
      hat.forEach(function (p) {
        const con = 1 - p.t / p.song;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, con * 1.6));
        if (p.loai === 'bot') {
          ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.6 * s;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.29); ctx.stroke();
        } else {
          ctx.fillStyle = '#000';
          emoji(p.loai === 'tim' ? '💗' : '⭐', p.x, p.y, p.r * 2);
        }
        ctx.restore();
      });
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5 * s;
      bot.forEach(function (b) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.29); ctx.stroke(); });
    }

    function veGoiY() {
      if (soVien > 0 || xong) return;
      const pha = (t % 1.6) / 1.6;
      const x = W * 0.5, y = H * 0.4 + Math.sin(pha * 6.28) * 10 * s;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.9 - pha * 0.9) + ')'; ctx.lineWidth = 4 * s;
      ctx.beginPath(); ctx.arc(x, H * 0.4 + 44 * s, 10 * s + pha * 46 * s, 0, 6.29); ctx.stroke();
      ctx.fillStyle = '#000'; emoji('👆', x, y + 30 * s, 46 * s);
      ctx.restore();
    }

    function ve() {
      ctx.clearRect(0, 0, W, H);
      veNen();
      ca.slice().sort(function (a, b) { return a.y - b.y; }).forEach(veCa);
      moi.forEach(veMoi);
      veHat();
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

    /* ----- Điều khiển: chạm để thả mồi ----- */
    canvas.addEventListener('pointerdown', function (e) {
      const r = canvas.getBoundingClientRect();
      thaMoi(kep(e.clientX - r.left, 12 * s, W - 12 * s), kep(e.clientY - r.top, 14 * s, dayY - 30 * s));
      e.preventDefault();
    });
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
      document.body.classList.remove('dang-choi-ca');
      const muc = cfg.soCa * cfg.can;
      TroChoiChung.ketThuc(CAU_HINH, {
        doKho: doKho,
        diemNhan: diemNhan,
        danhGia: Math.min(1, (muc * 1.5) / Math.max(1, soVien)),
        thongDiep: 'Bé đã cho <b>' + cfg.soCa + '</b> bạn cá ăn no bằng <b>' + soVien + '</b> viên thức ăn!',
        thongDiepPhu: '🐠 ' + ca.map(function (c) { return c.loai.ten; }).join(', ') + ' cảm ơn bé nhiều lắm!'
      }, {
        choiLai: function () { batDau(doKho); },
        doiDoKho: moDau
      });
    }

    /* ----- Chạy ----- */
    doiCo();
    taoCa();
    capNhatKhay();
    if (window.ResizeObserver) {
      quanSat = new ResizeObserver(doiCo);
      quanSat.observe(sanKhau);
    }
    raf = requestAnimationFrame(vong);
  }

  function moDau() {
    document.body.classList.remove('dang-choi-ca');
    TroChoiChung.chonDoKho(CAU_HINH, batDau);
  }

  TroChoiChung.khoiDongTrang(moDau);
})();
