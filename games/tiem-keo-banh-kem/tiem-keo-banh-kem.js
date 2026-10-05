/* =========================================================
   TRÒ CHƠI: TIỆM KẸO – BÁNH – KEM
   Dành cho bé chưa biết chữ: chọn bằng hình, không có đúng/sai
   gây áp lực, không có thua. Ba quầy:
   - 🍭 Kẹo: kiểu kẹo → màu → hình dạng → topping → máy làm kẹo
   - 🍰 Bánh: cho nguyên liệu vào tô (chạm hoặc kéo thả) → trộn
              → nướng → trang trí → xong
   - 🍦 Kem: kiểu kem → vị/màu → ốc quế hoặc ly → topping → xong
   Làm xong một món: +10 điểm, +5 sao (dùng chung diem-so.js).
   Hình vẽ nằm trong ve-mon.js.
   ========================================================= */
(function () {
  'use strict';

  const ID = 'tiem-keo-banh-kem';
  const THOI_GIAN_NUONG = 3000;
  const SO_LAN_TRON = 3;
  const SO_MIENG_TOI_DA = 14;
  const giamChuyenDong = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- Dữ liệu (muốn thêm lựa chọn: thêm một dòng) ---------- */
  const KIEU_KEO = [
    { id: 'mut', ten: 'Kẹo mút' },
    { id: 'goi', ten: 'Kẹo gói' },
    { id: 'deo', ten: 'Kẹo dẻo' }
  ];
  const MAU_KEO = [
    { id: '#ff4d6d', ten: 'Đỏ' }, { id: '#ff8fc8', ten: 'Hồng' }, { id: '#ff9f1c', ten: 'Cam' },
    { id: '#ffd23f', ten: 'Vàng' }, { id: '#6fcf5a', ten: 'Xanh lá' }, { id: '#4dabf7', ten: 'Xanh dương' },
    { id: '#9b6bff', ten: 'Tím' }, { id: 'cau-vong', ten: 'Cầu vồng' }
  ];
  const HINH_KEO = [
    { id: 'tron', ten: 'Hình tròn' }, { id: 'tim', ten: 'Trái tim' },
    { id: 'sao', ten: 'Ngôi sao' }, { id: 'hoa', ten: 'Bông hoa' }
  ];
  const TOPPING_KEO = [
    { id: 'lap-lanh', bieuTuong: '✨', ten: 'Đường lấp lánh' },
    { id: 'com-mau', bieuTuong: '🌈', ten: 'Cốm màu' },
    { id: 'soc', bieuTuong: '🍥', ten: 'Sọc xoắn' },
    { id: 'mat-cuoi', bieuTuong: '😊', ten: 'Mặt cười' }
  ];

  const NGUYEN_LIEU = [
    { id: 'trung', bieuTuong: '🥚', ten: 'Trứng', can: true },
    { id: 'sua', bieuTuong: '🥛', ten: 'Sữa', can: true },
    { id: 'bot', bieuTuong: '🌾', ten: 'Bột', can: true },
    { id: 'duong', bieuTuong: '🍬', ten: 'Đường', can: true },
    { id: 'tat', bieuTuong: '🧦', ten: 'Chiếc tất', can: false },
    { id: 'ca', bieuTuong: '🐟', ten: 'Con cá', can: false }
  ];
  const TRANG_TRI_BANH = [
    { id: 'dau', bieuTuong: '🍓', ten: 'Dâu', loai: 'mieng' },
    { id: 'socola', bieuTuong: '🍫', ten: 'Sô-cô-la', loai: 'phu' },
    { id: 'cherry', bieuTuong: '🍒', ten: 'Cherry', loai: 'mieng' },
    { id: 'keo', bieuTuong: '⭐', ten: 'Kẹo ngôi sao', loai: 'mieng' },
    { id: 'rac', bieuTuong: '🌈', ten: 'Rắc màu', loai: 'phu' }
  ];

  const KIEU_KEM = [
    { id: '1', ten: 'Một viên' }, { id: '2', ten: 'Hai viên' },
    { id: '3', ten: 'Ba viên' }, { id: 'xoan', ten: 'Kem xoắn' }
  ];
  const VI_KEM = [
    { id: 'dau', mau: '#ff8fb1', bieuTuong: '🍓', ten: 'Kem dâu' },
    { id: 'vani', mau: '#fff0c4', bieuTuong: '🍦', ten: 'Kem vani' },
    { id: 'socola', mau: '#8b5a3c', bieuTuong: '🍫', ten: 'Kem sô-cô-la' },
    { id: 'bac-ha', mau: '#98e2c6', bieuTuong: '🌿', ten: 'Kem bạc hà' },
    { id: 'nho', mau: '#b69cff', bieuTuong: '🍇', ten: 'Kem nho' },
    { id: 'xoai', mau: '#ffc94d', bieuTuong: '🥭', ten: 'Kem xoài' }
  ];
  const VAT_KEM = [
    { id: 'oc-que', ten: 'Ốc quế' }, { id: 'ly', ten: 'Ly thủy tinh' }, { id: 'coc', ten: 'Cốc giấy' }
  ];
  const TOPPING_KEM = [
    { id: 'dau', bieuTuong: '🍓', ten: 'Dâu' },
    { id: 'socola', bieuTuong: '🍫', ten: 'Sốt sô-cô-la' },
    { id: 'keo', bieuTuong: '🍬', ten: 'Kẹo' },
    { id: 'hat', bieuTuong: '✨', ten: 'Hạt trang trí' }
  ];

  const QUAY = [
    { id: 'keo', bieuTuong: '🍭', ten: 'Kẹo' },
    { id: 'banh', bieuTuong: '🍰', ten: 'Bánh' },
    { id: 'kem', bieuTuong: '🍦', ten: 'Kem' }
  ];
  const BUOC = {
    keo: [
      { bieuTuong: '🍭', ten: 'Chọn kiểu kẹo' }, { bieuTuong: '🎨', ten: 'Chọn màu' },
      { bieuTuong: '💖', ten: 'Chọn hình dạng' }, { bieuTuong: '✨', ten: 'Thêm topping' },
      { bieuTuong: '🏭', ten: 'Máy làm kẹo' }
    ],
    banh: [
      { bieuTuong: '🥚', ten: 'Cho nguyên liệu' }, { bieuTuong: '🥣', ten: 'Trộn bột' },
      { bieuTuong: '🔥', ten: 'Nướng bánh' }, { bieuTuong: '🍓', ten: 'Trang trí' },
      { bieuTuong: '🎂', ten: 'Hoàn thành' }
    ],
    kem: [
      { bieuTuong: '🍦', ten: 'Chọn kiểu kem' }, { bieuTuong: '🎨', ten: 'Chọn vị kem' },
      { bieuTuong: '🥤', ten: 'Ốc quế hay ly' }, { bieuTuong: '🍫', ten: 'Thêm topping' },
      { bieuTuong: '⭐', ten: 'Hoàn thành' }
    ]
  };
  const LOI_XONG = { keo: '🍭 Kẹo xong rồi!', banh: '🍰 Bánh xong rồi!', kem: '🍦 Kem xong rồi!' };

  /* ---------- Trạng thái ---------- */
  function trangThaiMoi(q) {
    if (q === 'keo') return { buoc: 0, kieu: 'mut', mau: '#ff8fc8', hinh: 'tron', topping: {}, daChon: false };
    if (q === 'banh') return { buoc: 0, da: [], tron: 0, dangNuong: false, daChin: false, soCola: false, rac: false, mieng: [], thuTu: App.tron(NGUYEN_LIEU.map(function (n) { return n.id; })) };
    return { buoc: 0, kieu: '2', vi: [VI_KEM[0].mau, VI_KEM[1].mau, VI_KEM[2].mau], vienChon: 0, vat: 'oc-que', topping: {}, daChon: false };
  }
  const tt = { keo: trangThaiMoi('keo'), banh: trangThaiMoi('banh'), kem: trangThaiMoi('kem') };
  let quay = null;
  let phien = 0;      // tăng mỗi lần đổi màn hình: hủy các hẹn giờ cũ
  let dangBan = false; // đang chạy hoạt hình hoàn thành
  const k = document.getElementById('khu-tro-choi');

  function hen(ham, ms) {
    const p = phien;
    return setTimeout(function () { if (p === phien) ham(); }, ms);
  }
  function tim(ds, id) { return ds.filter(function (x) { return x.id === id; })[0]; }

  /* ---------- Tiện ích hiệu ứng ---------- */
  function khungMon() { return document.getElementById('khung-mon'); }
  function khuKhay() { return document.getElementById('khay'); }

  function bay(noiDung, tu, den, xongGoc) {
    const p = phien;
    // Bé đã đổi quầy / đổi bước trong lúc món đang bay -> bỏ qua
    const xong = xongGoc ? function () { if (p === phien) xongGoc(); } : null;
    if (giamChuyenDong || !document.body.animate || !tu || !den) { if (xong) xong(); return; }
    const e = document.createElement('div');
    e.className = 'mon-bay';
    e.setAttribute('aria-hidden', 'true');
    e.innerHTML = noiDung;
    document.body.appendChild(e);
    const x0 = tu.left + tu.width / 2, y0 = tu.top + tu.height / 2;
    const x1 = den.left + den.width / 2, y1 = den.top + den.height / 2;
    const dx = x1 - x0, dy = y1 - y0;
    e.style.left = x0 + 'px';
    e.style.top = y0 + 'px';
    const hd = e.animate([
      { transform: 'translate(-50%,-50%) scale(1)' },
      { transform: 'translate(calc(-50% + ' + (dx / 2) + 'px), calc(-50% + ' + (dy / 2 - 90) + 'px)) scale(1.2)', offset: 0.5 },
      { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(.45)', opacity: 0.4 }
    ], { duration: 560, easing: 'ease-in-out' });
    let daXong = false;
    function ket() { if (daXong) return; daXong = true; e.remove(); if (xong) xong(); }
    hd.onfinish = ket;
    setTimeout(ket, 900); // dự phòng
  }

  function diemTrenSvg(svg, x, y) {
    try {
      const m = svg.getScreenCTM();
      if (!m) return null;
      const p = svg.createSVGPoint();
      p.x = x; p.y = y;
      return p.matrixTransform(m.inverse());
    } catch (loi) { return null; }
  }
  function diemTrenManHinh(svg, x, y) {
    try {
      const m = svg.getScreenCTM();
      if (!m) return null;
      const p = svg.createSVGPoint();
      p.x = x; p.y = y;
      const q = p.matrixTransform(m);
      return { left: q.x - 10, top: q.y - 10, width: 20, height: 20 };
    } catch (loi) { return null; }
  }

  function nay(phanTu, lop) {
    if (!phanTu) return;
    lop = lop || 'nay';
    phanTu.classList.remove(lop);
    void phanTu.offsetWidth;
    phanTu.classList.add(lop);
  }

  function bongNoi(noiDung) {
    const b = document.getElementById('bong-noi');
    if (!b) return;
    b.innerHTML = noiDung;
    nay(b, 'hien');
  }

  /* Kéo thả hoặc chạm. tc: { noiDung, khiCham(), khiTha(x, y) } */
  function ganKeoTha(nut, tc) {
    let bd = null, bongKeo = null, idCon = null;
    function dich() { return khungMon(); }
    function trenDich(x, y) {
      const d = dich();
      if (!d) return false;
      const r = d.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }
    nut.addEventListener('pointerdown', function (e) {
      if (nut.disabled || dangBan || (e.button !== undefined && e.button > 0)) return;
      bd = { x: e.clientX, y: e.clientY };
      idCon = e.pointerId;
      try { nut.setPointerCapture(idCon); } catch (loi) { /* bỏ qua */ }
    });
    nut.addEventListener('pointermove', function (e) {
      if (!bd || e.pointerId !== idCon) return;
      if (!bongKeo && Math.abs(e.clientX - bd.x) + Math.abs(e.clientY - bd.y) > 12) {
        bongKeo = document.createElement('div');
        bongKeo.className = 'mon-keo';
        bongKeo.setAttribute('aria-hidden', 'true');
        bongKeo.innerHTML = tc.noiDung;
        document.body.appendChild(bongKeo);
        nut.classList.add('dang-keo');
      }
      if (bongKeo) {
        bongKeo.style.left = e.clientX + 'px';
        bongKeo.style.top = e.clientY + 'px';
        const d = dich();
        if (d) d.classList.toggle('sap-tha', trenDich(e.clientX, e.clientY));
      }
    });
    function ket(e, huy) {
      if (!bd || e.pointerId !== idCon) return;
      const coKeo = !!bongKeo;
      bd = null;
      if (bongKeo) {
        bongKeo.remove();
        bongKeo = null;
        nut.classList.remove('dang-keo');
        const d = dich();
        if (d) d.classList.remove('sap-tha');
      }
      if (huy || nut.disabled || dangBan) return;
      if (coKeo) {
        if (trenDich(e.clientX, e.clientY)) tc.khiTha(e.clientX, e.clientY);
      } else {
        tc.khiCham();
      }
    }
    nut.addEventListener('pointerup', function (e) { ket(e, false); });
    nut.addEventListener('pointercancel', function (e) { ket(e, true); });
    // Bàn phím (Enter / Space): sự kiện click có detail = 0
    nut.addEventListener('click', function (e) { if (e.detail === 0 && !nut.disabled && !dangBan) tc.khiCham(); });
  }

  /* =========================================================
     MÀN 1: TIỆM (chọn quầy)
     ========================================================= */
  function veTiem() {
    phien++;
    dangBan = false;
    quay = null;
    document.body.classList.remove('dang-lam');
    const mau = {
      keo: VeMon.keo({ kieu: 'mut', mau: '#ff8fc8', hinh: 'tim', topping: { 'lap-lanh': true } }, 'hinh-quay'),
      banh: VeMon.banh({ soCola: false, rac: true, mieng: [{ loai: 'dau', x: 120, y: 142 }, { loai: 'cherry', x: 150, y: 132 }, { loai: 'dau', x: 182, y: 146 }] }, 'hinh-quay'),
      kem: VeMon.kem({ kieu: '2', vi: ['#98e2c6', '#ff8fb1'], vat: 'oc-que', topping: { dau: true } }, 'hinh-quay')
    };
    k.innerHTML =
      '<section class="man-tiem">' +
        '<div class="tieu-de-tro-choi tieu-de-gon">' + TroChoiChung.anhTieuDe(ID) + '<h1>Tiệm kẹo – bánh – kem</h1></div>' +
        '<p class="huong-dan">Bé muốn làm món gì nào? 👇</p>' +
        '<div class="luoi-quay">' +
          QUAY.map(function (q) {
            const tc = LuuTru.layTroChoi(ID);
            const soMon = (tc.monDaLam && tc.monDaLam[q.id]) || 0;
            return '<button type="button" class="the-quay the-quay-' + q.id + '" data-quay="' + q.id + '" aria-label="Làm ' + q.ten.toLowerCase() + '">' +
              '<span class="mai-hien" aria-hidden="true"></span>' +
              mau[q.id] +
              '<span class="ten-quay"><span aria-hidden="true">' + q.bieuTuong + '</span> ' + q.ten + '</span>' +
              (soMon ? '<span class="dem-mon" aria-label="Đã làm ' + soMon + ' lần">' + '⭐'.repeat(Math.min(soMon, 5)) + (soMon > 5 ? '+' : '') + '</span>' : '') +
            '</button>';
          }).join('') +
        '</div>' +
      '</section>';
    k.querySelectorAll('[data-quay]').forEach(function (n) {
      n.addEventListener('click', function () {
        AmThanh.phat('nhan');
        veLam(n.getAttribute('data-quay'));
      });
    });
    window.scrollTo(0, 0);
  }

  /* =========================================================
     MÀN 2: LÀM MÓN
     ========================================================= */
  function veLam(q) {
    phien++;
    dangBan = false;
    quay = q;
    document.body.classList.add('dang-lam');
    k.innerHTML =
      '<section class="man-lam quay-' + q + '">' +
        '<div class="thanh-buoc" id="thanh-buoc"></div>' +
        '<div class="san-khau" id="san-khau">' +
          '<div class="cong-thuc" id="cong-thuc"></div>' +
          '<div class="khung-mon" id="khung-mon"></div>' +
          '<div class="bong-noi" id="bong-noi" aria-live="polite"></div>' +
        '</div>' +
        '<div class="khay" id="khay"></div>' +
        '<nav class="quay-hang" aria-label="Chọn quầy">' +
          QUAY.map(function (x) {
            return '<button type="button" class="nut-quay' + (x.id === q ? ' dang-o' : '') + '" data-doi-quay="' + x.id + '" aria-label="Quầy ' + x.ten.toLowerCase() + '"' + (x.id === q ? ' aria-current="true"' : '') + '>' +
              '<span class="bt-quay" aria-hidden="true">' + x.bieuTuong + '</span><span class="chu-quay">' + x.ten + '</span></button>';
          }).join('') +
        '</nav>' +
      '</section>';
    k.querySelectorAll('[data-doi-quay]').forEach(function (n) {
      n.addEventListener('click', function () {
        if (dangBan) return;
        const moi = n.getAttribute('data-doi-quay');
        if (moi === quay) return;
        AmThanh.phat('nhan');
        veLam(moi);
      });
    });
    khungMon().addEventListener('click', bamVaoMon);
    capNhatTatCa();
    window.scrollTo(0, 0);
  }

  function capNhatTatCa() {
    veThanhBuoc();
    veSan();
    veKhay();
  }

  /* ---------- Thanh các bước ---------- */
  function coTheLui() {
    const s = tt[quay];
    if (quay === 'banh') return s.buoc === 4;
    return s.buoc > 0;
  }
  function coTheTien() {
    const s = tt[quay];
    if (quay === 'banh') return s.buoc === 3;
    return s.buoc < 4;
  }
  function coTheNhay(i) {
    const s = tt[quay];
    if (quay === 'banh') return s.buoc >= 3 && i >= 3;
    return true;
  }

  function veThanhBuoc() {
    const s = tt[quay];
    const tb = document.getElementById('thanh-buoc');
    tb.innerHTML =
      '<button type="button" class="nut nut-tron nut-trang nut-buoc" id="nut-lui" aria-label="Bước trước"' + (coTheLui() ? '' : ' disabled') + '>◀</button>' +
      '<ol class="cac-buoc">' +
        BUOC[quay].map(function (b, i) {
          const lop = i === s.buoc ? 'dang' : (i < s.buoc ? 'qua' : '');
          return '<li><button type="button" class="cham-buoc ' + lop + '" data-buoc="' + i + '" aria-label="Bước ' + (i + 1) + ': ' + b.ten + '"' +
            (i === s.buoc ? ' aria-current="step"' : '') + (coTheNhay(i) ? '' : ' disabled') + '>' +
            '<span aria-hidden="true">' + b.bieuTuong + '</span></button></li>';
        }).join('') +
      '</ol>' +
      '<button type="button" class="nut nut-tron nut-xanh nut-buoc' + (s.daChon && coTheTien() ? ' moi-bam' : '') + '" id="nut-tien" aria-label="Bước tiếp theo"' + (coTheTien() ? '' : ' disabled') + '>▶</button>';
    tb.querySelector('#nut-lui').addEventListener('click', function () { if (!dangBan && coTheLui()) { AmThanh.phat('nhan'); denBuoc(s.buoc - 1); } });
    tb.querySelector('#nut-tien').addEventListener('click', function () { if (!dangBan && coTheTien()) { AmThanh.phat('nhan'); denBuoc(s.buoc + 1); } });
    tb.querySelectorAll('[data-buoc]').forEach(function (n) {
      n.addEventListener('click', function () {
        const i = Number(n.getAttribute('data-buoc'));
        if (dangBan || i === s.buoc || !coTheNhay(i)) return;
        AmThanh.phat('nhan');
        denBuoc(i);
      });
    });
  }

  function denBuoc(i) {
    const s = tt[quay];
    s.buoc = Math.max(0, Math.min(4, i));
    s.daChon = false;
    if (quay === 'kem' && s.buoc === 1) s.vienChon = 0;
    phien++; // hủy các hẹn giờ của bước cũ
    capNhatTatCa();
    nay(khungMon());
    // Màn hình nhỏ đã cuộn xuống: cuộn lên để bé thấy lại thanh các bước
    const tb = document.getElementById('thanh-buoc');
    if (tb && tb.getBoundingClientRect().top < 70) window.scrollTo(0, 0);
  }

  /* ---------- Sân khấu: món đang làm ---------- */
  function hinhHienTai(lop) {
    const s = tt[quay];
    if (quay === 'keo') return VeMon.keo(s, lop, 'Viên kẹo của bé');
    if (quay === 'kem') return VeMon.kem(s, lop, 'Cây kem của bé', { vienChon: (s.buoc === 1 && !lop) ? s.vienChon : -1 });
    if (s.buoc <= 1) return VeMon.to({ da: s.da, tron: s.tron, coPhoi: s.buoc === 1 }, lop, 'Tô trộn bột');
    if (s.buoc === 2) return VeMon.lo({ dangNuong: s.dangNuong, daChin: s.daChin }, lop, 'Lò nướng bánh');
    return VeMon.banh(s, lop, 'Chiếc bánh của bé');
  }

  function veSan() {
    const s = tt[quay];
    khungMon().innerHTML = hinhHienTai();
    khungMon().classList.toggle('co-the-cham', quay === 'kem' && s.buoc === 1 && s.kieu !== 'xoan');
    const ct = document.getElementById('cong-thuc');
    if (quay === 'banh' && s.buoc === 0) {
      ct.hidden = false;
      ct.innerHTML = NGUYEN_LIEU.filter(function (n) { return n.can; }).map(function (n) {
        const co = s.da.indexOf(n.id) >= 0;
        return '<span class="o-cong-thuc' + (co ? ' co' : '') + '" role="img" aria-label="' + n.ten + (co ? ': đã có' : ': chưa có') + '">' + n.bieuTuong + '</span>';
      }).join('');
    } else {
      ct.hidden = true;
      ct.innerHTML = '';
    }
  }

  // Bé chạm vào món trên sân khấu
  function bamVaoMon(e) {
    if (dangBan) return;
    const s = tt[quay];
    if (quay === 'kem' && s.buoc === 1) {
      const v = e.target.closest && e.target.closest('[data-vien]');
      if (v) {
        s.vienChon = Number(v.getAttribute('data-vien'));
        AmThanh.phat('nhan');
        veSan();
      }
    } else if (quay === 'banh' && s.buoc === 1) {
      tronBot();
    }
  }

  /* ---------- Khay lựa chọn ---------- */
  function nutMon(giaTri, hinh, ten, dangChon, lopThem) {
    return '<button type="button" class="nut-mon' + (dangChon ? ' dang-chon' : '') + (lopThem ? ' ' + lopThem : '') + '" data-gia-tri="' + giaTri + '" aria-label="' + ten + '" aria-pressed="' + (dangChon ? 'true' : 'false') + '">' +
      '<span class="hinh-mon">' + hinh + '</span><span class="ten-mon">' + ten + '</span></button>';
  }
  function bieuTuongMon(bt) { return '<span class="bieu-tuong-mon" aria-hidden="true">' + bt + '</span>'; }
  function nutXong(bieuTuong, chu) {
    return '<div class="khay-xong"><button type="button" class="nut-lam-xong" id="nut-lam-xong">' +
      '<span class="bt-xong" aria-hidden="true">' + bieuTuong + '</span><span>' + chu + '</span></button></div>';
  }

  function veKhay() {
    const s = tt[quay];
    const khay = khuKhay();
    khay.className = 'khay';
    let html = '';
    if (quay === 'keo') {
      if (s.buoc === 0) html = KIEU_KEO.map(function (o) { return nutMon(o.id, VeMon.keo(Object.assign({}, s, { kieu: o.id, topping: {} }), 'mini'), o.ten, s.kieu === o.id); }).join('');
      if (s.buoc === 1) { khay.classList.add('khay-nhieu'); html = MAU_KEO.map(function (o) { return nutMon(o.id, VeMon.keo({ kieu: s.kieu, mau: o.id, hinh: s.hinh, topping: {} }, 'mini'), o.ten, s.mau === o.id); }).join(''); }
      if (s.buoc === 2) html = HINH_KEO.map(function (o) { return nutMon(o.id, VeMon.keo(Object.assign({}, s, { hinh: o.id, topping: {} }), 'mini'), o.ten, s.hinh === o.id); }).join('');
      if (s.buoc === 3) html = TOPPING_KEO.map(function (o) { return nutMon(o.id, bieuTuongMon(o.bieuTuong), o.ten, !!s.topping[o.id]); }).join('');
      if (s.buoc === 4) html = nutXong('🏭', 'Làm kẹo!');
    } else if (quay === 'kem') {
      if (s.buoc === 0) html = KIEU_KEM.map(function (o) { return nutMon(o.id, VeMon.kem(Object.assign({}, s, { kieu: o.id, topping: {} }), 'mini'), o.ten, s.kieu === o.id); }).join('');
      if (s.buoc === 1) { khay.classList.add('khay-nhieu'); html = VI_KEM.map(function (o) { return nutMon(o.id, VeMon.vienKem(o.mau, 'mini') + '<span class="huy-hieu" aria-hidden="true">' + o.bieuTuong + '</span>', o.ten, false); }).join(''); }
      if (s.buoc === 2) html = VAT_KEM.map(function (o) { return nutMon(o.id, VeMon.kem(Object.assign({}, s, { vat: o.id, topping: {} }), 'mini'), o.ten, s.vat === o.id); }).join('');
      if (s.buoc === 3) html = TOPPING_KEM.map(function (o) { return nutMon(o.id, bieuTuongMon(o.bieuTuong), o.ten, !!s.topping[o.id]); }).join('');
      if (s.buoc === 4) html = nutXong('🍦', 'Xong rồi!');
    } else {
      html = veKhayBanh(s, khay);
    }
    khay.innerHTML = html;
    ganSuKienKhay();
  }

  function veKhayBanh(s, khay) {
    if (s.buoc === 0) {
      khay.classList.add('khay-nhieu', 'khay-keo');
      return s.thuTu.map(function (id) {
        const n = tim(NGUYEN_LIEU, id);
        const co = s.da.indexOf(id) >= 0;
        return '<button type="button" class="nut-mon nut-keo-tha' + (co ? ' da-dung' : '') + '" data-nguyen-lieu="' + id + '" aria-label="Cho ' + n.ten.toLowerCase() + ' vào tô"' + (co ? ' disabled' : '') + '>' +
          bieuTuongMon(n.bieuTuong) + '<span class="ten-mon">' + n.ten + '</span>' + (co ? '<span class="dau-xong" aria-hidden="true">✓</span>' : '') + '</button>';
      }).join('');
    }
    if (s.buoc === 1) {
      let cham = '';
      for (let i = 0; i < SO_LAN_TRON; i++) cham += '<span class="' + (i < s.tron ? 'xong' : '') + '"></span>';
      return '<div class="khay-xong"><button type="button" class="nut-lam-xong nut-tron-bot" id="nut-tron-bot" aria-label="Trộn bột">' +
        '<span class="bt-xong" aria-hidden="true">🥄</span><span>Trộn nào!</span></button>' +
        '<div class="cham-tien-do" aria-hidden="true">' + cham + '</div></div>';
    }
    if (s.buoc === 2) {
      return '<div class="khay-xong"><button type="button" class="nut-lam-xong nut-nuong" id="nut-nuong" aria-label="Nướng bánh"' + (s.dangNuong ? ' disabled' : '') + '>' +
        '<span class="bt-xong" aria-hidden="true">🔥</span><span>' + (s.dangNuong ? 'Đang nướng...' : 'Nướng bánh!') + '</span></button>' +
        (s.dangNuong ? '<div class="thanh-nuong" aria-hidden="true"><span style="animation-duration:' + THOI_GIAN_NUONG + 'ms"></span></div>' : '') +
        '</div>';
    }
    if (s.buoc === 3) {
      khay.classList.add('khay-nhieu', 'khay-keo');
      return TRANG_TRI_BANH.map(function (o) {
        const bat = (o.id === 'socola' && s.soCola) || (o.id === 'rac' && s.rac);
        return '<button type="button" class="nut-mon nut-keo-tha' + (bat ? ' dang-chon' : '') + '" data-trang-tri="' + o.id + '" aria-label="' + o.ten + '"' + (o.loai === 'phu' ? ' aria-pressed="' + bat + '"' : '') + '>' +
          bieuTuongMon(o.bieuTuong) + '<span class="ten-mon">' + o.ten + '</span></button>';
      }).join('') +
        '<button type="button" class="nut-mon nut-hoan-tac" data-hoan-tac="1" aria-label="Bỏ món trang trí vừa thêm"' + (s.mieng.length ? '' : ' disabled') + '>' +
        bieuTuongMon('↩️') + '<span class="ten-mon">Bỏ bớt</span></button>';
    }
    return nutXong('🎂', 'Xong rồi!');
  }

  function ganSuKienKhay() {
    const khay = khuKhay();
    const s = tt[quay];
    const nutXongDom = khay.querySelector('#nut-lam-xong');
    if (nutXongDom) nutXongDom.addEventListener('click', function () { if (!dangBan) hoanThanhMon(); });

    if (quay === 'banh') {
      const nutTron = khay.querySelector('#nut-tron-bot');
      if (nutTron) nutTron.addEventListener('click', tronBot);
      const nutNuong = khay.querySelector('#nut-nuong');
      if (nutNuong) nutNuong.addEventListener('click', nuongBanh);
      khay.querySelectorAll('[data-nguyen-lieu]').forEach(function (n) {
        const id = n.getAttribute('data-nguyen-lieu');
        ganKeoTha(n, {
          noiDung: tim(NGUYEN_LIEU, id).bieuTuong,
          khiCham: function () { choVaoTo(id, n, true); },
          khiTha: function () { choVaoTo(id, n, false); }
        });
      });
      khay.querySelectorAll('[data-trang-tri]').forEach(function (n) {
        const id = n.getAttribute('data-trang-tri');
        ganKeoTha(n, {
          noiDung: tim(TRANG_TRI_BANH, id).bieuTuong,
          khiCham: function () { trangTri(id, n, null); },
          khiTha: function (x, y) { trangTri(id, n, { x: x, y: y }); }
        });
      });
      const nutBo = khay.querySelector('[data-hoan-tac]');
      if (nutBo) nutBo.addEventListener('click', function () {
        if (!s.mieng.length || dangBan) return;
        s.mieng.pop();
        AmThanh.phat('latThe');
        veSan();
        veKhay();
      });
      return;
    }

    khay.querySelectorAll('.nut-mon').forEach(function (n) {
      n.addEventListener('click', function () {
        if (dangBan) return;
        chonLuaChon(n.getAttribute('data-gia-tri'), n);
      });
    });
  }

  /* ---------- Chọn ở quầy kẹo / kem ---------- */
  function chonLuaChon(giaTri, nut) {
    const s = tt[quay];
    const rNut = nut.getBoundingClientRect();
    const rMon = khungMon().getBoundingClientRect();
    function xongChon(amThanh) {
      s.daChon = true;
      AmThanh.phat(amThanh || 'nhan');
      veSan();
      veKhay();
      veThanhBuoc();
      nay(khungMon());
    }
    if (quay === 'keo') {
      if (s.buoc === 0) { s.kieu = giaTri; xongChon(); }
      else if (s.buoc === 1) {
        s.mau = giaTri;
        bay('<span class="giot-mau" style="background:' + (giaTri === 'cau-vong' ? 'conic-gradient(#ff4d6d,#ffd23f,#6fcf5a,#4dabf7,#9b6bff,#ff4d6d)' : giaTri) + '"></span>', rNut, rMon, function () { xongChon('toMau'); });
      } else if (s.buoc === 2) { s.hinh = giaTri; xongChon(); }
      else if (s.buoc === 3) {
        const bat = !s.topping[giaTri];
        if (bat) {
          s.topping[giaTri] = true;
          bay(tim(TOPPING_KEO, giaTri).bieuTuong, rNut, rMon, function () { xongChon('dat'); });
        } else { delete s.topping[giaTri]; xongChon('latThe'); }
      }
      return;
    }
    // Kem
    if (s.buoc === 0) {
      s.kieu = giaTri;
      if (s.vienChon >= soVien(s)) s.vienChon = 0;
      xongChon();
    } else if (s.buoc === 1) {
      const vi = tim(VI_KEM, giaTri);
      const chiSo = s.vienChon;
      let den = rMon;
      const svg = khungMon().querySelector('svg');
      const vien = VeMon.cacVienKem(s)[chiSo];
      if (svg && vien) den = diemTrenManHinh(svg, vien.cx, vien.cy + (s.vat === 'ly' ? 12 : 0)) || rMon;
      bay('<span class="giot-mau" style="background:' + vi.mau + '"></span>', rNut, den, function () {
        s.vi[chiSo] = vi.mau;
        if (s.kieu === 'xoan') s.vi[0] = vi.mau;
        s.vienChon = (chiSo + 1) % soVien(s);
        xongChon('toMau');
      });
    } else if (s.buoc === 2) { s.vat = giaTri; xongChon(); }
    else if (s.buoc === 3) {
      const bat = !s.topping[giaTri];
      if (bat) {
        s.topping[giaTri] = true;
        bay(tim(TOPPING_KEM, giaTri).bieuTuong, rNut, rMon, function () { xongChon('dat'); });
      } else { delete s.topping[giaTri]; xongChon('latThe'); }
    }
  }
  function soVien(s) { return s.kieu === 'xoan' ? 1 : Number(s.kieu); }

  /* ---------- Quầy bánh ---------- */
  function choVaoTo(id, nut, bayTuNut) {
    const s = tt.banh;
    if (s.buoc !== 0 || s.da.indexOf(id) >= 0) return;
    const n = tim(NGUYEN_LIEU, id);
    if (!n.can) {
      // Món lạ: tô lắc đầu nhẹ, bé chọn lại
      AmThanh.phat('sai');
      nay(nut, 'lac-nhe');
      nay(khungMon(), 'lac-dau');
      bongNoi('🙅');
      return;
    }
    s.da.push(id);
    nut.disabled = true;
    function sauKhiBay() {
      AmThanh.phat('bayVao');
      veSan();
      veKhay();
      nay(khungMon());
      if (s.da.length >= 4) {
        AmThanh.phat('dung');
        bongNoi('👍');
        hen(function () { denBuoc(1); bongNoi('🥄'); }, 900);
      }
    }
    const rMon = khungMon().getBoundingClientRect();
    const den = { left: rMon.left, top: rMon.top + rMon.height * 0.35, width: rMon.width, height: rMon.height * 0.2 };
    if (bayTuNut) bay(n.bieuTuong, nut.getBoundingClientRect(), den, sauKhiBay);
    else sauKhiBay();
  }

  function tronBot() {
    const s = tt.banh;
    if (s.buoc !== 1 || s.tron >= SO_LAN_TRON || dangBan) return;
    s.tron++;
    AmThanh.phat('tron');
    veSan();
    nay(khungMon(), 'rung');
    veKhay();
    if (s.tron >= SO_LAN_TRON) {
      AmThanh.phat('dung');
      bongNoi('✨');
      hen(function () { denBuoc(2); bongNoi('🔥'); }, 900);
    }
  }

  function nuongBanh() {
    const s = tt.banh;
    if (s.buoc !== 2 || s.dangNuong || s.daChin) return;
    s.dangNuong = true;
    AmThanh.phat('nuong');
    veSan();
    veKhay();
    hen(function () {
      s.dangNuong = false;
      s.daChin = true;
      AmThanh.phat('ding');
      veSan();
      bongNoi('🍰');
      hen(function () { denBuoc(3); }, 800);
    }, THOI_GIAN_NUONG);
  }

  function trangTri(id, nut, diemTha) {
    const s = tt.banh;
    if (s.buoc !== 3) return;
    const o = tim(TRANG_TRI_BANH, id);
    const svg = khungMon().querySelector('svg');
    if (o.loai === 'phu') {
      const bat = id === 'socola' ? (s.soCola = !s.soCola) : (s.rac = !s.rac);
      function xong() { AmThanh.phat(bat ? 'dat' : 'latThe'); veSan(); veKhay(); nay(khungMon()); }
      if (bat && !diemTha) bay(o.bieuTuong, nut.getBoundingClientRect(), khungMon().getBoundingClientRect(), xong);
      else xong();
      return;
    }
    // Miếng trang trí: đặt đúng chỗ bé thả, hoặc chỗ ngẫu nhiên trên mặt bánh
    let x, y;
    const p = diemTha && svg ? diemTrenSvg(svg, diemTha.x, diemTha.y) : null;
    if (p) {
      x = Math.max(64, Math.min(236, p.x));
      y = Math.max(128, Math.min(246, p.y));
    } else {
      const g = Math.random() * Math.PI * 2, u = Math.sqrt(Math.random());
      x = 150 + Math.cos(g) * 72 * u;
      y = 150 + Math.sin(g) * 16 * u;
    }
    const moi = { loai: id, x: Math.round(x), y: Math.round(y) };
    function dat() {
      s.mieng.push(moi);
      if (s.mieng.length > SO_MIENG_TOI_DA) s.mieng.shift();
      AmThanh.phat('dat');
      veSan();
      veKhay();
    }
    if (!diemTha && svg) bay(o.bieuTuong, nut.getBoundingClientRect(), diemTrenManHinh(svg, x, y), dat);
    else dat();
  }

  /* ---------- Hoàn thành & phần thưởng ---------- */
  function hoanThanhMon() {
    if (dangBan) return;
    dangBan = true;
    const q = quay;
    khuKhay().classList.add('khoa');
    if (q === 'keo') {
      const s = tt.keo;
      AmThanh.phat('mayKeo');
      khungMon().innerHTML = VeMon.may(s.mau);
      hen(function () {
        khungMon().innerHTML = VeMon.keo(s, 'keo-ra', 'Viên kẹo của bé');
        AmThanh.phat('bayVao');
        hen(function () { phanThuong(q); }, 900);
      }, giamChuyenDong ? 400 : 1700);
      return;
    }
    nay(khungMon(), 'lap-lanh-xong');
    hen(function () { phanThuong(q); }, giamChuyenDong ? 150 : 650);
  }

  function phanThuong(q) {
    const hinh = hinhHienTai('hinh-thanh-pham');
    const diem = DiemSo.DIEM_TRA_LOI_DUNG;
    DiemSo.themDiem(diem);
    const sao = DiemSo.hoanThanhTroChoi(ID, null, diem);
    LuuTru.capNhatTroChoi(ID, function (tc) {
      if (!tc.monDaLam) tc.monDaLam = {};
      tc.monDaLam[q] = (tc.monDaLam[q] || 0) + 1;
    });
    AmThanh.phat('hoanThanh');
    App.phaoGiay(28);
    let luaChon = 'lai';
    App.hopThoai({
      lop: 'hop-thanh-pham',
      tieuDe: LOI_XONG[q],
      noiDungHtml:
        '<div class="thanh-pham-lon">' + hinh + '</div>' +
        '<div class="sao-thuong" aria-label="3 ngôi sao"><span>⭐</span><span>⭐</span><span>⭐</span></div>' +
        '<div class="the-phan-thuong"><div>🎯 +' + diem + ' điểm</div><div>⭐ +' + sao + ' sao</div></div>',
      nut: [
        { nhan: '🔄 Làm tiếp', lop: 'nut-xanh', hanhDong: function () { luaChon = 'lai'; } },
        { nhan: '🏪 Món khác', lop: 'nut-trang', hanhDong: function () { luaChon = 'tiem'; } }
      ],
      khiDong: function () {
        tt[q] = trangThaiMoi(q);
        if (luaChon === 'tiem') veTiem();
        else veLam(q);
      }
    });
  }

  TroChoiChung.khoiDongTrang(veTiem);
})();
