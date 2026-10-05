/* =========================================================
   TRÒ CHƠI: VƯỢT MÊ CUNG
   - 3 độ khó: Dễ / Trung bình / Khó (mê cung to dần, ít lối tắt hơn).
   - Mỗi độ khó gồm 5 màn. MỖI MÀN mê cung được sinh ngẫu nhiên lại
     và dùng một chủ đề nền khác (rừng, biển, vũ trụ, kẹo ngọt, ...).
   - Bé kéo ngón tay / chuột dọc theo lối đi, hoặc dùng phím mũi tên /
     nút mũi tên, để dẫn nhân vật tới đích. Nhặt ⭐ trên đường để đạt 3 sao.
   Nền và mê cung vẽ bằng canvas, nhân vật lấy từ assets/images/.
   ========================================================= */
(function () {
  'use strict';

  const SO_MAN = 5;
  const KICH_THUOC = {
    'de': [5, 5, 6, 6, 7],
    'trung-binh': [8, 8, 9, 10, 10],
    'kho': [11, 12, 13, 14, 15]
  };
  const TI_LE_LOI_TAT = { 'de': 0.14, 'trung-binh': 0.05, 'kho': 0 };   // mở thêm lối đi -> mê cung dễ hơn
  const SO_SAO_MOI_MAN = { 'de': 3, 'trung-binh': 4, 'kho': 5 };
  const SO_LAN_GOI_Y = { 'de': 3, 'trung-binh': 2, 'kho': 1 };
  const TOC_DO_BUOC = { 'de': 130, 'trung-binh': 105, 'kho': 90 };       // ms mỗi ô
  const DIEM_MOI_SAO = 2;
  const THOI_GIAN_GOI_Y = 3500;
  const FONT_EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const THU_MUC_ANH = '../../assets/images/';

  const CAU_HINH = {
    id: 'vuot-me-cung',
    ten: 'Vượt mê cung',
    bieuTuong: '🧭',
    huongDan: 'Kéo nhân vật theo lối đi để tìm đường tới đích. Nhớ nhặt thật nhiều ⭐ nhé!',
    moTaDoKho: {
      'de': '5 màn, mê cung nhỏ, nhiều lối tắt',
      'trung-binh': '5 màn, mê cung vừa',
      'kho': '5 màn, mê cung lớn, đường vòng vèo'
    }
  };

  /* ---------- Các chủ đề nền (mỗi màn một chủ đề khác nhau) ----------
     nen: 2 màu chuyển từ trên xuống   san: lớp phủ nền đường đi
     tuong: màu tường   tuongSang: viền sáng của tường
     trangTri: biểu tượng rải trên nền   nv / dich: ảnh nhân vật và đích đến */
  const CHU_DE = [
    { ten: 'Rừng xanh', bt: '🌳', nen: ['#c9f5a6', '#5fbf5a'], san: 'rgba(255,255,255,.34)', o2: 'rgba(255,255,255,.14)',
      tuong: '#2f7d32', tuongSang: '#7fd172', trangTri: ['🌲', '🌳', '🍃', '🍄', '🌼', '🦋'],
      nv: 'khi', dich: 'cay-chuoi', nhac: 'Giúp chú khỉ đi tìm nải chuối nhé!' },
    { ten: 'Đại dương', bt: '🌊', nen: ['#b5ecff', '#2a8fd6'], san: 'rgba(255,255,255,.30)', o2: 'rgba(255,255,255,.12)',
      tuong: '#0b5fa5', tuongSang: '#6cc3f5', trangTri: ['🐚', '🐟', '🌊', '🦀', '💧', '🐙'],
      nv: 'ca-vang', dich: 'sao-bien', nhac: 'Giúp cá vàng bơi tới chú sao biển nhé!' },
    { ten: 'Vũ trụ', bt: '🚀', nen: ['#3a2a8f', '#0c0c3a'], san: 'rgba(255,255,255,.10)', o2: 'rgba(255,255,255,.06)',
      tuong: '#8a7bff', tuongSang: '#d2c9ff', trangTri: ['⭐', '✨', '🪐', '🌙', '☄️', '🚀'],
      nv: 'gau', dich: 'hap-tinh', nhac: 'Giúp chú gấu bay tới hành tinh nhé!' },
    { ten: 'Xứ sở kẹo ngọt', bt: '🍭', nen: ['#ffe0f1', '#ffa8d4'], san: 'rgba(255,255,255,.38)', o2: 'rgba(255,255,255,.18)',
      tuong: '#e0409a', tuongSang: '#ff9fd2', trangTri: ['🍬', '🍭', '🧁', '🍩', '🍪', '🍰'],
      nv: 'heo', dich: 'dau-tay', nhac: 'Giúp chú heo hồng tìm quả dâu nhé!' },
    { ten: 'Sa mạc', bt: '🏜️', nen: ['#fff0b8', '#f0a94e'], san: 'rgba(255,255,255,.32)', o2: 'rgba(255,255,255,.14)',
      tuong: '#b3611f', tuongSang: '#f0b26a', trangTri: ['🌵', '☀️', '🪨', '🌴', '🦎', '🐫'],
      nv: 'lac-da', dich: 'cay-dua', nhac: 'Giúp chú lạc đà tìm cây dừa nhé!' },
    { ten: 'Xứ tuyết', bt: '❄️', nen: ['#f0faff', '#a3d2f2'], san: 'rgba(255,255,255,.40)', o2: 'rgba(255,255,255,.20)',
      tuong: '#4a86b8', tuongSang: '#a9d3f3', trangTri: ['❄️', '⛄', '🌨️', '🎿', '🧊', '🐧'],
      nv: 'gau-bac-cuc', dich: 'ca-hoi', nhac: 'Giúp gấu Bắc Cực tìm chú cá hồi nhé!' },
    { ten: 'Vườn hoa', bt: '🌸', nen: ['#ffe8f4', '#b9ecaa'], san: 'rgba(255,255,255,.36)', o2: 'rgba(255,255,255,.16)',
      tuong: '#c2417e', tuongSang: '#ff9cc8', trangTri: ['🌷', '🌸', '🌼', '🌺', '🐝', '🐞'],
      nv: 'buom', dich: 'huong-duong', nhac: 'Giúp bướm xinh bay tới bông hoa hướng dương nhé!' },
    { ten: 'Bầu trời', bt: '☁️', nen: ['#8fd3ff', '#eaf9ff'], san: 'rgba(255,255,255,.34)', o2: 'rgba(255,255,255,.16)',
      tuong: '#5b8def', tuongSang: '#a9c4ff', trangTri: ['☁️', '🎈', '🌈', '☀️', '🪁', '🕊️'],
      nv: 'chim-xanh', dich: 'cay-cam', nhac: 'Giúp chim xanh bay tới quả cam nhé!' }
  ];

  /* ---------- Mê cung ---------- */
  // Mỗi ô là một số: bit 1 = thông lên, 2 = thông phải, 4 = thông xuống, 8 = thông trái
  const HUONG = [
    { bit: 1, dx: 0, dy: -1 },
    { bit: 2, dx: 1, dy: 0 },
    { bit: 4, dx: 0, dy: 1 },
    { bit: 8, dx: -1, dy: 0 }
  ];
  const DOI = { 1: 4, 2: 8, 4: 1, 8: 2 };

  function taoMeCung(n, tiLeLoiTat) {
    const o = new Array(n * n).fill(0);
    const daTham = new Array(n * n).fill(false);
    const nganXep = [App.ngauNhien(0, n * n - 1)];
    daTham[nganXep[0]] = true;
    while (nganXep.length) {
      const c = nganXep[nganXep.length - 1];
      const x = c % n, y = Math.floor(c / n);
      const lang = HUONG.filter(function (h) {
        const nx = x + h.dx, ny = y + h.dy;
        return nx >= 0 && ny >= 0 && nx < n && ny < n && !daTham[ny * n + nx];
      });
      if (!lang.length) { nganXep.pop(); continue; }
      const h = App.chon(lang);
      const k = (y + h.dy) * n + (x + h.dx);
      o[c] |= h.bit;
      o[k] |= DOI[h.bit];
      daTham[k] = true;
      nganXep.push(k);
    }
    if (tiLeLoiTat > 0) {          // đục thêm vài bức tường để có nhiều đường đi hơn
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const c = y * n + x;
          if (x < n - 1 && !(o[c] & 2) && Math.random() < tiLeLoiTat) { o[c] |= 2; o[c + 1] |= 8; }
          if (y < n - 1 && !(o[c] & 4) && Math.random() < tiLeLoiTat) { o[c] |= 4; o[c + n] |= 1; }
        }
      }
    }
    return o;
  }

  function laySangO(o, n, c) {
    const x = c % n, y = Math.floor(c / n);
    return HUONG.filter(function (h) { return o[c] & h.bit; }).map(function (h) { return (y + h.dy) * n + (x + h.dx); });
  }

  // Khoảng cách (số bước) từ ô bắt đầu tới mọi ô
  function khoangCach(o, n, batDau) {
    const d = new Array(n * n).fill(-1);
    const hang = [batDau];
    d[batDau] = 0;
    for (let i = 0; i < hang.length; i++) {
      laySangO(o, n, hang[i]).forEach(function (k) {
        if (d[k] < 0) { d[k] = d[hang[i]] + 1; hang.push(k); }
      });
    }
    return d;
  }

  // Đường đi ngắn nhất (không gồm ô xuất phát). Trả về null nếu xa hơn toiDa bước.
  function duongDi(o, n, tu, den, toiDa) {
    if (tu === den) return [];
    const cha = {};
    cha[tu] = -1;
    let tang = [tu];
    for (let buoc = 1; buoc <= toiDa && tang.length; buoc++) {
      const tiep = [];
      for (let i = 0; i < tang.length; i++) {
        const sang = laySangO(o, n, tang[i]);
        for (let j = 0; j < sang.length; j++) {
          const k = sang[j];
          if (k in cha) continue;
          cha[k] = tang[i];
          if (k === den) {
            const kq = [];
            for (let c = den; c !== tu; c = cha[c]) kq.unshift(c);
            return kq;
          }
          tiep.push(k);
        }
      }
      tang = tiep;
    }
    return null;
  }

  /* ---------- Ảnh ---------- */
  const boNhoAnh = {};
  function layAnh(ten) {
    if (!boNhoAnh[ten]) {
      const a = new Image();
      a.src = THU_MUC_ANH + ten + '.png';
      boNhoAnh[ten] = a;
    }
    return boNhoAnh[ten];
  }
  function anhSanSang(a) { return a && a.complete && a.naturalWidth > 0; }

  function veAnhTrongO(ctx, a, cx, cy, canh) {
    const tiLe = Math.min(canh / a.naturalWidth, canh / a.naturalHeight);
    const w = a.naturalWidth * tiLe, h = a.naturalHeight * tiLe;
    ctx.drawImage(a, cx - w / 2, cy - h / 2, w, h);
  }

  /* ---------- Trò chơi ---------- */
  function batDau(doKho) {
    const k = document.getElementById('khu-tro-choi');
    const kichThuocMan = KICH_THUOC[doKho];
    const tongMan = kichThuocMan.length || SO_MAN;
    const dsChuDe = App.tron(CHU_DE).slice(0, tongMan);   // mỗi màn một chủ đề, không trùng nhau
    const tocDo = TOC_DO_BUOC[doKho];

    let man = 0;
    let diemNhan = 0;
    let saoNhatDuoc = 0;
    let tongSaoCoThe = 0;
    let daDon = false;

    // Trạng thái của một màn
    let n = 0, o = [], chuDe = null, batDauO = 0, dich = 0, khoang = [];
    let saoViTri = [], saoDaNhat = {}, trangTri = [], vet = [];
    let viTri = 0, buocDi = null, hangDoi = [], daThang = false;
    let goiYConLai = 0, goiYDen = 0, goiYDuong = [];
    let kichThuoc = 0, le = 0, canhO = 0, dpr = 1;
    let rafId = 0, quanSat = null, dangKeo = false;
    let anhNV = null, anhDich = null;

    const lopTinh = document.createElement('canvas');   // lớp nền + tường vẽ sẵn

    document.body.classList.add('dang-choi-me-cung');
    DiemSo.datLaiChuoi();

    k.innerHTML =
      '<section class="man-me-cung">' +
        '<div class="thanh-thong-tin">' +
          '<button type="button" class="nut nut-tron nut-trang nut-nho" id="nut-doi-do-kho" aria-label="Đổi độ khó" title="Đổi độ khó">🎚️</button>' +
          '<span class="o-thong-tin">🚩 Màn <b id="so-man">1</b>/' + tongMan + '</span>' +
          '<span class="o-thong-tin o-ten-chu-de" id="ten-chu-de"></span>' +
          '<span class="o-thong-tin" id="o-sao">⭐ <b id="so-sao">0</b>/<span id="tong-sao">0</span></span>' +
          '<button type="button" class="nut nut-vang nut-nho nut-goi-y-me-cung" id="nut-goi-y" aria-label="Gợi ý đường đi" title="Gợi ý đường đi">💡 <b id="so-goi-y">0</b></button>' +
          '<button type="button" class="nut nut-tron nut-trang nut-nho" id="nut-me-cung-moi" aria-label="Đổi mê cung khác" title="Đổi mê cung khác">🔀</button>' +
        '</div>' +
        '<p class="huong-dan" id="loi-nhac"></p>' +
        '<div class="khu-me-cung" id="khu-me-cung">' +
          '<canvas class="ban-me-cung" id="ban-me-cung" aria-label="Mê cung"></canvas>' +
          '<div class="lop-thang" id="lop-thang" hidden></div>' +
        '</div>' +
        '<div class="nut-huong" aria-label="Nút mũi tên">' +
          '<button type="button" class="nut nut-trang" data-huong="3" aria-label="Sang trái">◀️</button>' +
          '<button type="button" class="nut nut-trang" data-huong="0" aria-label="Lên">🔼</button>' +
          '<button type="button" class="nut nut-trang" data-huong="2" aria-label="Xuống">🔽</button>' +
          '<button type="button" class="nut nut-trang" data-huong="1" aria-label="Sang phải">▶️</button>' +
        '</div>' +
      '</section>';

    const khuMeCung = k.querySelector('#khu-me-cung');
    const canvas = k.querySelector('#ban-me-cung');
    const ctx = canvas.getContext('2d');
    const loiNhac = k.querySelector('#loi-nhac');
    const lopThang = k.querySelector('#lop-thang');
    const nutGoiY = k.querySelector('#nut-goi-y');

    /* ----- Chuẩn bị một màn ----- */
    function vaoMan(chiSo, giuChuDe) {
      man = chiSo;
      daThang = false;
      lopThang.hidden = true;
      n = kichThuocMan[man];
      o = taoMeCung(n, TI_LE_LOI_TAT[doKho]);
      if (!giuChuDe || !chuDe) chuDe = dsChuDe[man];
      anhNV = layAnh(chuDe.nv);
      anhDich = layAnh(chuDe.dich);

      // Điểm xuất phát: một trong 4 góc; đích: ô xa nhất tính theo đường đi
      batDauO = App.chon([0, n - 1, n * (n - 1), n * n - 1]);
      khoang = khoangCach(o, n, batDauO);
      dich = 0;
      for (let i = 0; i < khoang.length; i++) if (khoang[i] > khoang[dich]) dich = i;

      // Rải ⭐ ở các ô cách xa điểm xuất phát một chút
      const coThe = [];
      for (let i = 0; i < n * n; i++) if (i !== batDauO && i !== dich && khoang[i] >= 3) coThe.push(i);
      saoViTri = App.layNhieu(coThe, SO_SAO_MOI_MAN[doKho]);
      saoDaNhat = {};
      vet = [];

      // Vị trí các hình trang trí trên nền (tỉ lệ 0..1 để vẽ lại khi đổi kích thước)
      trangTri = [];
      const soTrangTri = 10 + n;
      for (let i = 0; i < soTrangTri; i++) {
        trangTri.push({
          x: 0.06 + Math.random() * 0.88, y: 0.06 + Math.random() * 0.88,
          bt: App.chon(chuDe.trangTri),
          co: 0.06 + Math.random() * 0.05,            // cỡ theo cạnh bảng, không theo ô
          xoay: (Math.random() - 0.5) * 0.7
        });
      }
      const vong = [];
      for (let i = 0; i < 6; i++) vong.push({ x: Math.random(), y: Math.random(), r: 0.12 + Math.random() * 0.18 });
      trangTri.vong = vong;

      viTri = batDauO;
      buocDi = null;
      hangDoi = [];
      goiYConLai = SO_LAN_GOI_Y[doKho];
      goiYDen = 0;
      goiYDuong = [];
      dangKeo = false;

      khuMeCung.style.background = 'linear-gradient(180deg,' + chuDe.nen[0] + ',' + chuDe.nen[1] + ')';
      khuMeCung.classList.remove('vao-man');
      void khuMeCung.offsetWidth;
      khuMeCung.classList.add('vao-man');

      k.querySelector('#so-man').textContent = String(man + 1);
      k.querySelector('#ten-chu-de').textContent = chuDe.bt + ' ' + chuDe.ten;
      k.querySelector('#so-sao').textContent = '0';
      k.querySelector('#tong-sao').textContent = String(saoViTri.length);
      capNhatNutGoiY();
      loiNhac.textContent = chuDe.nhac;

      tinhKichThuoc();
      veLopTinh();
    }

    function capNhatNutGoiY() {
      k.querySelector('#so-goi-y').textContent = String(goiYConLai);
      nutGoiY.disabled = goiYConLai <= 0 || daThang;
    }

    /* ----- Kích thước ----- */
    function tinhKichThuoc() {
      const r = khuMeCung.getBoundingClientRect();
      const canh = Math.floor(Math.min(r.width, r.height) - 12);
      if (canh < 120) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      if (canh === kichThuoc && canvas.width === Math.round(canh * dpr)) return true;
      kichThuoc = canh;
      canvas.style.width = canh + 'px';
      canvas.style.height = canh + 'px';
      canvas.width = Math.round(canh * dpr);
      canvas.height = Math.round(canh * dpr);
      le = Math.max(6, canh * 0.025);
      canhO = (canh - 2 * le) / n;
      return true;
    }

    function tamO(c) {
      return { x: le + (c % n + 0.5) * canhO, y: le + (Math.floor(c / n) + 0.5) * canhO };
    }

    /* ----- Vẽ lớp nền + tường (chỉ vẽ lại khi đổi màn / đổi kích thước) ----- */
    function veLopTinh() {
      if (!kichThuoc) return;
      canhO = (kichThuoc - 2 * le) / n;
      lopTinh.width = Math.round(kichThuoc * dpr);
      lopTinh.height = Math.round(kichThuoc * dpr);
      const g = lopTinh.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const S = kichThuoc;

      // Nền chuyển màu
      const nen = g.createLinearGradient(0, 0, 0, S);
      nen.addColorStop(0, chuDe.nen[0]);
      nen.addColorStop(1, chuDe.nen[1]);
      g.fillStyle = nen;
      g.fillRect(0, 0, S, S);

      // Các đốm sáng mờ
      trangTri.vong.forEach(function (v) {
        const gr = g.createRadialGradient(v.x * S, v.y * S, 0, v.x * S, v.y * S, v.r * S);
        gr.addColorStop(0, 'rgba(255,255,255,.28)');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr;
        g.fillRect(0, 0, S, S);
      });

      // Hình trang trí theo chủ đề
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      trangTri.forEach(function (t) {
        g.save();
        g.translate(t.x * S, t.y * S);
        g.rotate(t.xoay);
        g.globalAlpha = 0.42;
        g.fillStyle = '#000';
        g.font = Math.round(S * t.co) + 'px ' + FONT_EMOJI;
        g.fillText(t.bt, 0, 0);
        g.restore();
      });

      // Nền đường đi (caro nhẹ để bé dễ nhìn từng ô)
      g.fillStyle = chuDe.san;
      g.fillRect(le, le, S - 2 * le, S - 2 * le);
      g.fillStyle = chuDe.o2;
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          if ((x + y) % 2 === 0) g.fillRect(le + x * canhO, le + y * canhO, canhO, canhO);
        }
      }

      // Tường: gom mọi đoạn thành một đường vẽ
      const doan = [];
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const c = y * n + x;
          const x0 = le + x * canhO, y0 = le + y * canhO;
          if (y === 0 && !(o[c] & 1)) doan.push([x0, y0, x0 + canhO, y0]);
          if (x === 0 && !(o[c] & 8)) doan.push([x0, y0, x0, y0 + canhO]);
          if (!(o[c] & 2)) doan.push([x0 + canhO, y0, x0 + canhO, y0 + canhO]);
          if (!(o[c] & 4)) doan.push([x0, y0 + canhO, x0 + canhO, y0 + canhO]);
        }
      }
      function duongTuong(dx, dy) {
        g.beginPath();
        doan.forEach(function (d) { g.moveTo(d[0] + dx, d[1] + dy); g.lineTo(d[2] + dx, d[3] + dy); });
      }
      g.lineCap = 'round';
      g.lineJoin = 'round';
      const day = Math.max(4, canhO * 0.2);
      duongTuong(0, day * 0.28);                       // bóng đổ
      g.strokeStyle = 'rgba(43,35,80,.28)';
      g.lineWidth = day;
      g.stroke();
      duongTuong(0, 0);                                // thân tường
      g.strokeStyle = chuDe.tuong;
      g.lineWidth = day;
      g.stroke();
      duongTuong(0, -day * 0.12);                      // viền sáng
      g.strokeStyle = chuDe.tuongSang;
      g.lineWidth = Math.max(1.5, day * 0.3);
      g.globalAlpha = 0.85;
      g.stroke();
      g.globalAlpha = 1;
    }

    /* ----- Vẽ từng khung hình ----- */
    function ve(bayGio) {
      if (!kichThuoc) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, kichThuoc, kichThuoc);
      ctx.drawImage(lopTinh, 0, 0, kichThuoc, kichThuoc);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Vết chân nhẹ nhàng
      if (vet.length > 1) {
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        vet.forEach(function (c) {
          const p = tamO(c);
          ctx.beginPath();
          ctx.arc(p.x, p.y, canhO * 0.07, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Đường gợi ý
      if (bayGio < goiYDen && goiYDuong.length) {
        const mo = Math.min(1, (goiYDen - bayGio) / 600);
        const dem = goiYDuong.length;
        for (let i = 0; i < dem; i++) {
          const p = tamO(goiYDuong[i]);
          const nhip = 0.55 + 0.45 * Math.sin(bayGio / 140 - i * 0.6);
          ctx.globalAlpha = mo * nhip;
          ctx.fillStyle = '#ffd23f';
          ctx.beginPath();
          ctx.arc(p.x, p.y, canhO * 0.16, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = Math.max(1.5, canhO * 0.04);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Các ngôi sao chưa nhặt (đặt lại màu tô đục, nếu không emoji sẽ bị mờ theo màu của khung trước)
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      saoViTri.forEach(function (c) {
        if (saoDaNhat[c]) return;
        const p = tamO(c);
        const phong = 1 + 0.12 * Math.sin(bayGio / 260 + c);
        ctx.font = Math.round(canhO * 0.62 * phong) + 'px ' + FONT_EMOJI;
        ctx.fillText('⭐', p.x, p.y + Math.sin(bayGio / 300 + c) * canhO * 0.03);
      });

      // Đích đến: vầng sáng + hình
      const pd = tamO(dich);
      const nhipDich = 1 + 0.08 * Math.sin(bayGio / 220);
      const gr = ctx.createRadialGradient(pd.x, pd.y, 0, pd.x, pd.y, canhO * 0.75 * nhipDich);
      gr.addColorStop(0, 'rgba(255,236,120,.95)');
      gr.addColorStop(1, 'rgba(255,236,120,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(pd.x, pd.y, canhO * 0.75 * nhipDich, 0, Math.PI * 2);
      ctx.fill();
      if (anhSanSang(anhDich)) veAnhTrongO(ctx, anhDich, pd.x, pd.y, canhO * 0.78 * nhipDich);
      else { ctx.fillStyle = '#000'; ctx.font = Math.round(canhO * 0.6) + 'px ' + FONT_EMOJI; ctx.fillText('🏁', pd.x, pd.y); }

      // Nhân vật
      let px, py;
      const a = tamO(viTri);
      if (buocDi) {
        const b = tamO(buocDi.den);
        const t = Math.min(1, (bayGio - buocDi.batDau) / tocDo);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        px = a.x + (b.x - a.x) * e;
        py = a.y + (b.y - a.y) * e;
      } else { px = a.x; py = a.y; }
      const nhun = Math.sin(bayGio / 180) * canhO * 0.025;
      ctx.fillStyle = 'rgba(43,35,80,.22)';                // bóng dưới chân
      ctx.beginPath();
      ctx.ellipse(px, py + canhO * 0.36, canhO * 0.26, canhO * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      if (anhSanSang(anhNV)) veAnhTrongO(ctx, anhNV, px, py + nhun, canhO * 0.84);
      else { ctx.fillStyle = '#000'; ctx.font = Math.round(canhO * 0.6) + 'px ' + FONT_EMOJI; ctx.fillText('🐻', px, py); }
    }

    /* ----- Chuyển động ----- */
    function xuLyBuoc(bayGio) {
      if (daThang) return;
      if (buocDi && bayGio - buocDi.batDau >= tocDo) {
        viTri = buocDi.den;
        buocDi = null;
        denODich();
      }
      if (!buocDi && !daThang && hangDoi.length) {
        const den = hangDoi.shift();
        if (laySangO(o, n, viTri).indexOf(den) < 0) { hangDoi = []; return; }
        if (vet.length > 60) vet.shift();
        vet.push(viTri);
        buocDi = { den: den, batDau: bayGio };
        AmThanh.phat('latThe');
      }
    }

    function denODich() {
      if (saoViTri.indexOf(viTri) >= 0 && !saoDaNhat[viTri]) {
        saoDaNhat[viTri] = true;
        const soNhat = Object.keys(saoDaNhat).length;
        saoNhatDuoc++;
        diemNhan += DIEM_MOI_SAO;
        DiemSo.themDiem(DIEM_MOI_SAO);
        k.querySelector('#so-sao').textContent = String(soNhat);
        App.diemBay(k.querySelector('#o-sao'), '+' + DIEM_MOI_SAO);
        AmThanh.phat('ding');
      }
      if (viTri === dich) thangMan();
    }

    function themBuoc(chiSoHuong) {
      if (daThang) return;
      const cuoi = hangDoi.length ? hangDoi[hangDoi.length - 1] : (buocDi ? buocDi.den : viTri);
      const h = HUONG[chiSoHuong];
      if (!(o[cuoi] & h.bit)) return;                                // có tường: đứng yên
      if (hangDoi.length >= 2) return;
      hangDoi.push((Math.floor(cuoi / n) + h.dy) * n + (cuoi % n + h.dx));
    }

    /* ----- Điều khiển bằng ngón tay / chuột: kéo dọc theo lối đi ----- */
    function oTuToaDo(ev) {
      const r = canvas.getBoundingClientRect();
      const x = (ev.clientX - r.left) * (kichThuoc / r.width);
      const y = (ev.clientY - r.top) * (kichThuoc / r.height);
      const cx = Math.floor((x - le) / canhO), cy = Math.floor((y - le) / canhO);
      if (cx < 0 || cy < 0 || cx >= n || cy >= n) return -1;
      return cy * n + cx;
    }

    function keoToi(ev) {
      if (!dangKeo || daThang) return;
      const dich2 = oTuToaDo(ev);
      if (dich2 < 0) return;
      const hienTai = hangDoi.length ? hangDoi[hangDoi.length - 1] : (buocDi ? buocDi.den : viTri);
      if (dich2 === hienTai) return;
      // Chỉ đi theo khi ngón tay ở gần (tối đa 3 ô theo lối đi) - phải kéo dọc theo đường, không "bay" thẳng tới đích
      const duong = duongDi(o, n, hienTai, dich2, 3);
      if (duong && duong.length) hangDoi = hangDoi.concat(duong).slice(0, 4);
    }

    canvas.addEventListener('pointerdown', function (ev) {
      dangKeo = true;
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* bỏ qua */ }
      keoToi(ev);
      ev.preventDefault();
    });
    canvas.addEventListener('pointermove', keoToi);
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ten) {
      canvas.addEventListener(ten, function () { dangKeo = false; });
    });

    /* ----- Bàn phím ----- */
    const PHIM = { ArrowUp: 0, w: 0, W: 0, ArrowRight: 1, d: 1, D: 1, ArrowDown: 2, s: 2, S: 2, ArrowLeft: 3, a: 3, A: 3 };
    function khiNhanPhim(ev) {
      if (!(ev.key in PHIM)) return;
      ev.preventDefault();
      themBuoc(PHIM[ev.key]);
    }
    window.addEventListener('keydown', khiNhanPhim);

    /* ----- Nút mũi tên trên màn hình ----- */
    k.querySelectorAll('.nut-huong .nut').forEach(function (nut) {
      let lap = 0;
      const dung = function () { clearInterval(lap); lap = 0; };
      nut.addEventListener('pointerdown', function (ev) {
        ev.preventDefault();
        const h = Number(nut.getAttribute('data-huong'));
        themBuoc(h);
        dung();
        lap = setInterval(function () { themBuoc(h); }, tocDo + 20);
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ten) { nut.addEventListener(ten, dung); });
    });

    /* ----- Gợi ý, đổi mê cung, đổi độ khó ----- */
    nutGoiY.addEventListener('click', function () {
      if (goiYConLai <= 0 || daThang) return;
      const tu = buocDi ? buocDi.den : viTri;
      goiYDuong = duongDi(o, n, tu, dich, n * n) || [];
      goiYDen = performance.now() + THOI_GIAN_GOI_Y;
      goiYConLai--;
      capNhatNutGoiY();
      AmThanh.phat('nhan');
    });

    k.querySelector('#nut-me-cung-moi').addEventListener('click', function () {
      AmThanh.phat('nhan');
      // Mê cung mới + nền mới cho cùng màn này
      chuDe = App.chon(CHU_DE.filter(function (c) { return c !== chuDe; }));
      vaoMan(man, true);
    });

    k.querySelector('#nut-doi-do-kho').addEventListener('click', function () {
      AmThanh.phat('nhan');
      don();
      TroChoiChung.chonDoKho(CAU_HINH, batDau);
    });

    /* ----- Thắng một màn ----- */
    function thangMan() {
      daThang = true;
      hangDoi = [];
      goiYDen = 0;
      capNhatNutGoiY();
      const kq = DiemSo.traLoiDung();
      diemNhan += kq.diem + kq.thuong;
      const soNhat = Object.keys(saoDaNhat).length;
      tongSaoCoThe += saoViTri.length;
      const laManCuoi = man >= tongMan - 1;
      AmThanh.phat('dung');
      App.phaoGiay(22);
      lopThang.innerHTML =
        '<div class="the-thang">' +
          '<div class="bt-thang" aria-hidden="true">🎉</div>' +
          '<h2>' + (laManCuoi ? 'Bé đã vượt hết mê cung!' : 'Bé tìm ra đường rồi!') + '</h2>' +
          '<p>Nhặt được ⭐ ' + soNhat + '/' + saoViTri.length + ' · +' + (kq.diem + kq.thuong) + ' điểm' +
            (kq.thuong ? ' (thưởng ' + kq.chuoi + ' màn liên tiếp 🔥)' : '') + '</p>' +
          '<button type="button" class="nut ' + (laManCuoi ? 'nut-vang' : 'nut-xanh') + '" id="nut-man-tiep">' +
            (laManCuoi ? '🏆 Xem kết quả' : '➡️ Màn tiếp theo') + '</button>' +
        '</div>';
      lopThang.hidden = false;
      k.querySelector('#nut-man-tiep').addEventListener('click', function () {
        AmThanh.phat('nhan');
        if (laManCuoi) ketThucLuot();
        else vaoMan(man + 1, false);
      });
    }

    function ketThucLuot() {
      don();
      TroChoiChung.ketThuc(CAU_HINH, {
        doKho: doKho,
        diemNhan: diemNhan,
        danhGia: tongSaoCoThe ? saoNhatDuoc / tongSaoCoThe : 1,
        thongDiep: 'Bé đã vượt qua <b>' + tongMan + '</b> mê cung và nhặt được <b>' + saoNhatDuoc + '/' + tongSaoCoThe + '</b> ngôi sao!'
      }, {
        choiLai: function () { batDau(doKho); },
        doiDoKho: function () { TroChoiChung.chonDoKho(CAU_HINH, batDau); }
      });
    }

    /* ----- Vòng lặp, dọn dẹp ----- */
    function vong(bayGio) {
      if (daDon) return;
      xuLyBuoc(bayGio);
      ve(bayGio);
      rafId = requestAnimationFrame(vong);
    }

    function khiDoiKichThuoc() {
      if (daDon) return;
      if (tinhKichThuoc()) veLopTinh();
    }

    function don() {
      if (daDon) return;
      daDon = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', khiNhanPhim);
      window.removeEventListener('resize', khiDoiKichThuoc);
      if (quanSat) quanSat.disconnect();
      document.body.classList.remove('dang-choi-me-cung');
    }

    window.addEventListener('resize', khiDoiKichThuoc);
    if (window.ResizeObserver) {
      quanSat = new ResizeObserver(khiDoiKichThuoc);
      quanSat.observe(khuMeCung);
    }

    vaoMan(0, false);
    // Một số trình duyệt chưa đo xong khung ở lần đầu: thử lại sau khi trình duyệt dàn trang
    requestAnimationFrame(function () { khiDoiKichThuoc(); });
    rafId = requestAnimationFrame(vong);
  }

  function moDau() {
    TroChoiChung.chonDoKho(CAU_HINH, batDau);
  }

  TroChoiChung.khoiDongTrang(moDau);
})();
