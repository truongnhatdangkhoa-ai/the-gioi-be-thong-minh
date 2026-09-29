/* =========================================================
   TRÒ CHƠI: TÔ MÀU
   Hai màn hình:
   - Chọn tranh: lưới các bức tranh, chạm vào để tô
   - Tô tranh:   chỉ còn bức tranh thật to và thanh công cụ gọn
   Hai lớp canvas khi tô:
   - lớp màu (bên dưới): nơi bé tô
   - lớp nét vẽ (bên trên, trong suốt): giữ nét viền luôn rõ
   ========================================================= */
(function () {
  'use strict';

  const KT = 800; // kích thước bên trong canvas (bằng kích thước tranh)
    const BANG_MAU = ['#ff4d4d', '#ff9f1c', '#ffd60a', '#7ed957', '#2ec4b6', '#4dabf7',
    '#5f6cf5', '#b86bff', '#ff6fb5', '#a0522d', '#ffe0bd', '#8d99ae', '#222233', '#ffffff'];
  const TEN_MAU = ['Đỏ', 'Cam', 'Vàng', 'Xanh lá', 'Xanh ngọc', 'Xanh da trời', 'Xanh dương', 'Tím',
    'Hồng', 'Nâu', 'Màu da', 'Xám', 'Đen', 'Trắng (tẩy)'];
  const SO_BUOC_HOAN_TAC = 6;

  /* ---------- Các bức tranh: lấy từ tranh-to-mau.js ---------- */
  const TRANH = (typeof TRANH_TO_MAU !== 'undefined') ? TRANH_TO_MAU : [];
  const boNhoAnh = {}; // id -> Image đã tải

  function taiAnh(tranh, xong) {
    if (boNhoAnh[tranh.id] && boNhoAnh[tranh.id].complete) { xong(boNhoAnh[tranh.id]); return; }
    const anh = new Image();
    anh.onload = function () { boNhoAnh[tranh.id] = anh; xong(anh); };
    anh.onerror = function () { App.thongBao('Không mở được tranh này, bé chọn tranh khác nhé!'); };
    anh.src = tranh.anh;
  }

  /* ---------- Trạng thái ---------- */
  let tranhHienTai = TRANH[0];
  let mauDangChon = BANG_MAU[0];
  let cheDo = 'do-mau';
  let lopMau, ctxMau, lopNet, ctxNet, matNaTuong;
  let soThaoTac = 0;
  let nganHoanTac = [];
  const k = document.getElementById('khu-tro-choi');

  /* ---------- Màn 1: chọn tranh ---------- */
  function daXong(id) {
    const tc = LuuTru.layTroChoi('to-mau');
    return !!(tc.tranhDaXong && tc.tranhDaXong[id]);
  }

  function veChonTranh() {
    document.body.classList.remove('dang-to');
    k.innerHTML =
      '<section class="man-chon-tranh">' +
        '<div class="tieu-de-tro-choi tieu-de-gon">' + TroChoiChung.anhTieuDe('to-mau') + '<h1>Chọn tranh để tô</h1></div>' +
        '<p class="huong-dan">Bé chạm vào bức tranh mình thích nhé!</p>' +
        '<div class="luoi-tranh">' +
          TRANH.map(function (t) {
            return '<button type="button" class="the-tranh" data-tranh="' + t.id + '" aria-label="' + t.ten + (daXong(t.id) ? ' (đã tô xong)' : '') + '">' +
              '<img src="' + t.anh + '" alt="" draggable="false">' +
              '<span class="ten-tranh">' + t.ten + '</span>' +
              (daXong(t.id) ? '<span class="dau-xong" aria-hidden="true">✓</span>' : '') +
            '</button>';
          }).join('') +
        '</div>' +
      '</section>';
    k.querySelectorAll('.the-tranh').forEach(function (n) {
      n.addEventListener('click', function () {
        const t = TRANH.filter(function (x) { return x.id === n.getAttribute('data-tranh'); })[0];
        if (!t) return;
        AmThanh.phat('nhan');
        tranhHienTai = t;
        veKhung();
      });
    });
    window.scrollTo(0, 0);
  }

  /* ---------- Màn 2: tô tranh (chỉ có tranh + công cụ) ---------- */
  function veKhung() {
    document.body.classList.add('dang-to');
    k.innerHTML =
      '<section class="man-to">' +
        '<div class="to-khung">' +
          '<canvas id="lop-mau" width="' + KT + '" height="' + KT + '"></canvas>' +
          '<canvas id="lop-net" width="' + KT + '" height="' + KT + '" aria-label="Bức tranh ' + tranhHienTai.ten + '"></canvas>' +
        '</div>' +
        '<div class="to-cong-cu">' +
          '<div class="to-nut" role="group" aria-label="Công cụ">' +
            '<button type="button" class="to-btn" id="nut-ve-lai" aria-label="Chọn tranh khác" title="Chọn tranh khác">⬅️</button>' +
            '<button type="button" class="to-btn nut-che-do dang-chon" data-che-do="do-mau" aria-label="Đổ màu" title="Đổ màu">🪣</button>' +
            '<button type="button" class="to-btn nut-che-do" data-che-do="but-ve" aria-label="Bút vẽ" title="Bút vẽ">🖌️</button>' +
            '<button type="button" class="to-btn" id="nut-hoan-tac" aria-label="Hoàn tác" title="Hoàn tác">↩️</button>' +
            '<button type="button" class="to-btn" id="nut-xoa" aria-label="Tô lại từ đầu" title="Tô lại từ đầu">🗑️</button>' +
            '<button type="button" class="to-btn to-xong" id="nut-xong" aria-label="Xong rồi" title="Xong rồi">✅</button>' +
          '</div>' +
          '<div class="bang-mau" role="group" aria-label="Bảng màu">' +
            BANG_MAU.map(function (m, i) {
              return '<button type="button" class="o-mau' + (m === mauDangChon ? ' dang-chon' : '') + '" data-mau="' + m + '" style="--mau:' + m + '" title="' + TEN_MAU[i] + '" aria-label="' + TEN_MAU[i] + '"></button>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>';

    cheDo = 'do-mau';
    lopMau = k.querySelector('#lop-mau');
    lopNet = k.querySelector('#lop-net');
    ctxMau = lopMau.getContext('2d', { willReadFrequently: true });
    ctxNet = lopNet.getContext('2d', { willReadFrequently: true });
    ganSuKien();
    moTranh(tranhHienTai);
  }

  /* ---------- Vẽ nét tranh ---------- */
  function moTranh(tranh) {
    taiAnh(tranh, function (anh) { veTranh(tranh, anh); });
  }

  function veTranh(tranh, anhTranh) {
    tranhHienTai = tranh;
    soThaoTac = 0;
    nganHoanTac = [];
    ctxMau.fillStyle = '#ffffff';
    ctxMau.fillRect(0, 0, KT, KT);

    // Vẽ tranh lên canvas tạm nền trắng, sau đó biến phần trắng thành trong suốt
    const tam = document.createElement('canvas');
    tam.width = tam.height = KT;
    const c = tam.getContext('2d', { willReadFrequently: true });
    c.fillStyle = '#fff';
    c.fillRect(0, 0, KT, KT);
    c.drawImage(anhTranh, 0, 0, KT, KT);
    c.strokeStyle = '#000';
    c.lineWidth = 8;
    c.strokeRect(4, 4, KT - 8, KT - 8);

    const du = c.getImageData(0, 0, KT, KT);
    const p = du.data;
    matNaTuong = new Uint8Array(KT * KT);
    for (let i = 0, j = 0; i < p.length; i += 4, j++) {
      const sang = (p[i] + p[i + 1] + p[i + 2]) / 3;
      const doDam = 255 - sang;
      p[i] = 45; p[i + 1] = 36; p[i + 2] = 64;
      p[i + 3] = doDam < 20 ? 0 : Math.min(255, doDam * 1.3);
      if (doDam > 90) matNaTuong[j] = 1; // điểm này là nét viền
    }
    ctxNet.clearRect(0, 0, KT, KT);
    ctxNet.putImageData(du, 0, 0);
    lopNet.setAttribute('aria-label', 'Bức tranh ' + tranh.ten);
  }

  /* ---------- Đổ màu theo vùng ---------- */
  function hexSangRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function doMau(x0, y0) {
    // Nếu chạm trúng nét viền, tìm điểm trống gần nhất
    let bd = -1;
    for (let r = 0; r <= 8 && bd < 0; r += 2) {
      for (let dy = -r; dy <= r && bd < 0; dy += 2) {
        for (let dx = -r; dx <= r && bd < 0; dx += 2) {
          const x = x0 + dx, y = y0 + dy;
          if (x >= 0 && y >= 0 && x < KT && y < KT && !matNaTuong[y * KT + x]) bd = y * KT + x;
        }
      }
    }
    if (bd < 0) return false;

    const anh = ctxMau.getImageData(0, 0, KT, KT);
    const d = anh.data;
    const moi = hexSangRgb(mauDangChon);
    const goc = [d[bd * 4], d[bd * 4 + 1], d[bd * 4 + 2]];
    if (Math.abs(goc[0] - moi[0]) + Math.abs(goc[1] - moi[1]) + Math.abs(goc[2] - moi[2]) < 6) return false;

    const DUNG_SAI = 60;
    function giong(i) {
      if (matNaTuong[i]) return false;
      const j = i * 4;
      return Math.abs(d[j] - goc[0]) + Math.abs(d[j + 1] - goc[1]) + Math.abs(d[j + 2] - goc[2]) <= DUNG_SAI;
    }
    const daTo = new Uint8Array(KT * KT);
    const ngan = [bd];
    while (ngan.length) {
      const i = ngan.pop();
      if (daTo[i]) continue;
      let x = i % KT;
      const y = (i - x) / KT;
      // Đi sang trái đến hết vùng
      while (x > 0 && !daTo[y * KT + x - 1] && giong(y * KT + x - 1)) x--;
      let tren = false, duoi = false;
      for (; x < KT; x++) {
        const c = y * KT + x;
        if (daTo[c] || !giong(c)) break;
        daTo[c] = 1;
        const j = c * 4;
        d[j] = moi[0]; d[j + 1] = moi[1]; d[j + 2] = moi[2]; d[j + 3] = 255;
        if (y > 0) {
          const t = c - KT;
          if (!daTo[t] && giong(t)) { if (!tren) { ngan.push(t); tren = true; } } else tren = false;
        }
        if (y < KT - 1) {
          const u = c + KT;
          if (!daTo[u] && giong(u)) { if (!duoi) { ngan.push(u); duoi = true; } } else duoi = false;
        }
      }
    }
    ctxMau.putImageData(anh, 0, 0);
    return true;
  }

  /* ---------- Hoàn tác ---------- */
  function luuBuoc() {
    try {
      nganHoanTac.push(ctxMau.getImageData(0, 0, KT, KT));
      if (nganHoanTac.length > SO_BUOC_HOAN_TAC) nganHoanTac.shift();
    } catch (loi) { /* bỏ qua */ }
  }

  /* ---------- Sự kiện ---------- */
  function toaDo(e) {
    const khung = lopNet.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(KT - 1, Math.round((e.clientX - khung.left) / khung.width * KT))),
      y: Math.max(0, Math.min(KT - 1, Math.round((e.clientY - khung.top) / khung.height * KT)))
    };
  }

  function ganSuKien() {
    k.querySelector('#nut-ve-lai').addEventListener('click', function () {
      AmThanh.phat('nhan');
      if (soThaoTac > 0) {
        App.xacNhan('🖼️ Chọn tranh khác?', 'Bức tranh đang tô sẽ bị xóa. Bé muốn quay lại chọn tranh không?', 'Quay lại', veChonTranh);
      } else {
        veChonTranh();
      }
    });

    k.querySelectorAll('.nut-che-do').forEach(function (n) {
      n.addEventListener('click', function () {
        cheDo = n.getAttribute('data-che-do');
        AmThanh.phat('nhan');
        k.querySelectorAll('.nut-che-do').forEach(function (x) { x.classList.toggle('dang-chon', x === n); });
      });
    });

    k.querySelectorAll('.o-mau').forEach(function (n) {
      n.addEventListener('click', function () {
        mauDangChon = n.getAttribute('data-mau');
        AmThanh.phat('nhan');
        k.querySelectorAll('.o-mau').forEach(function (x) { x.classList.toggle('dang-chon', x === n); });
      });
    });

    k.querySelector('#nut-hoan-tac').addEventListener('click', function () {
      const buoc = nganHoanTac.pop();
      if (!buoc) { App.thongBao('Không còn gì để hoàn tác'); return; }
      AmThanh.phat('nhan');
      ctxMau.putImageData(buoc, 0, 0);
      soThaoTac = Math.max(0, soThaoTac - 1);
    });

    k.querySelector('#nut-xoa').addEventListener('click', function () {
      AmThanh.phat('nhan');
      App.xacNhan('🗑️ Tô lại từ đầu?', 'Toàn bộ màu đã tô trên tranh này sẽ bị xóa.', 'Tô lại', function () { moTranh(tranhHienTai); });
    });

    k.querySelector('#nut-xong').addEventListener('click', hoanThanh);

    // Tô trên canvas
    let dangVe = false;
    let diemTruoc = null;
    lopNet.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      const p = toaDo(e);
      if (cheDo === 'do-mau') {
        const truoc = ctxMau.getImageData(0, 0, KT, KT);
        if (doMau(p.x, p.y)) {
          nganHoanTac.push(truoc);
          if (nganHoanTac.length > SO_BUOC_HOAN_TAC) nganHoanTac.shift();
          soThaoTac++;
          AmThanh.phat('toMau');
        }
        return;
      }
      luuBuoc();
      dangVe = true;
      diemTruoc = p;
      try { lopNet.setPointerCapture(e.pointerId); } catch (loi) { /* bỏ qua */ }
      veNet(p, p);
    });
    lopNet.addEventListener('pointermove', function (e) {
      if (!dangVe) return;
      const p = toaDo(e);
      veNet(diemTruoc, p);
      diemTruoc = p;
    });
    function dungVe() {
      if (dangVe) soThaoTac++;
      dangVe = false;
    }
    lopNet.addEventListener('pointerup', dungVe);
    lopNet.addEventListener('pointercancel', dungVe);
  }

  function veNet(a, b) {
    ctxMau.strokeStyle = mauDangChon;
    ctxMau.lineWidth = 26;
    ctxMau.lineCap = 'round';
    ctxMau.lineJoin = 'round';
    ctxMau.beginPath();
    ctxMau.moveTo(a.x, a.y);
    ctxMau.lineTo(b.x + 0.01, b.y);
    ctxMau.stroke();
  }

  function hoanThanh() {
    if (soThaoTac < 3) {
      AmThanh.phat('sai');
      App.thongBao('🎨 Bé tô thêm vài màu nữa nhé!');
      return;
    }
    const diem = DiemSo.DIEM_TRA_LOI_DUNG;
    DiemSo.themDiem(diem);
    const sao = DiemSo.hoanThanhTroChoi('to-mau', null, diem);
    const idXong = tranhHienTai.id;
    LuuTru.capNhatTroChoi('to-mau', function (tc) {
      if (!tc.tranhDaXong) tc.tranhDaXong = {};
      tc.tranhDaXong[idXong] = true;
    });
    AmThanh.phat('hoanThanh');
    App.phaoGiay(28);
    let anhNho = '';
    try {
      const gop = document.createElement('canvas');
      gop.width = gop.height = KT;
      const g = gop.getContext('2d');
      g.drawImage(lopMau, 0, 0);
      g.drawImage(lopNet, 0, 0);
      anhNho = '<img class="anh-tranh-xong" src="' + gop.toDataURL('image/png') + '" alt="Bức tranh bé vừa tô">';
    } catch (loi) { /* bỏ qua */ }
    App.hopThoai({
      tieuDe: '🎉 Chúc mừng!',
      noiDungHtml: '<p>Bức tranh <b>' + tranhHienTai.ten + '</b> thật đẹp!</p>' + anhNho +
        '<div class="the-phan-thuong"><div>🎯 +' + diem + ' điểm</div><div>⭐ +' + sao + ' sao</div></div>',
      nut: [
        { nhan: '🖌️ Tô tiếp', lop: 'nut-trang' },
        { nhan: '🖼️ Tranh khác', lop: 'nut-xanh', hanhDong: veChonTranh }
      ]
    });
    soThaoTac = 0; // phải tô thêm mới được nhận thưởng lần nữa
  }

  TroChoiChung.khoiDongTrang(veChonTranh);
})();
