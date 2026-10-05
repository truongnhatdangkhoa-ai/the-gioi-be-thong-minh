/* =========================================================
   TRÒ CHƠI: BẮN NỎ  (màn hình DỌC)
   - Nỏ đứng giữa phía dưới màn hình. Chạm / giữ ngón tay vào
     chỗ muốn bắn: nỏ xoay theo và bắn ngay. Giữ tay thì bắn liên tục.
   - Bóng và vật phẩm rơi từ trên xuống. Bắn trúng được điểm.
   - Có "quà" rơi xuống: +5 điểm, +10 điểm, +20 điểm,
     bắn 3 mũi tên một lượt, điểm nhân đôi, mũi tên xuyên (10 giây).
   - Mũi tên không giới hạn. Mỗi màn chơi 2 phút.
   - 10 màn, mỗi màn một bố cục rơi khác nhau và một mục tiêu điểm khác nhau.
     Hết giờ mà đạt mục tiêu thì qua màn và mở màn kế tiếp.
   - Không bao giờ trừ điểm: bắn trượt không sao cả.

   Muốn chỉnh màn chơi: sửa mảng MAN (mục tiêu, tốc độ, bố cục, nền).
   Muốn thêm ảnh nền riêng cho một màn: chép ảnh vào games/ban-no/ rồi
   ghi tên file vào trường anhNen của màn đó (ví dụ anhNen: 'nen-man-1.jpg').
   ========================================================= */
