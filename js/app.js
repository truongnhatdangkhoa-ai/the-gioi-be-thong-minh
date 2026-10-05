/* =========================================================
   APP - phần giao diện dùng chung cho mọi trang:
   thanh trạng thái, âm thanh, thông báo, hộp thoại,
   màn thành tích, cài đặt, pháo giấy và các hàm tiện ích.
   ========================================================= */
const App = (function () {
  'use strict';

  const DANH_SACH_TRO_CHOI = [
    { id: 'to-mau', ten: 'Tô màu', bieuTuong: '🎨', mau: '#f25ca8', mauBong: '#c93d84', coDoKho: false },
    { id: 'ghep-hinh', ten: 'Ghép hình', bieuTuong: '🧩', mau: '#8d63f2', mauBong: '#6a41cf', coDoKho: true },
    { id: 'lat-hinh', ten: 'Lật hình', bieuTuong: '🃏', mau: '#84cc16', mauBong: '#5f9a0c', coDoKho: true },
    { id: 'ban-cung', ten: 'Bắn cung', bieuTuong: '🏹', mau: '#e5484d', mauBong: '#b3282d', coDoKho: true },
    { id: 'ban-no', ten: 'Bắn nỏ', bieuTuong: '🏹', mau: '#d946ef', mauBong: '#a21caf', coDoKho: false, nhanTienDo: '🎯 Đã qua {n}/10 màn', truongTienDo: 'daQuaMan' },
    { id: 'dua-xe', ten: 'Đua xe', bieuTuong: '🏎️', mau: '#6366f1', mauBong: '#4648c9', coDoKho: true },
    { id: 'tiem-keo-banh-kem', ten: 'Tiệm kẹo – bánh – kem', bieuTuong: '🍭', mau: '#f59e0b', mauBong: '#c27803', coDoKho: false, nhanTienDo: '🧁 Đã làm {n} món' },
    { id: 'xep-hinh-khoi', ten: 'Xếp hình khối', bieuTuong: '🧱', mau: '#06b6d4', mauBong: '#0891b2', coDoKho: true }
  ];

  let duongDanGoc = '';
  let giaTriCu = { diem: null, sao: null };

  /* ---------- Tiện ích ---------- */
  function thoatHtml(chuoi) {
    return String(chuoi).replace(/[&<>"']/g, function (k) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[k];
    });
  }
  function ngauNhien(nhoNhat, lonNhat) {
    return Math.floor(Math.random() * (lonNhat - nhoNhat + 1)) + nhoNhat;
  }
  function tron(mang) {
    const kq = mang.slice();
    for (let i = kq.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tam = kq[i]; kq[i] = kq[j]; kq[j] = tam;
    }
    return kq;
  }
  function chon(mang) { return mang[Math.floor(Math.random() * mang.length)]; }
  function layNhieu(mang, soLuong) { return tron(mang).slice(0, soLuong); }

  /* ---------- Khởi tạo ---------- */
  function khoiTao(tuyChon) {
    tuyChon = tuyChon || {};
    duongDanGoc = tuyChon.duongDanGoc || '';
    taoKhuThongBao();
    veThanhTrangThai(tuyChon);
    window.addEventListener('tgbtm:thay-doi', capNhatThanhTrangThai);
    window.addEventListener('error', function (e) {
      console.error('[Lỗi]', e.message);
    });
  }

  function taoKhuThongBao() {
    if (document.getElementById('khu-thong-bao')) return;
    const khu = document.createElement('div');
    khu.id = 'khu-thong-bao';
    khu.className = 'khu-thong-bao';
    khu.setAttribute('aria-live', 'polite');
    document.body.appendChild(khu);
  }

  /* ---------- Thanh trạng thái ---------- */
  function veThanhTrangThai(tuyChon) {
    const thanh = document.getElementById('thanh-trang-thai');
    if (!thanh) return;
    const nutVe = tuyChon.laTrangChu ? '' :
      '<a class="nut nut-tron nut-trang" href="' + duongDanGoc + 'index.html" aria-label="Về trang chủ" title="Về trang chủ">🏠</a>';
    thanh.innerHTML =
      '<div class="hud-nhom">' + nutVe +
        '<div class="hud-o" id="hud-diem" title="Điểm"><span class="hud-bieu-tuong">🎯</span><span class="gia-tri">0</span><span class="hud-nhan">điểm</span></div>' +
        '<div class="hud-o" id="hud-sao" title="Sao"><span class="hud-bieu-tuong">⭐</span><span class="gia-tri">0</span></div>' +
        '<button class="hud-o hud-nut" id="hud-thanh-tich" title="Thành tích" aria-label="Xem thành tích"><span class="hud-bieu-tuong">🏆</span><span class="gia-tri">0</span></button>' +
        '<div class="hud-o hud-cap" id="hud-cap" title="Cấp độ"><span class="hud-bieu-tuong">🎈</span><span>Cấp <span class="gia-tri">1</span></span></div>' +
      '</div>' +
      '<div class="hud-nhom">' +
        '<button class="nut nut-am-thanh" id="nut-toan-man-hinh" type="button"></button>' +
        '<button class="nut nut-am-thanh" id="nut-am-thanh" type="button"></button>' +
      '</div>';

    document.getElementById('nut-am-thanh').addEventListener('click', function () {
      AmThanh.batTat();
      capNhatNutAmThanh();
    });
    khoiTaoToanManHinh();
    document.getElementById('hud-thanh-tich').addEventListener('click', function () {
      AmThanh.phat('nhan');
      hienManThanhTich();
    });
    capNhatThanhTrangThai();
  }

  function datGiaTri(id, giaTri, laSo) {
    const o = document.getElementById(id);
    if (!o) return;
    const oGiaTri = o.querySelector('.gia-tri');
    if (oGiaTri.textContent !== String(giaTri)) oGiaTri.textContent = giaTri;
    if (laSo && giaTriCu[laSo] !== null && giaTri > giaTriCu[laSo]) {
      o.classList.remove('nhay');
      void o.offsetWidth; // khởi động lại hiệu ứng
      o.classList.add('nhay');
    }
    if (laSo) giaTriCu[laSo] = giaTri;
  }

  function capNhatThanhTrangThai() {
    const d = LuuTru.layTatCa();
    datGiaTri('hud-diem', d.diem, 'diem');
    datGiaTri('hud-sao', d.sao, 'sao');
    datGiaTri('hud-thanh-tich', ThanhTich.soDaMo() + '/' + ThanhTich.tong);
    datGiaTri('hud-cap', d.capDo);
    capNhatNutAmThanh();
    capNhatNutToanManHinh();
  }

  function capNhatNutAmThanh() {
    const nut = document.getElementById('nut-am-thanh');
    if (!nut) return;
    const bat = AmThanh.dangBat();
    nut.innerHTML = bat
      ? '<span aria-hidden="true">🔊</span><span class="chu-nut-am-thanh">Âm thanh</span>'
      : '<span aria-hidden="true">🔇</span><span class="chu-nut-am-thanh">Tắt âm thanh</span>';
    nut.setAttribute('aria-label', bat ? 'Âm thanh đang bật. Bấm để tắt' : 'Âm thanh đang tắt. Bấm để bật');
    nut.classList.toggle('dang-tat', !bat);
  }

  /* ---------- Toàn màn hình ----------
     Trình duyệt tự thoát toàn màn hình mỗi khi chuyển trang. Vì vậy ta nhớ
     lựa chọn của bé (LuuTru: caiDat.toanManHinh) và vào lại toàn màn hình
     ở lần chạm / bấm phím đầu tiên trên trang mới (trình duyệt bắt buộc
     phải có thao tác của người dùng mới cho vào toàn màn hình). */
  let dangRoiTrang = false;

  function coHoTroToanManHinh() {
    const e = document.documentElement;
    return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled) &&
      !!(e.requestFullscreen || e.webkitRequestFullscreen);
  }
  function dangToanManHinh() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  // Trả về Promise (hoặc undefined trên trình duyệt cũ)
  function vaoToanManHinh() {
    const e = document.documentElement;
    try {
      return e.requestFullscreen ? e.requestFullscreen() : e.webkitRequestFullscreen();
    } catch (loi) { return undefined; }
  }
  function thoatToanManHinh() {
    try {
      const p = document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
      if (p && p.catch) p.catch(function () { /* bỏ qua */ });
    } catch (loi) { /* bỏ qua */ }
  }
  function nhoToanManHinh(bat) {
    LuuTru.capNhat(function (x) { x.caiDat.toanManHinh = !!bat; });
  }

  function capNhatNutToanManHinh() {
    const nut = document.getElementById('nut-toan-man-hinh');
    if (!nut) return;
    if (!coHoTroToanManHinh()) { nut.classList.add('an-di'); return; }
    const bat = dangToanManHinh();
    nut.innerHTML = bat
      ? '<span aria-hidden="true">🪟</span><span class="chu-nut-am-thanh">Thu nhỏ</span>'
      : '<span aria-hidden="true">🖥️</span><span class="chu-nut-am-thanh">Toàn màn hình</span>';
    nut.setAttribute('aria-label', bat ? 'Thoát toàn màn hình' : 'Vào toàn màn hình');
    nut.title = bat ? 'Thoát toàn màn hình' : 'Vào toàn màn hình';
    nut.classList.toggle('dang-tat', !bat);
  }

  function khoiTaoToanManHinh() {
    const nut = document.getElementById('nut-toan-man-hinh');
    if (!nut) return;
    capNhatNutToanManHinh();
    if (!coHoTroToanManHinh()) return;

    nut.addEventListener('click', function () {
      AmThanh.phat('nhan');
      if (dangToanManHinh()) { nhoToanManHinh(false); thoatToanManHinh(); }
      else { nhoToanManHinh(true); vaoToanManHinh(); }
    });

    // Đang rời trang thì không coi là bé chủ động thoát toàn màn hình
    window.addEventListener('pagehide', function () { dangRoiTrang = true; });
    window.addEventListener('beforeunload', function () { dangRoiTrang = true; });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ten) {
      document.addEventListener(ten, function () {
        capNhatNutToanManHinh();
        // Bé bấm phím Esc để thoát -> nhớ là bé không muốn toàn màn hình nữa
        if (!dangToanManHinh() && !dangRoiTrang) nhoToanManHinh(false);
      });
    });

    // Trang mới: bé đã chọn toàn màn hình từ trước -> vào lại ở lần chạm đầu tiên
    const caiDat = LuuTru.lay('caiDat') || {};
    if (caiDat.toanManHinh && !dangToanManHinh()) {
      const goBo = function () {
        ['pointerdown', 'pointerup', 'keydown'].forEach(function (s) { document.removeEventListener(s, thu, true); });
      };
      const thu = function () {
        const p = vaoToanManHinh();
        if (p && p.then) p.then(goBo, function () { /* chưa đủ điều kiện, thử lại lần chạm sau */ });
        else goBo();
      };
      ['pointerdown', 'pointerup', 'keydown'].forEach(function (s) { document.addEventListener(s, thu, true); });
    }
  }

  /* ---------- Thông báo nhỏ ---------- */
  function thongBao(noiDung, thoiGian) {
    taoKhuThongBao();
    const khu = document.getElementById('khu-thong-bao');
    const tb = document.createElement('div');
    tb.className = 'thong-bao';
    tb.textContent = noiDung;
    khu.appendChild(tb);
    setTimeout(function () {
      tb.classList.add('an');
      setTimeout(function () { tb.remove(); }, 350);
    }, thoiGian || 2400);
  }

  /* ---------- Hộp thoại ---------- */
  // nut: [{ nhan, lop, hanhDong }] - bấm nút nào cũng đóng hộp thoại
  function hopThoai(tuyChon) {
    const lopPhu = document.createElement('div');
    lopPhu.className = 'lop-phu';
    const hop = document.createElement('div');
    hop.className = 'hop-thoai ' + (tuyChon.lop || '');
    hop.setAttribute('role', 'dialog');
    hop.setAttribute('aria-modal', 'true');
    hop.innerHTML = (tuyChon.tieuDe ? '<h2>' + tuyChon.tieuDe + '</h2>' : '') +
      '<div class="noi-dung-hop-thoai">' + (tuyChon.noiDungHtml || '') + '</div>' +
      '<div class="nhom-nut"></div>';
    const nhomNut = hop.querySelector('.nhom-nut');
    let daDong = false;
    function dong() {
      if (daDong) return;
      daDong = true;
      document.removeEventListener('keydown', phimEsc);
      lopPhu.remove();
      if (tuyChon.khiDong) tuyChon.khiDong();
    }
    function phimEsc(e) { if (e.key === 'Escape') dong(); }
    (tuyChon.nut || [{ nhan: 'Đóng', lop: 'nut-phu' }]).forEach(function (n) {
      const nut = document.createElement('button');
      nut.type = 'button';
      nut.className = 'nut ' + (n.lop || '');
      nut.innerHTML = n.nhan;
      nut.addEventListener('click', function () {
        AmThanh.phat('nhan');
        const giuMo = n.hanhDong ? n.hanhDong(hop) === false : false;
        if (!giuMo) dong();
      });
      nhomNut.appendChild(nut);
    });
    lopPhu.addEventListener('click', function (e) {
      if (e.target === lopPhu && tuyChon.bamNenDeDong !== false) dong();
    });
    document.addEventListener('keydown', phimEsc);
    lopPhu.appendChild(hop);
    document.body.appendChild(lopPhu);
    const nutDau = hop.querySelector('input, .nhom-nut .nut');
    if (nutDau) setTimeout(function () { nutDau.focus(); }, 50);
    return { dong: dong, phanTu: hop };
  }

  function xacNhan(tieuDe, noiDung, nhanDongY, khiDongY) {
    hopThoai({
      tieuDe: tieuDe,
      noiDungHtml: '<p>' + noiDung + '</p>',
      nut: [
        { nhan: 'Không', lop: 'nut-trang' },
        { nhan: nhanDongY, lop: 'nut-do', hanhDong: khiDongY }
      ]
    });
  }

  /* ---------- Thành tích ---------- */
  const hangDoiThanhTich = [];
  let dangHienThanhTich = false;

  function hienThanhTichMoi(t) {
    hangDoiThanhTich.push(t);
    if (!dangHienThanhTich) {
      // Đánh dấu ngay để nhiều thành tích cùng lúc không bị hiện chồng lên nhau
      dangHienThanhTich = true;
      setTimeout(hienThanhTichTiepTheo, 900);
    }
  }

  function hienThanhTichTiepTheo() {
    const t = hangDoiThanhTich.shift();
    if (!t) { dangHienThanhTich = false; return; }
    dangHienThanhTich = true;
    AmThanh.phat('thanhTich');
    phaoGiay(18);
    hopThoai({
      lop: 'popup-thanh-tich',
      tieuDe: '🎉 Chúc mừng!',
      noiDungHtml:
        '<p>Bạn vừa mở khóa thành tích mới!</p>' +
        '<div class="bieu-tuong-thanh-tich">' + t.bieuTuong + '</div>' +
        '<p class="ten-thanh-tich">' + thoatHtml(t.ten) + '</p>' +
        '<p class="mo-ta-thanh-tich">' + thoatHtml(t.moTa) + '</p>',
      nut: [{ nhan: 'Tuyệt vời!', lop: 'nut-vang' }],
      khiDong: function () { setTimeout(hienThanhTichTiepTheo, 250); }
    });
  }

  function hienManThanhTich() {
    const daMo = LuuTru.lay('thanhTich') || {};
    const html = '<p class="dem-thanh-tich">Bé đã mở ' + ThanhTich.soDaMo() + ' / ' + ThanhTich.tong + ' thành tích</p>' +
      '<div class="luoi-thanh-tich">' +
      ThanhTich.DANH_SACH.map(function (t) {
        const mo = !!daMo[t.id];
        return '<div class="o-thanh-tich ' + (mo ? 'da-mo' : 'chua-mo') + '">' +
          '<div class="o-bieu-tuong">' + (mo ? t.bieuTuong : '🔒') + '</div>' +
          '<div class="o-ten">' + thoatHtml(t.ten) + '</div>' +
          '<div class="o-mo-ta">' + (mo ? '✅ Đã mở khóa' : thoatHtml(t.moTa)) + '</div>' +
          '</div>';
      }).join('') + '</div>';
    hopThoai({ lop: 'hop-thoai-rong', tieuDe: '🏆 Thành tích', noiDungHtml: html, nut: [{ nhan: 'Đóng', lop: 'nut-phu' }] });
  }

  /* ---------- Cài đặt ---------- */
  function hienCaiDat() {
    const d = LuuTru.layTatCa();
    const html =
      '<label class="nhan-o-nhap" for="o-ten-be">Tên của bé</label>' +
      '<input id="o-ten-be" class="o-nhap" maxlength="20" autocomplete="off" placeholder="Ví dụ: Bin, Na, Bống" value="' + thoatHtml(d.tenNguoiChoi) + '">' +
      '<button type="button" class="nut nut-trang nut-rong" id="nut-cai-dat-am-thanh">' + (AmThanh.dangBat() ? '🔊 Âm thanh: Đang bật' : '🔇 Âm thanh: Đang tắt') + '</button>' +
      '<button type="button" class="nut nut-trang nut-rong" id="nut-cai-dat-nhac-nen">' + (NhacNen.dangBatNhac() ? '🎵 Nhạc nền: Đang bật' : '🎵 Nhạc nền: Đang tắt') + '</button>' +
      '<button type="button" class="nut nut-trang nut-rong nut-nguy-hiem" id="nut-xoa-du-lieu">🧹 Chơi lại từ đầu</button>' +
      '<p class="ghi-chu">Dữ liệu chỉ lưu trên máy này, không gửi đi đâu cả.</p>';
    const hd = hopThoai({
      tieuDe: '⚙️ Cài đặt',
      noiDungHtml: html,
      nut: [{
        nhan: '💾 Lưu', lop: 'nut-xanh', hanhDong: function (hop) {
          const ten = hop.querySelector('#o-ten-be').value.trim().slice(0, 20);
          LuuTru.capNhat(function (x) { x.tenNguoiChoi = ten; x.caiDat.daHoiTen = true; });
          thongBao('✅ Đã lưu cài đặt');
        }
      }]
    });
    const hop = hd.phanTu;
    hop.querySelector('#nut-cai-dat-am-thanh').addEventListener('click', function (e) {
      const bat = AmThanh.batTat();
      e.currentTarget.textContent = bat ? '🔊 Âm thanh: Đang bật' : '🔇 Âm thanh: Đang tắt';
      capNhatNutAmThanh();
    });
    hop.querySelector('#nut-cai-dat-nhac-nen').addEventListener('click', function (e) {
      const bat = NhacNen.batTatNhac();
      e.currentTarget.textContent = bat ? '🎵 Nhạc nền: Đang bật' : '🎵 Nhạc nền: Đang tắt';
    });
    hop.querySelector('#nut-xoa-du-lieu').addEventListener('click', function () {
      hd.dong();
      xacNhan('🧹 Chơi lại từ đầu?', 'Toàn bộ điểm, sao và thành tích sẽ bị xóa. Bạn có chắc không?', 'Xóa hết', function () {
        LuuTru.xoaTatCa();
        thongBao('Đã xóa. Mình cùng chơi lại từ đầu nhé!');
      });
    });
  }

  /* ---------- Hiệu ứng ---------- */
  function phaoGiay(soLuong) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bieuTuong = ['🎉', '⭐', '🎈', '✨', '🌟', '🎊'];
    for (let i = 0; i < (soLuong || 24); i++) {
      const p = document.createElement('span');
      p.className = 'phao-giay';
      p.textContent = chon(bieuTuong);
      p.style.left = Math.random() * 100 + 'vw';
      p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      p.style.animationDelay = (Math.random() * 0.4) + 's';
      p.style.fontSize = (1.2 + Math.random() * 1.2) + 'rem';
      p.setAttribute('aria-hidden', 'true');
      document.body.appendChild(p);
      setTimeout(function () { p.remove(); }, 3600);
    }
  }

  function diemBay(phanTu, noiDung) {
    const khung = phanTu.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = 'diem-bay';
    s.textContent = noiDung;
    s.style.left = (khung.left + khung.width / 2) + 'px';
    s.style.top = (khung.top) + 'px';
    s.setAttribute('aria-hidden', 'true');
    document.body.appendChild(s);
    setTimeout(function () { s.remove(); }, 1100);
  }

  function layDuongDanGoc() { return duongDanGoc; }

  // Icon ảnh của trò chơi: assets/icons/tro-choi/<id>.png
  function duongDanIcon(idTroChoi) {
    return duongDanGoc + 'assets/icons/tro-choi/' + idTroChoi + '.png';
  }

  return {
    DANH_SACH_TRO_CHOI: DANH_SACH_TRO_CHOI,
    khoiTao: khoiTao,
    capNhatThanhTrangThai: capNhatThanhTrangThai,
    thongBao: thongBao,
    hopThoai: hopThoai,
    xacNhan: xacNhan,
    hienThanhTichMoi: hienThanhTichMoi,
    hienManThanhTich: hienManThanhTich,
    hienCaiDat: hienCaiDat,
    phaoGiay: phaoGiay,
    diemBay: diemBay,
    layDuongDanGoc: layDuongDanGoc,
    duongDanIcon: duongDanIcon,
    thoatHtml: thoatHtml,
    ngauNhien: ngauNhien,
    tron: tron,
    chon: chon,
    layNhieu: layNhieu
  };
})();
