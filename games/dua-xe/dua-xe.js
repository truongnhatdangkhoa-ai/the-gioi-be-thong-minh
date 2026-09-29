/* =========================================================
   TRÒ CHƠI: ĐUA XE TRÁNH VẬT CẢN
   Xe của bé chạy trên đường nhiều làn. Bé chạm vào làn đường
   (hoặc bấm nút ⬆️ ⬇️, phím mũi tên) để đổi làn, né các bạn
   con vật, nón giao thông và xe chạy ngược chiều, nhặt sao,
   rồi về đích.
   Không bao giờ trừ điểm và không bao giờ "thua": đụng vật cản
   chỉ làm xe chậm lại một chút, mất chuỗi thưởng và bị ít sao hơn.
   ========================================================= */
(function () {
  'use strict';

  const GOC_ANH = '../../assets/images/';
  const FONT_EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  // Xe để bé chọn. Ảnh gốc xe quay đầu sang TRÁI (game tự lật khi vẽ xe của bé).
  // Muốn thêm xe: chép ảnh vào assets/images/ rồi thêm một dòng { id, ten }.
  const XE = [
    { id: 'xe', ten: 'Xe đua đỏ' },
    { id: 'xe-dien', ten: 'Xe điện' },
    { id: 'taxi', ten: 'Taxi' },
    { id: 'xe-jeep', ten: 'Xe jeep' },
    { id: 'xe-canh-sat', ten: 'Xe cảnh sát' },
    { id: 'xe-cuu-hoa', ten: 'Xe cứu hỏa' },
    { id: 'xe-cuu-thuong', ten: 'Xe cứu thương' },
    { id: 'xe-tai', ten: 'Xe tải' }
  ];

  // Vật cản đứng trên đường. cao = chiều cao so với bề rộng một làn.
  // Muốn thêm: chép ảnh vào assets/images/ rồi thêm một dòng { id, ten, cao }.
  const VAT_CAN = [
    { id: 'heo', ten: 'bạn heo', cao: 0.72 },
    { id: 'cho', ten: 'bạn chó', cao: 0.9 },
    { id: 'ga', ten: 'bạn gà', cao: 0.78 },
    { id: 'vit', ten: 'bạn vịt', cao: 0.72 },
    { id: 'gau', ten: 'bạn gấu', cao: 0.9 },
    { id: 'rua', ten: 'bạn rùa', cao: 0.6 },
    { id: 'soc', ten: 'bạn sóc', cao: 0.85 },
    { id: 'tho', ten: 'bạn thỏ', cao: 0.9 },
    { id: 'de', ten: 'bạn dê', cao: 0.88 },
    { id: 'trau', ten: 'bạn trâu', cao: 1.05 },
    { id: 'cu-cai', ten: 'củ cải', cao: 0.95 }
  ];
  const CAO_NON = 0.55; // nón giao thông vẽ bằng canvas

  const CAU_HINH_DO_KHO = {
    // lan: số làn | toc: tốc độ (đơn vị/giây) | dich: độ dài đường đua
    // khoang: khoảng cách giữa hai đợt vật cản | chan: số làn bị chắn mỗi đợt [ít nhất, nhiều nhất]
    // xeNguoc: tỉ lệ vật cản là xe ngược chiều | sao: xác suất có hàng sao
    'de': { lan: 3, toc: 170, dich: 6500, khoang: 480, chan: [1, 1], xeNguoc: 0, sao: 0.8 },
    'trung-binh': { lan: 3, toc: 225, dich: 9000, khoang: 400, chan: [1, 2], xeNguoc: 0.4, sao: 0.7 },
    'kho': { lan: 4, toc: 285, dich: 12000, khoang: 360, chan: [1, 3], xeNguoc: 0.5, sao: 0.7 }
  };

  const CAU_HINH = {
    id: 'dua-xe',
    ten: 'Đua xe',
    bieuTuong: '🏎️',
    huongDan: 'Chạm vào làn đường (hoặc bấm nút ⬆️ ⬇️) để đổi làn. Bé né vật cản, nhặt thật nhiều sao rồi về đích nhé!',
    moTaDoKho: {
      'de': '3 làn · xe chạy chậm · ít vật cản',
      'trung-binh': '3 làn · có xe ngược chiều',
      'kho': '4 làn · xe chạy nhanh'
    }
  };

  const LOI_SAO = ['Sao sáng quá! ⭐', 'Bé nhặt giỏi quá! 🌟', 'Ting ting! ✨', 'Tuyệt vời! 🎉'];
  const TI_LE_NGUOC = 0.9; // xe ngược chiều chạy thêm 0.9 lần tốc độ đường

  /* ---------- Ảnh ---------- */
  const anhDaTai = {};
  function layAnh(id) {
    if (!anhDaTai[id]) {
      const a = new Image();
      a.src = (id.indexOf('cay-') === 0 ? '' : GOC_ANH) + id + '.png'; // ảnh cây đã tách nền nằm ngay trong thư mục game
      anhDaTai[id] = a;
    }
    return anhDaTai[id];
  }
  function anhSan(a) { return !!(a && a.complete && a.naturalWidth > 0); }
  XE.forEach(function (x) { layAnh(x.id); });
  VAT_CAN.forEach(function (v) { layAnh(v.id); });
  layAnh('cay-dua'); layAnh('cay-cam'); layAnh('cay-xoai');
  const CAY = ['cay-dua', 'cay-cam', 'cay-xoai'];

  function ngau(a, b) { return a + Math.random() * (b - a); }
  function ngauNguyen(a, b) { return Math.floor(ngau(a, b + 1)); }
  function kep(x, a, b) { return Math.max(a, Math.min(b, x)); }

  let soPhien = 0;          // mỗi lần vào chơi là một phiên; phiên cũ tự dừng
  let xeDaChon = XE[0].id;  // xe bé chọn (nhớ trong lúc còn ở trang)

  /* ---------- Chọn xe ---------- */
  function chonXe(doKho) {
    const k = document.getElementById('khu-tro-choi');
    let chon = xeDaChon;
    k.innerHTML =
      '<section class="man-chon-xe">' +
        '<div class="tieu-de-tro-choi tieu-de-gon">' + TroChoiChung.anhTieuDe(CAU_HINH.id) + '<h1>Chọn xe của bé</h1></div>' +
        '<p class="huong-dan">Bé thích lái xe nào nhất? Chạm vào xe để chọn nhé! 🚦</p>' +
        '<div class="luoi-chon-xe">' +
          XE.map(function (x) {
            return '<button type="button" class="nut-chon-xe' + (x.id === chon ? ' chon' : '') + '" data-xe="' + x.id + '">' +
              '<img src="' + GOC_ANH + x.id + '.png" alt="" draggable="false"><span>' + x.ten + '</span></button>';
          }).join('') +
        '</div>' +
        '<div class="nhom-nut">' +
          '<button type="button" class="nut nut-vang" id="nut-xuat-phat">🏁 Xuất phát!</button>' +
          '<button type="button" class="nut nut-trang" id="nut-quay-lai">◀ Đổi độ khó</button>' +
        '</div>' +
      '</section>';
    k.querySelectorAll('.nut-chon-xe').forEach(function (nut) {
      nut.addEventListener('click', function () {
        AmThanh.phat('nhan');
        chon = nut.getAttribute('data-xe');
        k.querySelectorAll('.nut-chon-xe').forEach(function (n) { n.classList.toggle('chon', n === nut); });
      });
    });
    k.querySelector('#nut-xuat-phat').addEventListener('click', function () {
      AmThanh.phat('nhan');
      xeDaChon = chon;
      batDau(doKho, chon);
    });
    k.querySelector('#nut-quay-lai').addEventListener('click', function () {
      AmThanh.phat('nhan');
      moDau();
    });
    window.scrollTo(0, 0);
  }

  /* ---------- Vào chơi ---------- */
  function batDau(doKho, xeId) {
    const cfg = CAU_HINH_DO_KHO[doKho];
    const phien = ++soPhien;
    const k = document.getElementById('khu-tro-choi');
    DiemSo.datLaiChuoi();

    k.innerHTML =
      '<section class="man-dua-xe">' +
        '<div class="thanh-thong-tin">' +
          '<button type="button" class="nut nut-tron nut-trang nut-nho" id="nut-doi-do-kho" aria-label="Đổi độ khó" title="Đổi độ khó">🎚️</button>' +
          '<div class="duong-dua" aria-label="Quãng đường đã đi">' +
            '<span class="duong-dua-day" id="dua-day"></span>' +
            '<span class="duong-dua-xe" id="dua-xe-nho"><img src="' + GOC_ANH + xeId + '.png" alt="" draggable="false"></span>' +
            '<span class="duong-dua-dich" aria-hidden="true">🏁</span>' +
          '</div>' +
          '<span class="o-thong-tin" title="Số sao bé đã nhặt">⭐ Nhặt: <b id="so-sao">0</b></span>' +
        '</div>' +
        '<p class="huong-dan" id="loi-nhac">Sẵn sàng nào! 🚦</p>' +
        '<div class="san-khau-xe" id="san-khau"><canvas id="khung-ve" aria-label="Đường đua"></canvas></div>' +
        '<div class="dieu-khien-lan">' +
          '<button type="button" class="nut-lan" data-huong="-1" aria-label="Lên làn trên">⬆️</button>' +
          '<button type="button" class="nut-lan" data-huong="1" aria-label="Xuống làn dưới">⬇️</button>' +
        '</div>' +
      '</section>';
    document.body.classList.add('dang-dua-xe');

    const sanKhau = k.querySelector('#san-khau');
    const canvas = k.querySelector('#khung-ve');
    const ctx = canvas.getContext('2d');
    const oSao = k.querySelector('#so-sao');
    const loiNhac = k.querySelector('#loi-nhac');
    const thanhDay = k.querySelector('#dua-day');
    const xeNho = k.querySelector('#dua-xe-nho');

    /* ----- Trạng thái ----- */
    let W = 0, H = 0, s = 1, dpr = 1;
    let horizon = 0, roadTop = 0, roadBot = 0, laneH = 0;
    let lan = Math.floor((cfg.lan - 1) / 2), py = 0, px0 = 0, off = 0;
    let vat = [], sao = [], cay = [], may = [], hat = [];
    let dichVat = null;
    let dist = 0, cuon = 0, proxDot = 260;
    let soSao = 0, diemNhan = 0, soVaCham = 0, phanTramCu = -1;
    let dem = 3.2, demCu = 4;        // đếm ngược 3-2-1-Đi
    let bat = 0, cham = 0, lac = 0;  // bất tử sau va chạm, chậm lại, rung lắc
    let xong = false, tgXong = 0, daKetThuc = false;
    let chuaDieuKhien = true, dangKeo = false;
    let chay = true, t = 0, raf = 0, truocDo = 0, quanSat = null, bui = 0;

    function yLan(l) { return roadTop + laneH * (l + 0.5); }
    function tenXe(id) { return XE.filter(function (x) { return x.id === id; })[0].ten; }

    /* ----- Kích thước ----- */
    function doiCo() {
      const r = sanKhau.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
      const cuW = W;
      W = r.width; H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s = kep(Math.min(W / 900, H / 520), 0.5, 1.6);
      horizon = H * 0.2;
      roadTop = H * 0.36;
      roadBot = H * 0.93;
      laneH = (roadBot - roadTop) / cfg.lan;
      px0 = W * 0.22;
      py = yLan(lan);
      if (cuW) {
        const rx = W / cuW;
        vat.forEach(function (o) { o.x *= rx; });
        sao.forEach(function (q) { q.x *= rx; });
        cay.forEach(function (c) { c.x *= rx; });
        may.forEach(function (m) { m.x *= rx; });
        if (dichVat) dichVat.x *= rx;
      }
    }

    /* ----- Kích thước một vật thể vẽ ----- */
    function kichThuoc(id, caoTiLe, tiLeMacDinh) {
      const a = layAnh(id);
      const ar = anhSan(a) ? a.naturalWidth / a.naturalHeight : tiLeMacDinh;
      let h = laneH * caoTiLe, w = h * ar;
      if (w > laneH * 1.6) { w = laneH * 1.6; h = w / ar; }
      const gioiHan = Math.min(W * 0.26, 160 * s); // màn hẹp thì vật thể nhỏ lại, để khoảng cách giữa các đợt vẫn thoải mái
      if (w > gioiHan) { w = gioiHan; h = w / ar; }
      return { w: w, h: h };
    }
    function kichThuocVat(o) {
      if (o.kieu === 'non') { const h = laneH * CAO_NON; return { w: h * 0.8, h: h }; }
      return kichThuoc(o.id, o.cao, 1.2);
    }
    function kichThuocXeBe() { return kichThuoc(xeId, 0.95, 1.5); }

    /* ----- Nền: cây ven đường, mây ----- */
    function taoNen() {
      let x = -60 * s;
      while (x < W + 200 * s) {
        cay.push({ x: x, id: App.chon(CAY), cao: ngau(0.16, 0.22) });
        x += ngau(150, 260) * s;
      }
      for (let i = 0; i < 5; i++) may.push({ x: ngau(0, W), y: ngau(H * 0.02, H * 0.13), w: ngau(70, 130) * s, v: ngau(6, 14) });
    }

    /* ----- Sinh vật cản ----- */
    function taoDot() {
      const soChan = ngauNguyen(cfg.chan[0], Math.min(cfg.chan[1], cfg.lan - 1));
      const cacLan = [];
      for (let i = 0; i < cfg.lan; i++) cacLan.push(i);
      const tron = App.tron(cacLan);
      const chan = tron.slice(0, soChan), trong = tron.slice(soChan);
      const xTinh = W + 70 * s;
      // xe ngược chiều chạy nhanh hơn nên sinh ở xa hơn để cả đợt tới cùng lúc
      const xNguoc = px0 + (xTinh - px0) * (1 + TI_LE_NGUOC);
      chan.forEach(function (l) {
        if (Math.random() < cfg.xeNguoc) {
          const xe = App.chon(XE.filter(function (q) { return q.id !== xeId; }));
          vat.push({ kieu: 'xe', id: xe.id, ten: xe.ten.toLowerCase(), cao: 0.9, lan: l, x: xNguoc, tiLe: TI_LE_NGUOC, pha: 0, lat: false, dy: 0, vy: 0, vx: 0, rot: 0, vr: 0, va: false, t: 0 });
        } else if (Math.random() < 0.25) {
          vat.push({ kieu: 'non', id: 'non', ten: 'nón giao thông', cao: CAO_NON, lan: l, x: xTinh, tiLe: 0, pha: 0, lat: false, dy: 0, vy: 0, vx: 0, rot: 0, vr: 0, va: false, t: 0 });
        } else {
          const c = App.chon(VAT_CAN);
          vat.push({ kieu: 'thu', id: c.id, ten: c.ten, cao: c.cao, lan: l, x: xTinh, tiLe: 0, pha: ngau(0, 6.28), lat: Math.random() < 0.5, dy: 0, vy: 0, vx: 0, rot: 0, vr: 0, va: false, t: 0 });
        }
      });
      if (Math.random() < cfg.sao) {
        const l = App.chon(trong);
        for (let i = 0; i < 3; i++) sao.push({ lan: l, x: xTinh + i * 80 * s, pha: ngau(0, 6.28), nhat: false });
      }
    }

    /* ----- Điều khiển ----- */
    function doiLan(l) {
      l = kep(l, 0, cfg.lan - 1);
      if (l === lan) return;
      lan = l;
      chuaDieuKhien = false;
      AmThanh.phat('truot');
    }
    function lanTuY(y) { return kep(Math.floor((y - roadTop) / laneH), 0, cfg.lan - 1); }

    canvas.addEventListener('pointerdown', function (e) {
      const r = canvas.getBoundingClientRect();
      dangKeo = true;
      doiLan(lanTuY(e.clientY - r.top));
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!dangKeo) return;
      const r = canvas.getBoundingClientRect();
      doiLan(lanTuY(e.clientY - r.top));
    });
    function thaTay() { dangKeo = false; }
    window.addEventListener('pointerup', thaTay);
    window.addEventListener('pointercancel', thaTay);
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    k.querySelectorAll('.nut-lan').forEach(function (nut) {
      nut.addEventListener('pointerdown', function (e) {
        doiLan(lan + Number(nut.getAttribute('data-huong')));
        e.preventDefault();
      });
    });

    function phimBam(e) {
      const p = e.key;
      if (p === 'ArrowUp' || p === 'w' || p === 'W') { doiLan(lan - 1); e.preventDefault(); }
      else if (p === 'ArrowDown' || p === 's' || p === 'S') { doiLan(lan + 1); e.preventDefault(); }
    }
    window.addEventListener('keydown', phimBam);

    k.querySelector('#nut-doi-do-kho').addEventListener('click', function () {
      AmThanh.phat('nhan');
      dung();
      moDau();
    });

    /* ----- Hiệu ứng, điểm bay ----- */
    function diemBayTai(x, y, noiDung) {
      const r = canvas.getBoundingClientRect();
      App.diemBay({ getBoundingClientRect: function () { return { left: r.left + x, top: r.top + y, width: 0 }; } }, noiDung);
    }
    function rai(loai, x, y, so, tocDo, coMin, coMax, song) {
      for (let i = 0; i < so; i++) {
        const goc = (i / so) * Math.PI * 2 + ngau(-0.3, 0.3);
        hat.push({ loai: loai, x: x, y: y, vx: Math.cos(goc) * ngau(tocDo * 0.5, tocDo) * s, vy: Math.sin(goc) * ngau(tocDo * 0.5, tocDo) * s - 30 * s, r: ngau(coMin, coMax) * s, t: 0, song: ngau(song * 0.7, song) });
      }
    }

    /* ----- Nhặt sao / va chạm ----- */
    function nhatSao(q) {
      q.nhat = true;
      soSao++;
      oSao.textContent = soSao;
      const kq = DiemSo.traLoiDung();
      const them = kq.diem + kq.thuong;
      diemNhan += them;
      AmThanh.phat('bongVang');
      loiNhac.textContent = kq.thuong ? '🔥 ' + kq.chuoi + ' sao liên tiếp! Thưởng +' + kq.thuong + ' điểm' : App.chon(LOI_SAO);
      rai('sao', q.x, yLan(q.lan), 8, 150, 8, 13, 0.8);
      diemBayTai(q.x, yLan(q.lan) - laneH * 0.4, '+' + them);
    }

    function vaCham(o) {
      o.va = true;
      o.vx = ngau(120, 260) * s;
      o.vy = -ngau(380, 520) * s;
      o.vr = ngau(-8, 8);
      bat = 1.5; cham = 0.7; lac = 0.5;
      soVaCham++;
      DiemSo.traLoiSai(); // chỉ mất chuỗi thưởng, không trừ điểm
      AmThanh.phat('vaCham');
      rai('ngoi', px0 + off, py, 6, 170, 9, 14, 0.7);
      loiNhac.textContent = 'Ối! Bé đụng ' + o.ten + ' rồi, lần sau né sớm hơn nhé! 😅';
    }

    /* ----- Cập nhật ----- */
    function daXuatPhat() { return dem <= 0.8; }
    function tocDoDuong() {
      if (!daXuatPhat()) return 0;
      let f = 0.9 + 0.2 * Math.min(1, dist / cfg.dich);
      if (xong) f = 1.6;
      if (cham > 0) f *= 0.6;
      return cfg.toc * s * f;
    }

    function capNhat(dt) {
      t += dt;

      // đếm ngược
      if (dem > -1) {
        dem -= dt;
        const so = dem > 2.4 ? 3 : dem > 1.6 ? 2 : dem > 0.8 ? 1 : 0;
        if (so !== demCu) {
          demCu = so;
          AmThanh.phat('nhan');
          if (so === 0) loiNhac.textContent = 'Đi nào! Tránh vật cản và nhặt sao nhé! ⭐';
        }
      }
      if (bat > 0) bat -= dt;
      if (cham > 0) cham -= dt;
      if (lac > 0) lac -= dt;

      const v = tocDoDuong();
      cuon += v * dt;
      if (v > 0) dist += (v / s) * dt;

      // xe của bé lướt sang làn mới
      py += (yLan(lan) - py) * Math.min(1, dt * 12);
      if (xong) { tgXong += dt; off = Math.min(W * 0.5, 220 * s * tgXong * tgXong); }
      const px = px0 + off;
      const pw = kichThuocXeBe().w;

      // sinh vật cản và vạch đích
      if (!xong && daXuatPhat()) {
        if (!dichVat && dist >= cfg.dich - (W - px0) / s) dichVat = { x: W + 30 * s };
        if (!dichVat && dist >= proxDot && dist < cfg.dich - 1.3 * W / s) {
          taoDot();
          proxDot += cfg.khoang * ngau(0.9, 1.15);
        }
      }

      // vật cản
      vat.forEach(function (o) {
        if (o.va) {
          o.vy += 1100 * s * dt;
          o.dy += o.vy * dt; o.x += o.vx * dt; o.rot += o.vr * dt; o.t += dt;
          return;
        }
        o.x -= v * (1 + o.tiLe) * dt;
        if (bat <= 0 && !xong) {
          const d = kichThuocVat(o);
          // chỉ tính va chạm ở làn bé đang chọn: đổi làn xa thì xe lướt qua làn giữa mà không bị đụng oan
          if (o.lan === lan && Math.abs(o.x - px) < (d.w + pw) * 0.5 * 0.62 && Math.abs(yLan(lan) - py) < laneH * 0.5) vaCham(o);
        }
      });
      vat = vat.filter(function (o) { return o.x > -260 * s && o.dy < H * 1.2 && o.t < 1.4; });

      // sao
      sao.forEach(function (q) {
        q.x -= v * dt;
        if (!q.nhat && !xong && Math.abs(q.x - px) < pw * 0.5 + 20 * s && Math.abs(yLan(q.lan) - py) < laneH * 0.55) nhatSao(q);
      });
      sao = sao.filter(function (q) { return !q.nhat && q.x > -60 * s; });

      // về đích
      if (dichVat) {
        dichVat.x -= v * dt;
        if (!xong && dichVat.x < px) {
          xong = true;
          tgXong = 0;
          AmThanh.phat('bongVang');
          loiNhac.textContent = '🏁 Về đích rồi! Bé lái xe giỏi quá!';
          rai('sao', px, py, 16, 220, 9, 15, 1.1);
        }
      }
      if (xong && tgXong > 1.7 && !daKetThuc) { daKetThuc = true; ketThucLuot(); return; }

      // cây ven đường, mây
      cay.forEach(function (c) { c.x -= v * 0.9 * dt; });
      cay = cay.filter(function (c) { return c.x > -140 * s; });
      let xCuoi = cay.length ? cay[cay.length - 1].x : -60 * s;
      while (xCuoi < W + 120 * s) { xCuoi += ngau(150, 260) * s; cay.push({ x: xCuoi, id: App.chon(CAY), cao: ngau(0.16, 0.22) }); }
      may.forEach(function (m) {
        m.x -= (v * 0.05 + m.v * s) * dt;
        if (m.x < -m.w) { m.x = W + m.w; m.y = ngau(H * 0.02, H * 0.13); }
      });

      // khói xả
      bui += dt;
      if (v > 0 && bui > 0.07) {
        bui = 0;
        hat.push({ loai: 'khoi', x: px - pw * 0.48, y: py + laneH * 0.36, vx: -40 * s, vy: ngau(-14, -4) * s, r: ngau(4, 7) * s, t: 0, song: 0.55 });
      }

      // hạt hiệu ứng
      hat.forEach(function (p) {
        p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.loai === 'sao' || p.loai === 'ngoi') p.vy += 260 * s * dt;
      });
      hat = hat.filter(function (p) { return p.t < p.song; });

      // thanh quãng đường
      const tiLe = kep(dist / cfg.dich, 0, 1);
      const phanTram = Math.round(tiLe * 100);
      if (phanTram !== phanTramCu) {
        phanTramCu = phanTram;
        thanhDay.style.width = (4 + 92 * tiLe) + '%';
        xeNho.style.left = (4 + 92 * tiLe) + '%';
      }
    }

    /* ----- Vẽ ----- */
    function emoji(ky, x, y, co) {
      ctx.font = Math.round(co) + 'px ' + FONT_EMOJI;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(ky, x, y);
    }

    function veDoi(mau, nen, bienDo, chuKy, toc) {
      ctx.fillStyle = mau;
      ctx.beginPath(); ctx.moveTo(0, roadTop);
      for (let x = 0; x <= W + 10; x += 10) {
        const p = x + cuon * toc;
        ctx.lineTo(x, nen - bienDo * (0.6 * Math.sin(p / chuKy) + 0.4 * Math.sin(p / (chuKy * 0.47) + 1.3)));
      }
      ctx.lineTo(W, roadTop); ctx.closePath(); ctx.fill();
    }

    function veNen() {
      const gr = ctx.createLinearGradient(0, 0, 0, horizon + 30 * s);
      gr.addColorStop(0, '#7fd0ff'); gr.addColorStop(1, '#e3f7ff');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, roadTop);
      // mặt trời
      ctx.fillStyle = 'rgba(255,226,102,.35)';
      ctx.beginPath(); ctx.arc(W * 0.86, H * 0.11, 52 * s, 0, 6.29); ctx.fill();
      ctx.fillStyle = '#ffe066';
      ctx.beginPath(); ctx.arc(W * 0.86, H * 0.11, 34 * s, 0, 6.29); ctx.fill();
      // mây
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      may.forEach(function (m) {
        const h = m.w * 0.36;
        ctx.beginPath();
        ctx.ellipse(m.x, m.y, m.w * 0.5, h * 0.5, 0, 0, 6.29);
        ctx.ellipse(m.x - m.w * 0.24, m.y + h * 0.12, m.w * 0.28, h * 0.4, 0, 0, 6.29);
        ctx.ellipse(m.x + m.w * 0.26, m.y + h * 0.1, m.w * 0.3, h * 0.42, 0, 0, 6.29);
        ctx.fill();
      });
      // đồi xa, đồi gần, bãi cỏ
      veDoi('#a6e4a4', horizon + 4 * s, 30 * s, 210 * s, 0.05);
      veDoi('#7fd487', horizon + 22 * s, 18 * s, 150 * s, 0.1);
      ctx.fillStyle = '#5cc36c';
      ctx.fillRect(0, horizon + 24 * s, W, roadTop - horizon - 24 * s);
      ctx.fillStyle = '#4fb863';
      ctx.fillRect(0, roadBot, W, H - roadBot);
      // hoa nhỏ dưới đường
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      for (let i = 0; i < 12; i++) {
        const x = (((i * 137.5 * s - cuon * 0.9) % (W + 40 * s)) + W + 40 * s) % (W + 40 * s) - 20 * s;
        ctx.beginPath(); ctx.arc(x, roadBot + (H - roadBot) * (0.3 + 0.4 * ((i * 7) % 5) / 5), 3 * s, 0, 6.29); ctx.fill();
      }
    }

    function veCay() {
      const yGoc = roadTop - 5 * s;
      cay.forEach(function (c) {
        const a = layAnh(c.id);
        if (!anhSan(a)) return;
        const h = Math.min(H * c.cao, 220 * s), w = h * a.naturalWidth / a.naturalHeight;
        ctx.drawImage(a, c.x - w / 2, yGoc - h, w, h);
      });
    }

    function veDuong() {
      // mặt đường
      ctx.fillStyle = '#59616f';
      ctx.fillRect(0, roadTop, W, roadBot - roadTop);
      // lề đường sọc đỏ trắng chạy theo xe
      const dai = 44 * s, cao = 9 * s, x0 = -(cuon % (dai * 2));
      for (let i = 0; x0 + i * dai < W + dai; i++) {
        const x = x0 + i * dai;
        ctx.fillStyle = i % 2 === 0 ? '#ff5d6c' : '#ffffff';
        ctx.fillRect(x, roadTop - cao, dai + 1, cao);
        ctx.fillRect(x, roadBot, dai + 1, cao);
      }
      // vạch kẻ đường
      ctx.strokeStyle = 'rgba(255,255,255,.9)';
      ctx.lineWidth = 3 * s;
      ctx.beginPath(); ctx.moveTo(0, roadTop + 3 * s); ctx.lineTo(W, roadTop + 3 * s); ctx.moveTo(0, roadBot - 3 * s); ctx.lineTo(W, roadBot - 3 * s); ctx.stroke();
      ctx.lineWidth = 4 * s; ctx.lineCap = 'butt';
      const net = 46 * s, khe = 36 * s, chuKy = net + khe, dich = -(cuon % chuKy);
      ctx.setLineDash([net, khe]);
      ctx.lineDashOffset = -dich;
      for (let i = 1; i < cfg.lan; i++) {
        const y = roadTop + laneH * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
    }

    function veDich() {
      if (!dichVat) return;
      const x = dichVat.x, q = 13 * s;
      const soHang = Math.ceil((roadBot - roadTop) / q);
      for (let r = 0; r < soHang; r++) {
        for (let c = 0; c < 2; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#1f1f2e' : '#ffffff';
          ctx.fillRect(x - q + c * q, roadTop + r * q, q, Math.min(q, roadBot - roadTop - r * q));
        }
      }
      // cột cờ và biển ĐÍCH
      ctx.fillStyle = '#8a8fa3';
      ctx.fillRect(x - 4 * s, roadTop - 92 * s, 8 * s, 92 * s);
      ctx.fillStyle = '#ff5d6c';
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 4 * s, roadTop - 96 * s, 96 * s, 40 * s, 10 * s) : ctx.rect(x - 4 * s, roadTop - 96 * s, 96 * s, 40 * s);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '900 ' + Math.round(24 * s) + 'px ' + FONT_EMOJI;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ĐÍCH', x + 44 * s, roadTop - 76 * s);
    }

    function veNon(w, h) {
      const day = h * 0.14, dinh = -h / 2, thanDuoi = h / 2 - day;
      const nuaRong = w * 0.4;
      function rong(f) { return nuaRong * f; }
      function yTai(f) { return dinh + (thanDuoi - dinh) * f; }
      ctx.fillStyle = '#ff7a1a';
      ctx.beginPath(); ctx.moveTo(0, dinh); ctx.lineTo(nuaRong, thanDuoi); ctx.lineTo(-nuaRong, thanDuoi); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff';
      [[0.3, 0.46], [0.62, 0.78]].forEach(function (b) {
        ctx.beginPath();
        ctx.moveTo(-rong(b[0]), yTai(b[0])); ctx.lineTo(rong(b[0]), yTai(b[0]));
        ctx.lineTo(rong(b[1]), yTai(b[1])); ctx.lineTo(-rong(b[1]), yTai(b[1]));
        ctx.closePath(); ctx.fill();
      });
      ctx.fillStyle = '#3b3b4f';
      ctx.fillRect(-w * 0.5, thanDuoi, w, day);
    }

    function veVat(o) {
      const d = kichThuocVat(o);
      const yCh = yLan(o.lan) + laneH * 0.42 + o.dy;
      if (!o.va) {
        ctx.fillStyle = 'rgba(0,0,0,.2)';
        ctx.beginPath(); ctx.ellipse(o.x, yCh - 2 * s, d.w * 0.42, 6 * s, 0, 0, 6.29); ctx.fill();
      }
      ctx.save();
      ctx.translate(o.x, yCh - d.h / 2);
      if (o.va) { ctx.rotate(o.rot); ctx.globalAlpha = Math.max(0, 1 - o.t / 1.4); }
      else if (o.kieu === 'thu') ctx.translate(0, -Math.abs(Math.sin(t * 4 + o.pha)) * 3 * s);
      if (o.lat) ctx.scale(-1, 1); // xe ngược chiều giữ nguyên ảnh gốc (đã quay đầu sang trái)
      if (o.kieu === 'non') veNon(d.w, d.h);
      else {
        const a = layAnh(o.id);
        if (anhSan(a)) ctx.drawImage(a, -d.w / 2, -d.h / 2, d.w, d.h);
      }
      ctx.restore();
    }

    function veSao(q) {
      const y = yLan(q.lan) + Math.sin(t * 4 + q.pha) * 5 * s;
      ctx.save();
      ctx.translate(q.x, y);
      ctx.scale(Math.abs(Math.cos(t * 2.4 + q.pha)) * 0.4 + 0.6, 1);
      ctx.fillStyle = '#000';
      emoji('⭐', 0, 0, laneH * 0.5);
      ctx.restore();
    }

    function veXeBe() {
      const px = px0 + off, d = kichThuocXeBe();
      const yCh = py + laneH * 0.42;
      ctx.fillStyle = 'rgba(0,0,0,.22)';
      ctx.beginPath(); ctx.ellipse(px, yCh - 2 * s, d.w * 0.44, 7 * s, 0, 0, 6.29); ctx.fill();
      ctx.save();
      if (bat > 0 && Math.floor(t * 12) % 2 === 0) ctx.globalAlpha = 0.45;
      const nhun = tocDoDuong() > 0 ? Math.sin(t * 22) * 1.6 * s : 0;
      ctx.translate(px, yCh - d.h / 2 + nhun);
      ctx.rotate(((yLan(lan) - py) / laneH) * 0.3 + Math.sin(t * 45) * 0.1 * (lac / 0.5));
      ctx.scale(-1, 1); // ảnh gốc quay đầu sang trái, lật lại để đầu xe hướng về phía đường chạy (bên phải)
      const a = layAnh(xeId);
      if (anhSan(a)) ctx.drawImage(a, -d.w / 2, -d.h / 2, d.w, d.h);
      ctx.restore();
    }

    function veHat() {
      hat.forEach(function (p) {
        const con = 1 - p.t / p.song;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, con * 1.6));
        if (p.loai === 'khoi') {
          ctx.fillStyle = 'rgba(235,235,245,.85)';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.6 - con * 0.6), 0, 6.29); ctx.fill();
        } else {
          ctx.fillStyle = '#000';
          emoji(p.loai === 'ngoi' ? '✨' : '⭐', p.x, p.y, p.r * 2);
        }
        ctx.restore();
      });
    }

    function veGoiY() {
      if (!chuaDieuKhien || xong) return;
      const nhip = 0.5 + 0.5 * Math.sin(t * 5), px = px0;
      ctx.save();
      ctx.globalAlpha = 0.55 + 0.4 * nhip;
      ctx.fillStyle = '#000';
      if (lan > 0) emoji('⬆️', px, py - laneH * 0.95 - nhip * 6 * s, laneH * 0.42);
      if (lan < cfg.lan - 1) emoji('⬇️', px, py + laneH * 0.95 + nhip * 6 * s, laneH * 0.42);
      ctx.restore();
    }

    function veDemNguoc() {
      let chu = '';
      if (dem > 2.4) chu = '3'; else if (dem > 1.6) chu = '2'; else if (dem > 0.8) chu = '1'; else if (dem > -0.6) chu = 'Đi!';
      if (!chu) return;
      const pha = dem > 0 ? (((dem - 0.0) % 0.8) / 0.8) : 1;
      const co = (chu === 'Đi!' ? 150 : 130) * s * (1 + 0.25 * (dem > 0 ? pha : 0));
      ctx.save();
      ctx.globalAlpha = dem > 0 ? 1 : Math.max(0, 1 + dem / 0.6);
      ctx.font = '900 ' + Math.round(co) + 'px ' + FONT_EMOJI;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.lineWidth = 12 * s;
      ctx.strokeStyle = 'rgba(43,35,80,.85)';
      ctx.fillStyle = chu === 'Đi!' ? '#7dff8f' : '#ffd23f';
      ctx.strokeText(chu, W / 2, (roadTop + roadBot) / 2);
      ctx.fillText(chu, W / 2, (roadTop + roadBot) / 2);
      ctx.restore();
    }

    function ve() {
      ctx.clearRect(0, 0, W, H);
      veNen();
      veCay();
      veDuong();
      veDich();
      const gan = kep(Math.round((py - roadTop) / laneH - 0.5), 0, cfg.lan - 1);
      for (let l = 0; l < cfg.lan; l++) {
        sao.forEach(function (q) { if (q.lan === l) veSao(q); });
        vat.forEach(function (o) { if (o.lan === l && !o.va) veVat(o); });
        if (l === gan) veXeBe();
      }
      vat.forEach(function (o) { if (o.va) veVat(o); });
      veHat();
      veGoiY();
      veDemNguoc();
    }

    /* ----- Vòng lặp ----- */
    function vong(now) {
      if (!chay || phien !== soPhien) return;
      const dt = truocDo ? Math.min(0.05, (now - truocDo) / 1000) : 0.016;
      truocDo = now;
      capNhat(dt);
      if (!chay) return;
      ve();
      raf = requestAnimationFrame(vong);
    }

    function dung() {
      chay = false;
      cancelAnimationFrame(raf);
      if (quanSat) quanSat.disconnect();
      window.removeEventListener('keydown', phimBam);
      window.removeEventListener('pointerup', thaTay);
      window.removeEventListener('pointercancel', thaTay);
    }

    /* ----- Kết thúc lượt chơi ----- */
    function ketThucLuot() {
      if (phien !== soPhien) return;
      dung();
      document.body.classList.remove('dang-dua-xe');
      DiemSo.themDiem(10); // thưởng về đích
      diemNhan += 10;
      if (soVaCham === 0) {
        LuuTru.capNhatTroChoi(CAU_HINH.id, function (tc) { tc.khongVaCham = true; });
      }
      const soSaoDanhGia = soVaCham === 0 ? 3 : (soVaCham <= 2 ? 2 : 1);
      TroChoiChung.ketThuc(CAU_HINH, {
        doKho: doKho,
        diemNhan: diemNhan,
        soSao: soSaoDanhGia,
        thongDiep: 'Bé đã lái <b>' + tenXe(xeId).toLowerCase() + '</b> về đích, nhặt được <b>' + soSao + '</b> ngôi sao!',
        thongDiepPhu: soVaCham === 0
          ? '🛡️ Bé lái xe an toàn, không đụng vật cản nào luôn!'
          : '🚧 Bé đã đụng vật cản ' + soVaCham + ' lần. Lần sau mình né sớm hơn nhé!'
      }, {
        choiLai: function () { batDau(doKho, xeId); },
        doiDoKho: moDau
      });
    }

    /* ----- Chạy ----- */
    doiCo();
    taoNen();
    if (window.ResizeObserver) {
      quanSat = new ResizeObserver(doiCo);
      quanSat.observe(sanKhau);
    }
    raf = requestAnimationFrame(vong);
  }

  function moDau() {
    document.body.classList.remove('dang-dua-xe');
    TroChoiChung.chonDoKho(CAU_HINH, chonXe);
  }

  TroChoiChung.khoiDongTrang(moDau);
})();