(function () {
  'use strict';

  const ID = 'ban-no';
  const GOC_ANH = '../../assets/images/';
  const FONT_EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const FONT_CHU = '"Nunito","Quicksand","Segoe UI Rounded","Segoe UI",system-ui,sans-serif';
  const TAU = Math.PI * 2;

  /* Chế độ thử nghiệm: thêm ?gio=15 vào địa chỉ để mỗi màn chỉ chơi 15 giây */
  const THAM_SO = new URLSearchParams(window.location.search);
  const THOI_GIAN_MAN = Math.max(5, Number(THAM_SO.get('gio')) || 120);   // 2 phút
  const THOI_GIAN_QUA = 10;                                               // quà có tác dụng 10 giây
  const NGUONG_SAO = [1, 1.4, 1.8];   // 1 sao: đạt mục tiêu · 2 sao: 140% · 3 sao: 180%
  const TG_NAP = 0.2;                 // khoảng cách giữa 2 lần bắn (giây)
  const GOC_TOI_DA = 78 * Math.PI / 180;
  const NHANH = THAM_SO.get('debug') ? Math.max(1, Number(THAM_SO.get('nhanh')) || 1) : 1;   // chỉ để thử nghiệm: chạy nhanh gấp N lần

  /* ---------- Vật rơi ---------- */
  const DIEM = { thuong: 5, thu: 10, tim: 10, trai: 10, sao: 20 };
  const CO_VAT = { thuong: 27, thu: 33, tim: 29, trai: 29, sao: 25, qua: 31 };   // bán kính ở màn hình 390px

  const THU_BONG = ['gau', 'gau-bac-cuc', 'tho', 'cuu', 'heo', 'cho', 'cao', 'khi', 'soc', 'vit', 'voi', 'kangaroo'];
  const TRAI_CAY = ['dau-tay', 'nho', 'dua-hau', 'thanh-long', 'dao'];
  const MAU_BONG = [
    ['#ff7a85', '#d6303f'], ['#5cb8ff', '#1c7ed6'], ['#ffdd57', '#f08c00'],
    ['#7ee08f', '#2f9e44'], ['#e28cf5', '#9c36b5'], ['#ffa94d', '#d9480f'], ['#ff9cc0', '#d6336c']
  ];

  /* Quà: trọng số càng lớn càng hay gặp */
  const QUA = [
    { id: 'diem5', nhan: '+5', diem: 5, mau: ['#8ce99a', '#2f9e44'], trongSo: 26, ten: '+5 điểm' },
    { id: 'diem10', nhan: '+10', diem: 10, mau: ['#74c0fc', '#1c7ed6'], trongSo: 24, ten: '+10 điểm' },
    { id: 'diem20', nhan: '+20', diem: 20, mau: ['#ffa8a8', '#e03131'], trongSo: 10, ten: '+20 điểm' },
    { id: 'ba-ten', nhan: '🏹3', mau: ['#d0bfff', '#7048e8'], trongSo: 15, ten: '🏹 Bắn 3 mũi tên một lượt!', hieuUng: true },
    { id: 'nhan-doi', nhan: 'x2', mau: ['#ffe066', '#f08c00'], trongSo: 13, ten: '✨ Điểm nhân đôi!', hieuUng: true },
    { id: 'xuyen', nhan: '⚡', mau: ['#99e9f2', '#0c8599'], trongSo: 12, ten: '⚡ Mũi tên xuyên qua mọi thứ!', hieuUng: true }
  ];
  const CHIP_QUA = { 'ba-ten': '🏹×3', 'nhan-doi': '✨×2', 'xuyen': '⚡ Xuyên' };

  /* ---------- 10 màn chơi ----------
     mucTieu: điểm cần đạt khi hết 2 phút   | toc: tốc độ rơi (phần chiều cao màn hình mỗi giây)
     nhip: số giây giữa 2 đợt vật rơi       | co: cỡ vật (1 = chuẩn)
     boCuc: kiểu sắp xếp vật rơi (xem BO_CUC bên dưới)
     tiLe: tỉ lệ từng loại vật (thuong, thu, tim, trai, sao, qua)
     nen: màu trời, màu đất, kiểu trang trí (anhNen: ảnh nền riêng, để trống = vẽ nền đơn giản) */
  const MAN = [
    { ten: 'Mưa bóng', bt: '🌧️', mucTieu: 200, toc: 0.105, nhip: 1.15, co: 1.2, boCuc: 'mua',
      tiLe: { thuong: 0.5, thu: 0.2, tim: 0.1, trai: 0.08, sao: 0.0, qua: 0.12 },
      nen: { tren: '#7cc8ff', duoi: '#e4f6ff', dat: '#6fcf5a', kieu: 'may' }, anhNen: null },
    { ten: 'Ba làn', bt: '🛤️', mucTieu: 260, toc: 0.115, nhip: 1.15, co: 1.15, boCuc: 'ba-lan',
      tiLe: { thuong: 0.42, thu: 0.22, tim: 0.12, trai: 0.1, sao: 0.02, qua: 0.12 },
      nen: { tren: '#a5e887', duoi: '#f6ffd9', dat: '#59b54a', kieu: 'may' }, anhNen: null },
    { ten: 'Hàng ngang', bt: '➖', mucTieu: 320, toc: 0.115, nhip: 2.3, co: 1.05, boCuc: 'hang-ngang',
      tiLe: { thuong: 0.4, thu: 0.2, tim: 0.14, trai: 0.1, sao: 0.04, qua: 0.12 },
      nen: { tren: '#ff9a8b', duoi: '#ffe8b0', dat: '#d9822b', kieu: 'may' }, anhNen: null },
    { ten: 'Lắc lư', bt: '🌊', mucTieu: 380, toc: 0.12, nhip: 1.0, co: 1.1, boCuc: 'lac-lu',
      tiLe: { thuong: 0.36, thu: 0.22, tim: 0.14, trai: 0.12, sao: 0.04, qua: 0.12 },
      nen: { tren: '#39c5f2', duoi: '#d3f6ff', dat: '#e9c87a', kieu: 'bot' }, anhNen: null },
    { ten: 'Chữ V', bt: '✌️', mucTieu: 440, toc: 0.125, nhip: 2.4, co: 1.0, boCuc: 'chu-v',
      tiLe: { thuong: 0.36, thu: 0.2, tim: 0.14, trai: 0.14, sao: 0.04, qua: 0.12 },
      nen: { tren: '#5fbf6a', duoi: '#e6f7c9', dat: '#3f8f3a', kieu: 'cay' }, anhNen: null },
    { ten: 'Hai bên', bt: '↔️', mucTieu: 500, toc: 0.13, nhip: 1.0, co: 1.0, boCuc: 'hai-ben',
      tiLe: { thuong: 0.34, thu: 0.2, tim: 0.14, trai: 0.14, sao: 0.06, qua: 0.12 },
      nen: { tren: '#1b2a6b', duoi: '#5a4ca8', dat: '#2e8b57', kieu: 'sao' }, anhNen: null },
    { ten: 'Vòng xoáy', bt: '🌀', mucTieu: 580, toc: 0.1, nhip: 2.1, co: 0.95, boCuc: 'xoay',
      tiLe: { thuong: 0.34, thu: 0.2, tim: 0.14, trai: 0.14, sao: 0.06, qua: 0.12 },
      nen: { tren: '#b8d8ff', duoi: '#ffffff', dat: '#e8f4ff', kieu: 'tuyet' }, anhNen: null },
    { ten: 'Sao băng', bt: '☄️', mucTieu: 660, toc: 0.2, nhip: 0.75, co: 1.0, boCuc: 'sao-bang',
      tiLe: { thuong: 0.32, thu: 0.2, tim: 0.14, trai: 0.12, sao: 0.1, qua: 0.12 },
      nen: { tren: '#ffb347', duoi: '#fff0c2', dat: '#d9a441', kieu: 'may' }, anhNen: null },
    { ten: 'Năm làn', bt: '🌈', mucTieu: 740, toc: 0.14, nhip: 0.7, co: 0.95, boCuc: 'nam-lan',
      tiLe: { thuong: 0.32, thu: 0.2, tim: 0.14, trai: 0.12, sao: 0.1, qua: 0.12 },
      nen: { tren: '#ff9ed2', duoi: '#fff0fa', dat: '#c77dff', kieu: 'bot' }, anhNen: null },
    { ten: 'Đại tiệc', bt: '🎉', mucTieu: 840, toc: 0.145, nhip: 1.1, co: 0.92, boCuc: 'tong-hop',
      tiLe: { thuong: 0.3, thu: 0.2, tim: 0.14, trai: 0.12, sao: 0.12, qua: 0.12 },
      nen: { tren: '#2b1055', duoi: '#7597de', dat: '#4b3a8f', kieu: 'sao' }, anhNen: null }
  ];
  const TONG_MAN = MAN.length;
  const TOI_DA_VAT = 9;

  const CAU_HINH = { id: ID, ten: 'Bắn nỏ', bieuTuong: '🏹' };

  /* ---------- Ảnh ---------- */
  const anhDaTai = {};
  function layAnh(duongDan) {
    if (!anhDaTai[duongDan]) {
      const a = new Image();
      a.src = duongDan;
      anhDaTai[duongDan] = a;
    }
    return anhDaTai[duongDan];
  }
  function anhSan(a) { return !!(a && a.complete && a.naturalWidth > 0); }
  function anhHinh(id) { return layAnh(GOC_ANH + id + '.png'); }
  THU_BONG.concat(TRAI_CAY).forEach(anhHinh);
  const ANH_NO = layAnh('no.png');
  const ANH_TEN = layAnh('mui-ten.png');

  /* ---------- Tiện ích ---------- */
  function ngau(a, b) { return a + Math.random() * (b - a); }
  function kep(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function chonNgauNhien(mang) { return mang[Math.floor(Math.random() * mang.length)]; }
  function chonTrongSo(ds) {
    let tong = 0;
    ds.forEach(function (x) { tong += x.trongSo; });
    let r = Math.random() * tong;
    for (let i = 0; i < ds.length; i++) { r -= ds[i].trongSo; if (r <= 0) return ds[i]; }
    return ds[ds.length - 1];
  }
  function dinhDangGio(giay) {
    const g = Math.max(0, Math.ceil(giay));
    return Math.floor(g / 60) + ':' + ('0' + (g % 60)).slice(-2);
  }
  function veSao(soSao) {
    let s = '';
    for (let i = 1; i <= 3; i++) s += '<span class="' + (i <= soSao ? '' : 'mo') + '">⭐</span>';
    return s;
  }
  function tinhSao(diem, man) {
    const tiLe = diem / MAN[man - 1].mucTieu;
    let sao = 0;
    NGUONG_SAO.forEach(function (n, i) { if (tiLe >= n) sao = i + 1; });
    return sao;
  }

  /* ---------- Tiến trình đã lưu ---------- */
  function layTienTrinh() {
    const tc = LuuTru.layTroChoi(ID);
    return {
      capDaMo: Math.max(1, Math.min(TONG_MAN, tc.capDaMo || 1)),
      saoMan: tc.saoMan || {},
      diemMan: tc.diemMan || {}
    };
  }
  function luuKetQuaMan(man, diem, sao) {
    LuuTru.capNhatTroChoi(ID, function (tc) {
      tc.saoMan = tc.saoMan || {};
      tc.diemMan = tc.diemMan || {};
      if (diem > (tc.diemMan[man] || 0)) tc.diemMan[man] = diem;
      if (sao > 0) {
        if (!(tc.saoMan[man] >= sao)) tc.saoMan[man] = sao;
        tc.capDaMo = Math.max(tc.capDaMo || 1, Math.min(TONG_MAN, man + 1));
        tc.daQuaMan = Object.keys(tc.saoMan).length;
        if (man === TONG_MAN) tc.daXongTatCa = true;
      }
    });
  }

  let soPhien = 0;   // mỗi lần vào chơi là một phiên; phiên cũ tự dừng
  const k = function () { return document.getElementById('khu-tro-choi'); };

  /* =========================================================
     MÀN CHỌN MÀN
     ========================================================= */
  function moDau() {
    soPhien++;
    document.body.classList.remove('dang-choi-no');
    const tt = layTienTrinh();
    const kh = k();
    kh.innerHTML =
      '<section class="man-chon-no">' +
        '<div class="tieu-de-tro-choi">' + TroChoiChung.anhTieuDe(ID) + '<h1>Bắn nỏ</h1></div>' +
        '<p class="huong-dan">Chạm vào màn hình để bắn nỏ, giữ tay để bắn liên tục. Mỗi màn chơi 2 phút, đủ điểm là qua màn!</p>' +
        '<h2>Chọn màn</h2>' +
        '<div class="luoi-man-no">' +
          MAN.map(function (m, i) {
            const so = i + 1, mo = so <= tt.capDaMo, sao = tt.saoMan[so] || 0;
            const doKho = i < 3 ? 'do-de' : (i < 7 ? 'do-vua' : 'do-kho');
            return '<button type="button" class="the-man-no ' + doKho + (mo ? '' : ' khoa') + (mo && so === tt.capDaMo && !sao ? ' goi-y' : '') + '" data-man="' + so + '"' +
              (mo ? '' : ' aria-disabled="true"') + ' aria-label="Màn ' + so + (mo ? '' : ', chưa mở') + '">' +
              '<span class="bt-man" aria-hidden="true">' + (mo ? m.bt : '🔒') + '</span>' +
              '<span class="so-man">' + so + '</span>' +
              '<span class="ten-man">' + (mo ? m.ten : 'Chưa mở') + '</span>' +
              '<span class="muc-man">🎯 ' + m.mucTieu + ' điểm</span>' +
              '<span class="sao-man">' + (mo ? veSao(sao) : '') + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
        '<p class="ghi-chu-qua">🎁 <b>Quà bất ngờ</b> khi bắn trúng: <b>+5</b>, <b>+10</b>, <b>+20</b> điểm · bắn <b>3 mũi tên</b> một lượt · điểm <b>nhân đôi</b> · mũi tên <b>xuyên</b> qua mọi thứ (mỗi phép màu kéo dài 10 giây).</p>' +
      '</section>';
    kh.querySelectorAll('.the-man-no').forEach(function (n) {
      n.addEventListener('click', function () {
        if (n.classList.contains('khoa')) {
          AmThanh.phat('sai');
          App.thongBao('🔒 Bé qua màn trước để mở màn này nhé!');
          return;
        }
        AmThanh.phat('nhan');
        batDau(Number(n.getAttribute('data-man')));
      });
    });
    window.scrollTo(0, 0);
  }

  /* =========================================================
     VÀO CHƠI MỘT MÀN
     ========================================================= */
  function batDau(soMan) {
    const cfg = MAN[soMan - 1];
    const phien = ++soPhien;
    const kh = k();
    DiemSo.datLaiChuoi();

    kh.innerHTML =
      '<section class="man-ban-no">' +
        '<div class="thanh-thong-tin">' +
          '<button type="button" class="nut nut-tron nut-trang nut-nho nut-no-nho" id="nut-chon-man" aria-label="Chọn màn" title="Chọn màn">🗺️</button>' +
          '<span class="o-thong-tin" title="Màn chơi">' + cfg.bt + ' Màn <b>' + soMan + '</b></span>' +
          '<span class="o-thong-tin" title="Điểm / mục tiêu">🎯 <b id="so-diem">0</b>/' + cfg.mucTieu + '</span>' +
          '<span class="o-thong-tin o-gio" id="o-gio" title="Thời gian còn lại">⏱️ <b id="so-gio">' + dinhDangGio(THOI_GIAN_MAN) + '</b></span>' +
          '<button type="button" class="nut nut-tron nut-trang nut-nho nut-no-nho" id="nut-tam-dung" aria-label="Tạm dừng" title="Tạm dừng">⏸️</button>' +
        '</div>' +
        '<div class="thanh-muc-tieu" id="thanh-muc-tieu" aria-hidden="true"><span class="day" id="day-diem"></span>' +
          '<i class="moc" style="left:' + (NGUONG_SAO[0] / NGUONG_SAO[2] * 100) + '%"></i>' +
          '<i class="moc" style="left:' + (NGUONG_SAO[1] / NGUONG_SAO[2] * 100) + '%"></i>' +
          '<i class="moc" style="left:100%;margin-left:-3px"></i></div>' +
        '<div class="nhom-qua-dang-co" id="nhom-qua" aria-live="polite"></div>' +
        '<div class="bao-san-khau" id="bao-san-khau">' +
          '<div class="san-khau-no" id="san-khau"><canvas id="khung-ve" aria-label="Sân bắn nỏ"></canvas>' +
            '<div class="lop-phu-no" id="lop-tam-dung"><h2>⏸️ Tạm dừng</h2>' +
              '<button type="button" class="nut nut-vang" id="nut-tiep-tuc">▶️ Chơi tiếp</button>' +
              '<button type="button" class="nut nut-trang" id="nut-ve-chon-man">🗺️ Chọn màn</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
    document.body.classList.add('dang-choi-no');

    const bao = kh.querySelector('#bao-san-khau');
    const sanKhau = kh.querySelector('#san-khau');
    const canvas = kh.querySelector('#khung-ve');
    const ctx = canvas.getContext('2d');
    const oDiem = kh.querySelector('#so-diem');
    const oGio = kh.querySelector('#o-gio');
    const soGio = kh.querySelector('#so-gio');
    const dayDiem = kh.querySelector('#day-diem');
    const thanhMucTieu = kh.querySelector('#thanh-muc-tieu');
    const nhomQua = kh.querySelector('#nhom-qua');
    const lopTamDung = kh.querySelector('#lop-tam-dung');

    /* ----- Trạng thái ----- */
    let W = 0, H = 0, s = 1, dpr = 1;
    let bowX = 0, bowY = 0, noH = 0, groundTop = 0, doDaiTen = 0, tocTen = 0;
    let vat = [], ten = [], hat = [], chu = [], rieng = [];
    const may = [];
    for (let i = 0; i < 5; i++) may.push({ nx: Math.random(), ny: ngau(0.06, 0.45), sc: ngau(0.6, 1.1), toc: ngau(5, 12) });
    const sao = [];
    for (let i = 0; i < 46; i++) sao.push({ nx: Math.random(), ny: Math.random() * 0.85, r: ngau(0.8, 2.2), pha: ngau(0, TAU) });
    let phase = 'dem';            // dem (đếm ngược) | choi | xong
    let demT = 2.6, conLai = THOI_GIAN_MAN, diem = 0, soBan = 0;
    let tSpawn = 0, t = 0, raf = 0, truocDo = 0, tHud = 0;
    let tamDung = false, chay = true, daBaoDat = false;
    let nap = 0, giat = 0, gocMuc = 0, gocVe = 0, dangGiu = false, yeuCauBan = false, chuot = null, gocPhim = 0;
    const hieuUng = { 'ba-ten': 0, 'nhan-doi': 0, 'xuyen': 0 };
    let thongBao = null;
    let quanSat = null;

    /* ----- Kích thước: luôn giữ dáng dọc ----- */
    function doiCo() {
      const r = bao.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
      // Điện thoại/dọc: tối đa 72% chiều cao. Laptop/iPad ngang (cửa sổ rộng): cho rộng tới 100% chiều cao
      const arToiDa = (r.width >= 640 && r.width / r.height > 0.9) ? 1.0 : 0.72;
      const ar = Math.min(r.width / r.height, arToiDa);
      const w = Math.floor(Math.min(r.width, r.height * ar)), h = Math.floor(r.height);
      sanKhau.style.width = w + 'px';
      sanKhau.style.height = h + 'px';
      if (w === W && h === H) return;
      W = w; H = h;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s = kep(Math.min(W / 390, H / 560), 0.7, 1.8);   // co theo cả chiều rộng lẫn chiều cao
      noH = Math.min(150 * s, H * 0.28);
      const boNo = Math.max(30 * s, H * 0.055);
      groundTop = H - boNo;
      bowX = W / 2;
      bowY = H - 6 * s - noH * (1 - PIV_Y);
      doDaiTen = 86 * s;
      tocTen = H * 1.75;
      ten = [];   // mũi tên đang bay thì bỏ khi đổi cỡ màn hình
    }
    const PIV_X = 0.53, PIV_Y = 0.80;   // điểm xoay của nỏ trong ảnh (tỉ lệ)

    /* ----- Bố cục rơi ----- */
    function moi(thamSo) {
      return Object.assign({ cx: 0.5, cy: -0.05, vx: 0, vy: cfg.toc * ngau(0.95, 1.05), bienDo: 0, tanSo: 0, pha: 0, R: 0, w: 0, ngang: false }, thamSo);
    }
    function khoangX(rN, du) { return [rN + du + 0.02, 1 - rN - du - 0.02]; }
    function chonLan(lan, soLuong) {
      const dsLan = lan.slice(), kq = [];
      while (kq.length < soLuong && dsLan.length) kq.push(dsLan.splice(Math.floor(Math.random() * dsLan.length), 1)[0]);
      return kq;
    }
    const BO_CUC = {
      // rơi thẳng ở chỗ ngẫu nhiên
      'mua': function () {
        const rN = 32 * cfg.co * s / W, n = Math.random() < 0.35 ? 2 : 1, kq = [];
        const [a, b] = khoangX(rN, 0);
        for (let i = 0; i < n; i++) kq.push(moi({ cx: ngau(a, b), cy: -0.05 - i * 0.12 }));
        return kq;
      },
      // 3 làn cố định
      'ba-lan': function () {
        return chonLan([0.2, 0.5, 0.8], Math.random() < 0.4 ? 2 : 1).map(function (x, i) { return moi({ cx: x, cy: -0.05 - i * 0.1 }); });
      },
      // một hàng 5 vật rơi cùng lúc
      'hang-ngang': function () {
        const kq = [];
        for (let i = 0; i < 5; i++) kq.push(moi({ cx: 0.12 + 0.19 * i, vy: cfg.toc }));
        return kq;
      },
      // lắc lư qua lại
      'lac-lu': function () {
        const rN = 32 * cfg.co * s / W, du = 0.17, [a, b] = khoangX(rN, du), kq = [];
        for (let i = 0; i < 2; i++) kq.push(moi({ cx: ngau(a, b), cy: -0.05 - i * 0.14, bienDo: du, tanSo: ngau(1.3, 2.0), pha: ngau(0, TAU) }));
        return kq;
      },
      // hình chữ V (đỉnh chữ V ở dưới)
      'chu-v': function () {
        const cx = ngau(0.3, 0.7), kq = [];
        for (let i = -2; i <= 2; i++) kq.push(moi({ cx: cx + i * 0.13, cy: -0.05 - (2 - Math.abs(i)) * 0.075, vy: cfg.toc }));
        return kq;
      },
      // bay chéo từ hai mép vào giữa
      'hai-ben': function () {
        return [
          moi({ cx: -0.07, cy: -0.04, vx: ngau(0.09, 0.13), ngang: true }),
          moi({ cx: 1.07, cy: -0.1, vx: -ngau(0.09, 0.13), ngang: true })
        ];
      },
      // 3 vật xoay quanh một tâm đang rơi
      'xoay': function () {
        const R = 0.14, cx = ngau(R + 0.12, 1 - R - 0.12), kq = [], pha0 = ngau(0, TAU);
        for (let i = 0; i < 3; i++) kq.push(moi({ cx: cx, cy: -0.12, R: R, w: 2.0, pha: pha0 + i * TAU / 3, vy: cfg.toc }));
        return kq;
      },
      // vệt sao băng chéo, nhanh
      'sao-bang': function () {
        const dir = Math.random() < 0.5 ? 1 : -1, kq = [], x0 = dir > 0 ? ngau(-0.1, 0.5) : ngau(0.5, 1.1);
        for (let i = 0; i < 3; i++) kq.push(moi({ cx: x0 - dir * i * 0.1, cy: -0.05 - i * 0.07, vx: dir * 0.15, vy: cfg.toc, ngang: true }));
        return kq;
      },
      // 5 làn, mỗi làn một tốc độ
      'nam-lan': function () {
        const toc = [0.75, 1.25, 0.9, 1.4, 1.05];
        return chonLan([0, 1, 2, 3, 4], Math.random() < 0.5 ? 2 : 1).map(function (l, i) {
          return moi({ cx: 0.1 + 0.2 * l, cy: -0.05 - i * 0.1, vy: cfg.toc * toc[l] });
        });
      },
      // trộn tất cả
      'tong-hop': function () {
        const ds = ['mua', 'ba-lan', 'hang-ngang', 'lac-lu', 'chu-v', 'hai-ben', 'xoay', 'sao-bang', 'nam-lan'];
        return BO_CUC[chonNgauNhien(ds)]();
      }
    };

    function chonKieu() {
      const p = cfg.tiLe;
      const soQua = vat.filter(function (o) { return !o.chet && o.kieu === 'qua'; }).length;
      let x = Math.random();
      const thuTu = ['qua', 'sao', 'trai', 'tim', 'thu', 'thuong'];
      for (let i = 0; i < thuTu.length; i++) {
        const key = thuTu[i];
        if (x < p[key]) return (key === 'qua' && soQua >= 2) ? 'thuong' : key;
        x -= p[key];
      }
      return 'thuong';
    }

    function themVat(sp) {
      const kieu = chonKieu();
      const o = Object.assign({}, sp, {
        kieu: kieu, rb: CO_VAT[kieu] * cfg.co, t: 0, chet: false,
        xoay: ngau(0, TAU), vxoay: ngau(-1.6, 1.6), mau: chonNgauNhien(MAU_BONG), id: null, qua: null, pha2: ngau(0, TAU)
      });
      if (kieu === 'sao') o.vy *= 1.3;
      if (kieu === 'thu') o.id = chonNgauNhien(THU_BONG);
      if (kieu === 'trai') o.id = chonNgauNhien(TRAI_CAY);
      if (kieu === 'qua') o.qua = chonTrongSo(QUA);
      vat.push(o);
    }

    function phatSinh() {
      const dsMoi = BO_CUC[cfg.boCuc]();
      if (vat.length + dsMoi.length > TOI_DA_VAT + 4) return;
      dsMoi.forEach(themVat);
    }

    function viTri(o) {
      let x = o.cx + o.vx * o.t, y = o.cy + o.vy * o.t;
      if (o.R) {
        x += o.R * Math.cos(o.w * o.t + o.pha);
        y += o.R * (W / H) * 0.8 * Math.sin(o.w * o.t + o.pha);
      } else if (o.bienDo) {
        x += o.bienDo * Math.sin(o.tanSo * o.t + o.pha);
      }
      let px = x * W;
      const r = o.rb * s;
      if (!o.ngang) px = kep(px, r * 0.7, W - r * 0.7);
      return { x: px, y: y * H };
    }

    /* ----- Bắn ----- */
    function gocTu(x, y) {
      const dx = x - bowX, dy = y - bowY;
      if (dy >= -8 * s) return dx >= 0 ? GOC_TOI_DA : -GOC_TOI_DA;
      return kep(Math.atan2(dx, -dy), -GOC_TOI_DA, GOC_TOI_DA);
    }
    function dauNo(a) {
      const d = noH * PIV_Y;
      return { x: bowX + Math.sin(a) * d, y: bowY - Math.cos(a) * d };
    }
    function banMotMuiTen(a, xuyen) {
      const m = dauNo(a), dx = Math.sin(a), dy = -Math.cos(a);
      ten.push({
        x: m.x + dx * doDaiTen * 0.2, y: m.y + dy * doDaiTen * 0.2,
        dx: dx, dy: dy, ang: a, xuyen: xuyen, het: false, t: 0
      });
    }
    function ban() {
      const a = gocMuc;
      gocVe = a;
      const ba = hieuUng['ba-ten'] > 0, xuyen = hieuUng['xuyen'] > 0;
      if (ba) { banMotMuiTen(a - 0.2, xuyen); banMotMuiTen(a, xuyen); banMotMuiTen(a + 0.2, xuyen); soBan += 3; }
      else { banMotMuiTen(a, xuyen); soBan += 1; }
      nap = TG_NAP;
      giat = 1;
      AmThanh.phat('banNo');
      const m = dauNo(a);
      for (let i = 0; i < 5; i++) {
        const g = a - Math.PI / 2 + ngau(-0.8, 0.8), toc = ngau(80, 200) * s;
        hat.push({ x: m.x, y: m.y, vx: Math.cos(g) * toc, vy: Math.sin(g) * toc, r: ngau(2, 4) * s, c: ['#fff3a3', '#ffd43b', '#ffffff'][i % 3], t: 0, song: ngau(0.2, 0.4), vuong: false, rot: 0, trongLuc: 0 });
      }
    }

    /* ----- Trúng ----- */
    function themChu(x, y, noiDung, mau, co, song) {
      chu.push({ x: x, y: y, txt: noiDung, c: mau || '#fff', co: (co || 24) * s, t: 0, song: song || 0.9 });
    }
    function cong(soDiem, x, y, mau) {
      const them = soDiem * (hieuUng['nhan-doi'] > 0 ? 2 : 1);
      diem += them;
      DiemSo.themDiem(them);
      themChu(x, y, '+' + them, mau || '#fff', them >= 20 ? 30 : 24);
      if (!daBaoDat && diem >= cfg.mucTieu) {
        daBaoDat = true;
        datThongBao('🎉 Đạt mục tiêu rồi! Bé bắn tiếp để nhiều sao hơn nhé!', 2.6);
        AmThanh.phat('thanhTich');
        App.phaoGiay(18);
      }
      capNhatHud(true);
    }
    function datThongBao(noiDung, song) { thongBao = { txt: noiDung, t: 0, song: song || 1.8 }; }

    function noVat(o, p) {
      o.chet = true;
      const r = o.rb * s;
      let mau = o.mau;
      if (o.kieu === 'sao') mau = ['#ffd43b', '#f59f00'];
      else if (o.kieu === 'tim') mau = ['#ff5d8f', '#d6336c'];
      else if (o.kieu === 'qua') mau = o.qua.mau;
      else if (o.kieu === 'trai') mau = ['#ffd166', '#ff8fa3'];
      else if (o.kieu === 'thu') mau = ['#9bd8ff', '#ffffff'];

      if (o.kieu === 'qua') {
        const q = o.qua;
        AmThanh.phat('bongVang');
        if (q.diem) {
          cong(q.diem, p.x, p.y - r, '#ffe066');
          datThongBao('🎁 Quà: ' + q.ten + '!', 1.2);
        } else {
          hieuUng[q.id] = THOI_GIAN_QUA;
          datThongBao(q.ten + ' (' + THOI_GIAN_QUA + ' giây)', 2.2);
          capNhatHud(true);
          cong(5, p.x, p.y - r, '#ffe066');
        }
      } else if (o.kieu === 'sao') {
        AmThanh.phat('bongVang');
        cong(DIEM.sao, p.x, p.y - r, '#ffe066');
      } else {
        AmThanh.phat('noBong');
        cong(DIEM[o.kieu], p.x, p.y - r, '#fff');
      }

      const mauHat = [mau[0], mau[1], '#ffffff'];
      for (let i = 0; i < 18; i++) {
        const g = (i / 18) * TAU + ngau(-0.2, 0.2), toc = ngau(120, 320) * s;
        hat.push({
          x: p.x, y: p.y, vx: Math.cos(g) * toc, vy: Math.sin(g) * toc - 90 * s,
          r: ngau(3, 7) * s, c: mauHat[i % 3], t: 0, song: ngau(0.6, 1.1), vuong: i % 3 === 0, rot: ngau(0, 6.28), trongLuc: 900 * s
        });
      }
      rieng.push({ loai: 'vong', x: p.x, y: p.y, r: r * 0.7, t: 0, song: 0.35, c: mau[0] });
      if (o.kieu === 'thu') {
        rieng.push({ loai: 'thu', id: o.id, x: p.x, y: p.y, vx: ngau(-90, 90) * s, vy: -240 * s, rot: 0, vr: ngau(-3, 3), t: 0, song: 1.3, co: r * 1.5 });
      }
    }

    /* ----- Cập nhật ----- */
    function capNhat(dt) {
      t += dt;
      if (nap > 0) nap -= dt;
      if (giat > 0) giat = Math.max(0, giat - dt * 7);
      gocVe += (gocMuc - gocVe) * Math.min(1, dt * 20);
      may.forEach(function (m) { m.nx += m.toc * dt / Math.max(W, 1); if (m.nx > 1.25) m.nx = -0.25; });

      if (phase === 'dem') {
        demT -= dt;
        if (demT <= 0) { phase = 'choi'; tSpawn = 0.1; }
      } else if (phase === 'choi') {
        conLai -= dt;
        Object.keys(hieuUng).forEach(function (kq) { if (hieuUng[kq] > 0) hieuUng[kq] = Math.max(0, hieuUng[kq] - dt); });
        if (conLai <= 0) { conLai = 0; hetGio(); }
        tSpawn -= dt;
        const dangCo = vat.filter(function (o) { return !o.chet; }).length;
        if (tSpawn <= 0 && dangCo < TOI_DA_VAT) { phatSinh(); tSpawn = cfg.nhip * ngau(0.9, 1.15); }
      }

      // bắn: giữ tay thì bắn liên tục
      if ((phase === 'choi' || phase === 'dem') && nap <= 0 && (yeuCauBan || dangGiu)) {
        yeuCauBan = false;
        ban();
      }

      // vật rơi
      vat.forEach(function (o) {
        o.t += dt;
        o.xoay += o.vxoay * dt;
        const p = viTri(o);
        o.px = p.x; o.py = p.y;
        const r = o.rb * s;
        if (o.py + r >= groundTop && !o.chet) {   // chạm đất: bụp một cái rồi biến mất
          o.chet = true;
          for (let i = 0; i < 6; i++) {
            hat.push({ x: o.px, y: groundTop, vx: ngau(-90, 90) * s, vy: -ngau(40, 150) * s, r: ngau(2, 4) * s, c: 'rgba(255,255,255,.9)', t: 0, song: 0.45, vuong: false, rot: 0, trongLuc: 600 * s });
          }
        }
        if (o.ngang && (o.px < -r * 3 || o.px > W + r * 3)) o.chet = true;
      });
      vat = vat.filter(function (o) { return !o.chet || o.dangNo; });

      // mũi tên
      ten.forEach(function (a) {
        a.t += dt;
        const quang = tocTen * dt, nBuoc = Math.max(1, Math.ceil(quang / (6 * s))), buoc = quang / nBuoc;
        for (let i = 0; i < nBuoc && !a.het; i++) {
          a.x += a.dx * buoc;
          a.y += a.dy * buoc;
          const hx = a.x + a.dx * doDaiTen * 0.43, hy = a.y + a.dy * doDaiTen * 0.43;
          if (phase === 'choi') {
            for (let j = 0; j < vat.length; j++) {
              const o = vat[j];
              if (o.chet) continue;
              const r = o.rb * s * 0.95 + 4 * s, ddx = hx - o.px, ddy = hy - o.py;
              if (ddx * ddx + ddy * ddy <= r * r) {
                noVat(o, { x: o.px, y: o.py });
                if (!a.xuyen) { a.het = true; break; }
              }
            }
          }
          if (hx < -doDaiTen || hx > W + doDaiTen || hy < -doDaiTen || hy > H) a.het = true;
        }
      });
      ten = ten.filter(function (a) { return !a.het; });
      vat = vat.filter(function (o) { return !o.chet; });

      // hạt, vật rơi, chữ bay
      hat.forEach(function (p) { p.t += dt; p.vy += (p.trongLuc || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 6; });
      hat = hat.filter(function (p) { return p.t < p.song; });
      rieng.forEach(function (o) {
        o.t += dt;
        if (o.loai === 'thu') { o.vy += 800 * s * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.rot += o.vr * dt; }
      });
      rieng = rieng.filter(function (o) { return o.t < o.song; });
      chu.forEach(function (c) { c.t += dt; c.y -= 46 * s * dt; });
      chu = chu.filter(function (c) { return c.t < c.song; });
      if (thongBao) { thongBao.t += dt; if (thongBao.t > thongBao.song) thongBao = null; }

      tHud -= dt;
      if (tHud <= 0) { tHud = 0.2; capNhatHud(false); }
    }

    /* ----- Thanh thông tin (HTML) ----- */
    let hudCu = '';
    function capNhatHud(ep) {
      oDiem.textContent = diem;
      soGio.textContent = dinhDangGio(conLai);
      oGio.classList.toggle('sap-het', phase === 'choi' && conLai <= 10);
      const tiLe = Math.min(1, diem / (cfg.mucTieu * NGUONG_SAO[2]));
      dayDiem.style.width = (tiLe * 100) + '%';
      thanhMucTieu.classList.toggle('dat', diem >= cfg.mucTieu);
      let html = '';
      Object.keys(hieuUng).forEach(function (kq) {
        if (hieuUng[kq] > 0) html += '<span class="chip-qua">' + CHIP_QUA[kq] + ' <b>' + Math.ceil(hieuUng[kq]) + '</b>s</span>';
      });
      if (html !== hudCu || ep) { nhomQua.innerHTML = html; hudCu = html; }
    }

    /* ----- Vẽ nền ----- */
    function veAnh(a, cx, cy, hop, hopCao) {
      if (!anhSan(a)) return;
      const tiLe = Math.min(hop / a.naturalWidth, (hopCao || hop) / a.naturalHeight);
      const w = a.naturalWidth * tiLe, hh = a.naturalHeight * tiLe;
      ctx.drawImage(a, cx - w / 2, cy - hh / 2, w, hh);
    }
    function veMay(m) {
      const x = m.nx * W, y = m.ny * H, u = 20 * m.sc * s;
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.beginPath();
      ctx.arc(x, y, u, 0, TAU);
      ctx.arc(x + u * 1.1, y - u * 0.7, u * 1.15, 0, TAU);
      ctx.arc(x + u * 2.3, y - u * 0.2, u * 0.95, 0, TAU);
      ctx.arc(x + u * 3.2, y + u * 0.15, u * 0.7, 0, TAU);
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
      const n = cfg.nen;
      if (cfg.anhNen) {
        const a = layAnh(cfg.anhNen);
        if (anhSan(a)) {   // ảnh nền riêng: phủ kín sân khấu
          const tl = Math.max(W / a.naturalWidth, H / a.naturalHeight), w = a.naturalWidth * tl, hh = a.naturalHeight * tl;
          ctx.drawImage(a, (W - w) / 2, (H - hh) / 2, w, hh);
          return;
        }
      }
      const gr = ctx.createLinearGradient(0, 0, 0, groundTop);
      gr.addColorStop(0, n.tren);
      gr.addColorStop(1, n.duoi);
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, H);
      if (n.kieu === 'sao') {
        sao.forEach(function (st) {
          ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + st.pha);
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(st.nx * W, st.ny * H, st.r * s, 0, TAU); ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff6c9';
        ctx.beginPath(); ctx.arc(W * 0.82, H * 0.13, 26 * s, 0, TAU); ctx.fill();
        ctx.fillStyle = n.tren;
        ctx.beginPath(); ctx.arc(W * 0.82 + 10 * s, H * 0.13 - 6 * s, 22 * s, 0, TAU); ctx.fill();
      } else if (n.kieu === 'tuyet') {
        may.forEach(veMay);
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        sao.forEach(function (st, i) {
          const y = ((st.ny * H + t * (20 + i % 5 * 8) * s) % (groundTop));
          ctx.beginPath(); ctx.arc(st.nx * W + Math.sin(t + st.pha) * 10 * s, y, (st.r + 0.6) * s, 0, TAU); ctx.fill();
        });
      } else if (n.kieu === 'bot') {
        may.forEach(function (m, i) {
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = '#fff';
          const y = (groundTop - ((t * 14 * s + i * 160) % groundTop));
          ctx.beginPath(); ctx.arc(m.nx * W, y, (14 + i * 6) * s, 0, TAU); ctx.fill();
        });
        ctx.globalAlpha = 1;
      } else {
        may.forEach(veMay);
        if (n.kieu === 'may') {
          const sx = W * 0.85, sy = H * 0.1, sr = 26 * s;
          ctx.fillStyle = 'rgba(255,210,63,.25)'; ctx.beginPath(); ctx.arc(sx, sy, sr + 14 * s, 0, TAU); ctx.fill();
          ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TAU); ctx.fill();
        }
      }
      if (n.kieu === 'cay') {
        ctx.fillStyle = 'rgba(30,110,50,.55)';
        for (let i = 0; i < 6; i++) {
          const x = (i + 0.5) * W / 6, h = (70 + (i * 37 % 40)) * s;
          ctx.beginPath(); ctx.moveTo(x - 34 * s, groundTop); ctx.lineTo(x, groundTop - h); ctx.lineTo(x + 34 * s, groundTop); ctx.closePath(); ctx.fill();
        }
      }
      veDoi(n.dat, groundTop - 6 * s, 10 * s, 5.2, 1.0);
    }
    function veDatTruoc() {
      ctx.fillStyle = cfg.nen.dat;
      ctx.fillRect(0, groundTop + 4 * s, W, H - groundTop);
      ctx.fillStyle = 'rgba(0,0,0,.12)';
      ctx.fillRect(0, groundTop + 4 * s, W, 4 * s);
    }

    /* ----- Vẽ vật rơi ----- */
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
    function veBongTron(o, r) {
      ctx.save();
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
      ctx.rotate(o.xoay);
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 1.2, i * TAU / 6, (i + 1) * TAU / 6); ctx.closePath();
        ctx.fillStyle = i % 2 ? '#fffbea' : (i % 4 === 0 ? o.mau[0] : o.mau[1]);
        ctx.fill();
      }
      ctx.restore();
      const gr = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.1);
      gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(43,35,80,.22)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(43,35,80,.45)'; ctx.lineWidth = 2.5 * s; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.beginPath(); ctx.ellipse(-r * 0.42, -r * 0.48, r * 0.14, r * 0.24, -0.7, 0, TAU); ctx.fill();
    }
    function veBongBong(o, r) {   // bong bóng xà phòng có thú bông bên trong
      const gr = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
      gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(0.7, 'rgba(170,222,255,.4)'); gr.addColorStop(1, 'rgba(110,190,255,.55)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      veAnh(anhHinh(o.id), 0, r * 0.02, r * 1.4, r * 1.4);
      ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(60,140,220,.55)'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.arc(0, 0, r + 1.5 * s, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.beginPath(); ctx.ellipse(-r * 0.5, -r * 0.5, r * 0.13, r * 0.24, -0.75, 0, TAU); ctx.fill();
    }
    function veTim(r) {
      const gr = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.3);
      gr.addColorStop(0, '#ffb3c6'); gr.addColorStop(0.55, '#ff5d8f'); gr.addColorStop(1, '#d6336c');
      ctx.fillStyle = gr; ctx.strokeStyle = '#b02158'; ctx.lineWidth = 2.5 * s; ctx.lineJoin = 'round';
      duongTim(r); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.65)';
      ctx.beginPath(); ctx.ellipse(-r * 0.55, -r * 0.45, r * 0.13, r * 0.24, -0.7, 0, TAU); ctx.fill();
    }
    function veSaoVang(r) {
      const R = r * 1.15;
      const gr = ctx.createRadialGradient(-R * 0.25, -R * 0.3, R * 0.1, 0, 0, R);
      gr.addColorStop(0, '#fff3a3'); gr.addColorStop(0.6, '#ffd43b'); gr.addColorStop(1, '#f59f00');
      ctx.fillStyle = gr; ctx.strokeStyle = '#e08600'; ctx.lineWidth = 4 * s; ctx.lineJoin = 'round';
      duongSao(R); ctx.stroke(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.65)';
      ctx.beginPath(); ctx.ellipse(-R * 0.22, -R * 0.28, R * 0.1, R * 0.2, -0.5, 0, TAU); ctx.fill();
    }
    function veTraiCay(o, r) {
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.beginPath(); ctx.arc(0, 0, r * 1.02, 0, TAU); ctx.fill();
      veAnh(anhHinh(o.id), 0, 0, r * 1.7, r * 1.7);
    }
    function veRoundRect(x, y, w, h, rr) {
      ctx.beginPath();
      ctx.moveTo(x + rr, y); ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath();
    }
    function veQua(o, r) {
      const q = o.qua, b = r * 1.55, x = -b / 2, y = -b / 2 + r * 0.1;
      const nhip = 0.5 + 0.5 * Math.sin(t * 5 + o.pha2);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.25 * nhip) + ')';   // vòng sáng nhấp nháy
      ctx.beginPath(); ctx.arc(0, 0, r * (1.15 + 0.12 * nhip), 0, TAU); ctx.fill();
      ctx.strokeStyle = '#2b2350'; ctx.lineWidth = 2.5 * s; ctx.lineJoin = 'round';
      const gr = ctx.createLinearGradient(0, y, 0, y + b);
      gr.addColorStop(0, q.mau[0]); gr.addColorStop(1, q.mau[1]);
      ctx.fillStyle = gr; veRoundRect(x, y, b, b, 8 * s); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.9)';   // dây ruy băng
      ctx.fillRect(-b * 0.09, y, b * 0.18, b);
      ctx.fillRect(x, y + b * 0.41, b, b * 0.18);
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#2b2350'; ctx.lineWidth = 2 * s;   // nơ
      ctx.beginPath(); ctx.ellipse(-b * 0.2, y - b * 0.04, b * 0.2, b * 0.13, -0.4, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(b * 0.2, y - b * 0.04, b * 0.2, b * 0.13, 0.4, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff';   // huy hiệu ghi loại quà
      ctx.beginPath(); ctx.arc(0, y + b * 0.5, b * 0.34, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = q.mau[1];
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lonChu = q.nhan.length > 2;
      ctx.font = '900 ' + Math.round(b * (lonChu ? 0.27 : 0.34)) + 'px ' + FONT_CHU + ',' + FONT_EMOJI;
      ctx.fillText(q.nhan, 0, y + b * 0.52);
    }
    function veVat(o) {
      if (o.py === undefined) return;
      const r = o.rb * s;
      ctx.save();
      ctx.translate(o.px, o.py);
      if (o.kieu === 'qua') ctx.rotate(Math.sin(t * 3 + o.pha2) * 0.18);
      else if (o.kieu === 'sao' || o.kieu === 'tim') ctx.rotate(Math.sin(t * 2.2 + o.pha2) * 0.2);
      else if (o.kieu === 'trai') ctx.rotate(o.xoay * 0.25);
      if (o.kieu === 'thuong') veBongTron(o, r);
      else if (o.kieu === 'thu') veBongBong(o, r);
      else if (o.kieu === 'tim') veTim(r);
      else if (o.kieu === 'sao') veSaoVang(r);
      else if (o.kieu === 'trai') veTraiCay(o, r);
      else veQua(o, r);
      ctx.restore();
    }

    /* ----- Vẽ nỏ, mũi tên ----- */
    function veNo() {
      ctx.save();
      ctx.translate(bowX, bowY);
      ctx.rotate(gocVe);
      ctx.translate(0, giat * 9 * s);
      // bóng đổ dưới chân nỏ
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.beginPath(); ctx.ellipse(0, noH * (1 - PIV_Y) - 4 * s, noH * 0.26, 6 * s, 0, 0, TAU); ctx.fill();
      if (anhSan(ANH_NO)) {
        const w = noH * ANH_NO.naturalWidth / ANH_NO.naturalHeight;
        ctx.drawImage(ANH_NO, -PIV_X * w, -PIV_Y * noH, w, noH);
      } else {
        ctx.fillStyle = '#8b5a2b'; ctx.fillRect(-8 * s, -noH * PIV_Y, 16 * s, noH);
      }
      ctx.restore();
    }
    function veTenBay(a) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.ang);
      if (a.xuyen) {   // vệt sáng khi mũi tên xuyên
        const gr = ctx.createLinearGradient(0, 0, 0, doDaiTen * 0.9);
        gr.addColorStop(0, 'rgba(120,230,255,.75)'); gr.addColorStop(1, 'rgba(120,230,255,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(-6 * s, 0, 12 * s, doDaiTen * 0.9);
      }
      if (anhSan(ANH_TEN)) {
        const w = doDaiTen * ANH_TEN.naturalWidth / ANH_TEN.naturalHeight;
        ctx.drawImage(ANH_TEN, -w / 2, -doDaiTen / 2, w, doDaiTen);
      } else {
        ctx.strokeStyle = '#8b5a2b'; ctx.lineWidth = 4 * s;
        ctx.beginPath(); ctx.moveTo(0, doDaiTen / 2); ctx.lineTo(0, -doDaiTen / 2); ctx.stroke();
      }
      ctx.restore();
    }

    /* ----- Hướng ngắm: chấm nhiều màu + vòng ngắm ----- */
    function veNgam() {
      if (!dangGiu || !chuot || phase === 'xong') return;
      const MAU_NGAM = ['#ff3b5c', '#ff8a00', '#ffd000', '#22c55e', '#2f80ff', '#a855f7'];
      const m = dauNo(gocMuc), dx = chuot.x - m.x, dy = chuot.y - m.y, dai = Math.hypot(dx, dy);
      const so = Math.min(14, Math.floor(dai / (24 * s)));
      for (let i = 1; i <= so; i++) {
        const px = m.x + dx * i / (so + 1), py = m.y + dy * i / (so + 1), r = 5 * s;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#1f2a6b'; ctx.beginPath(); ctx.arc(px, py, r + 2.6 * s, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py, r + 1.2 * s, 0, TAU); ctx.fill();
        ctx.fillStyle = MAU_NGAM[i % MAU_NGAM.length]; ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      const vr = 20 * s + Math.sin(t * 10) * 2 * s;   // vòng ngắm tại ngón tay
      ctx.lineWidth = 5 * s; ctx.strokeStyle = '#1f2a6b'; ctx.beginPath(); ctx.arc(chuot.x, chuot.y, vr, 0, TAU); ctx.stroke();
      ctx.lineWidth = 3 * s; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.arc(chuot.x, chuot.y, vr, 0, TAU); ctx.stroke();
      ctx.lineWidth = 3 * s; ctx.strokeStyle = '#ff3b5c'; ctx.setLineDash([8 * s, 8 * s]); ctx.lineDashOffset = -t * 40; ctx.beginPath(); ctx.arc(chuot.x, chuot.y, vr, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    }

    function chuVien(noiDung, x, y, coChu, mau, vien) {
      ctx.font = '900 ' + Math.round(coChu) + 'px ' + FONT_CHU + ',' + FONT_EMOJI;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.lineWidth = coChu * 0.24; ctx.strokeStyle = vien || '#2b2350';
      ctx.strokeText(noiDung, x, y);
      ctx.fillStyle = mau || '#fff';
      ctx.fillText(noiDung, x, y);
    }

    function veHatVaChu() {
      hat.forEach(function (p) {
        const con = 1 - p.t / p.song;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, con * 1.6));
        ctx.fillStyle = p.c;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.vuong) ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
        else { ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.fill(); }
        ctx.restore();
      });
      rieng.forEach(function (o) {
        if (o.loai === 'vong') {
          const e = o.t / o.song;
          ctx.save();
          ctx.globalAlpha = 1 - e;
          ctx.strokeStyle = o.c; ctx.lineWidth = (7 - 5 * e) * s;
          ctx.beginPath(); ctx.arc(o.x, o.y, o.r * (1 + e * 1.4), 0, TAU); ctx.stroke();
          ctx.restore();
        } else {
          const con = 1 - o.t / o.song;
          ctx.save();
          ctx.globalAlpha = con < 0.3 ? con / 0.3 : 1;
          ctx.translate(o.x, o.y);
          ctx.rotate(o.rot);
          veAnh(anhHinh(o.id), 0, 0, o.co);
          ctx.restore();
        }
      });
      chu.forEach(function (c) {
        const con = 1 - c.t / c.song;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, con * 2));
        const pop = c.t < 0.12 ? 0.6 + c.t / 0.12 * 0.5 : 1.1 - Math.min(0.1, (c.t - 0.12) * 0.5);
        chuVien(c.txt, c.x, c.y, c.co * pop, c.c);
        ctx.restore();
      });
    }

    function veLopPhu() {
      if (phase === 'dem') {
        const buoc = Math.ceil(demT - 0.4);
        const noiDung = buoc >= 1 ? String(buoc) : 'Bắn!';
        const e = (demT - 0.4) % 1;
        const pop = 1 + (buoc >= 1 ? (e < 0 ? 0 : e) * 0.35 : 0.1);
        chuVien(noiDung, W / 2, H * 0.34, 78 * s * pop, '#ffe066');
        chuVien('Chạm vào màn hình để bắn nỏ!', W / 2, H * 0.34 + 62 * s, 19 * s, '#fff');
        chuVien('Giữ tay để bắn liên tục 🏹', W / 2, H * 0.34 + 90 * s, 17 * s, '#fff');
      }
      if (thongBao) {
        const e = thongBao.t / thongBao.song;
        const a = e < 0.1 ? e / 0.1 : (e > 0.8 ? (1 - e) / 0.2 : 1);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, a));
        const tr = thongBao.t < 0.15 ? 0.8 + thongBao.t / 0.15 * 0.2 : 1;
        chuVien(thongBao.txt, W / 2, H * 0.17, 20 * s * tr, '#fff', '#b45309');
        ctx.restore();
      }
      if (phase === 'xong') {
        chuVien('⏰ Hết giờ!', W / 2, H * 0.36, 52 * s, '#ffe066');
      }
    }

    function ve() {
      ctx.clearRect(0, 0, W, H);
      veNen();
      vat.forEach(veVat);
      veDatTruoc();
      ten.forEach(veTenBay);
      veNo();
      veNgam();
      veHatVaChu();
      veLopPhu();
    }

    /* ----- Vòng lặp ----- */
    function vong(now) {
      if (!chay || phien !== soPhien) return;
      const dt = truocDo ? Math.min(0.05, (now - truocDo) / 1000) : 0.016;
      truocDo = now;
      if (!tamDung && W) { for (let i = 0; i < NHANH; i++) capNhat(dt); }
      if (W) ve();
      raf = requestAnimationFrame(vong);
    }
    function dung() {
      chay = false;
      cancelAnimationFrame(raf);
      if (quanSat) quanSat.disconnect();
      document.removeEventListener('keydown', phimXuong);
      document.removeEventListener('keyup', phimLen);
      document.removeEventListener('visibilitychange', anTab);
    }

    /* ----- Điều khiển: chạm / giữ để bắn ----- */
    function toaDo(e) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    canvas.addEventListener('pointerdown', function (e) {
      if (tamDung || phase === 'xong') return;
      chuot = toaDo(e);
      gocMuc = gocTu(chuot.x, chuot.y);
      dangGiu = true;
      yeuCauBan = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (loi) { /* bỏ qua */ }
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!dangGiu) return;
      chuot = toaDo(e);
      gocMuc = gocTu(chuot.x, chuot.y);
      e.preventDefault();
    });
    function thaTay() { dangGiu = false; }
    canvas.addEventListener('pointerup', thaTay);
    canvas.addEventListener('pointercancel', thaTay);
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    // Bàn phím (máy tính): mũi tên trái / phải để xoay, phím cách để bắn
    const phim = {};
    function phimXuong(e) {
      if (tamDung || phase === 'xong') return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        gocPhim = kep(gocMuc + (e.key === 'ArrowLeft' ? -0.12 : 0.12), -GOC_TOI_DA, GOC_TOI_DA);
        gocMuc = gocPhim;
        e.preventDefault();
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        if (!phim[e.key]) yeuCauBan = true;
        phim[e.key] = true;
        e.preventDefault();
      }
    }
    function phimLen(e) { phim[e.key] = false; }
    document.addEventListener('keydown', phimXuong);
    document.addEventListener('keyup', phimLen);

    /* ----- Tạm dừng ----- */
    function datTamDung(bat) {
      if (phase === 'xong') return;
      tamDung = bat;
      dangGiu = false;
      lopTamDung.classList.toggle('hien', bat);
    }
    function anTab() { if (document.hidden) datTamDung(true); }
    document.addEventListener('visibilitychange', anTab);
    kh.querySelector('#nut-tam-dung').addEventListener('click', function () { AmThanh.phat('nhan'); datTamDung(true); });
    kh.querySelector('#nut-tiep-tuc').addEventListener('click', function () { AmThanh.phat('nhan'); datTamDung(false); });
    kh.querySelector('#nut-ve-chon-man').addEventListener('click', function () { AmThanh.phat('nhan'); dung(); moDau(); });
    kh.querySelector('#nut-chon-man').addEventListener('click', function () {
      AmThanh.phat('nhan');
      if (phase === 'choi' && !tamDung) datTamDung(true);   // bấm nhầm thì có chỗ để chơi tiếp
      else if (phase === 'dem') { dung(); moDau(); }
    });

    /* ----- Hết giờ và kết quả ----- */
    function hetGio() {
      phase = 'xong';
      dangGiu = false;
      AmThanh.phat('hoanThanh');
      setTimeout(hienKetQua, 1300);
    }

    function hienKetQua() {
      if (phien !== soPhien) return;
      dung();
      document.body.classList.remove('dang-choi-no');
      const soSao = tinhSao(diem, soMan);
      const dat = diem >= cfg.mucTieu;
      luuKetQuaMan(soMan, diem, soSao);
      const thongDiep = 'Màn ' + soMan + ' · ' + cfg.ten + ': bé được <b>' + diem + '</b> điểm (mục tiêu ' + cfg.mucTieu + ' điểm), bắn <b>' + soBan + '</b> mũi tên!';
      const hanhDong = {
        choiLai: function () { batDau(soMan); },
        doiDoKho: moDau,
        nhanDoiDoKho: '🗺️ Chọn màn'
      };
      if (dat) {
        if (soMan < TONG_MAN) {
          hanhDong.tiepTheo = function () { batDau(soMan + 1); };
          hanhDong.nhanTiepTheo = '➡️ Màn ' + (soMan + 1);
        }
        TroChoiChung.ketThuc(CAU_HINH, {
          diemNhan: diem,
          soSao: soSao,
          thongDiep: thongDiep,
          thongDiepPhu: soMan < TONG_MAN ? '🔓 Đã mở Màn ' + (soMan + 1) + '!' : '👑 Bé đã vượt qua cả ' + TONG_MAN + ' màn Bắn nỏ!'
        }, hanhDong);
      } else {
        hienChuaDat(thongDiep, hanhDong);
      }
    }

    function hienChuaDat(thongDiep, hanhDong) {
      const con = cfg.mucTieu - diem;
      kh.innerHTML =
        '<section class="man-ket-qua">' +
          '<div class="bieu-tuong-ket-qua" aria-hidden="true">💪</div>' +
          '<h1>Suýt nữa rồi!</h1>' +
          '<p class="nhan-do-kho">Bắn nỏ · Màn ' + soMan + '</p>' +
          '<p class="thong-diep">' + thongDiep + '</p>' +
          '<p class="thong-diep-phu">Bé cần thêm <b>' + con + '</b> điểm nữa là qua màn. Cố lên nhé!</p>' +
          '<div class="nhom-nut">' +
            '<button type="button" class="nut nut-xanh" id="nut-choi-lai">🔄 Chơi lại</button>' +
            '<button type="button" class="nut nut-phu" id="nut-chon-man-kq">🗺️ Chọn màn</button>' +
            '<a class="nut nut-trang" href="' + App.layDuongDanGoc() + 'index.html">🏠 Trang chủ</a>' +
          '</div>' +
        '</section>';
      kh.querySelector('#nut-choi-lai').addEventListener('click', function () { AmThanh.phat('nhan'); hanhDong.choiLai(); });
      kh.querySelector('#nut-chon-man-kq').addEventListener('click', function () { AmThanh.phat('nhan'); hanhDong.doiDoKho(); });
      window.scrollTo(0, 0);
    }

    /* ----- Chạy ----- */
    doiCo();
    gocMuc = gocVe = 0;
    capNhatHud(true);
    if (window.ResizeObserver) {
      quanSat = new ResizeObserver(doiCo);
      quanSat.observe(bao);
    } else {
      window.addEventListener('resize', doiCo);
    }
    raf = requestAnimationFrame(vong);

    // Chỉ dùng khi thử nghiệm (thêm ?debug=1 vào địa chỉ)
    if (THAM_SO.get('debug')) {
      window.__banNo = {
        vat: function () { return vat.filter(function (o) { return !o.chet && o.px !== undefined; }).map(function (o) { return { x: o.px, y: o.py, kieu: o.kieu, qua: o.qua && o.qua.id }; }); },
        diem: function () { return diem; },
        phase: function () { return phase; },
        conLai: function () { return conLai; },
        co: function () { return { W: W, H: H, s: s, bowX: bowX, bowY: bowY }; }
      };
    }
  }

  TroChoiChung.khoiDongTrang(moDau);
})();
