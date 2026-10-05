/* =========================================================
   TRÒ CHƠI: XẾP HÌNH KHỐI (Block Puzzle)
   Kéo khối từ khay vào bàn chơi. Xếp đầy một hàng hoặc một
   cột thì hàng/cột đó nổ tung và biến mất. Xóa đủ số hàng
   của mục tiêu là thắng màn.
   - Không có thua, không trừ điểm: hết chỗ thì Gấu Mật dọn
     bớt giúp bé (chỉ ảnh hưởng số sao).
   - Trên điện thoại có thể chạm khối rồi chạm vào bàn chơi.
   ========================================================= */
(function () {
  'use strict';

  const BANG_MAU = ['#ff5d8f', '#ffb020', '#22c55e', '#38bdf8', '#8b5cf6', '#f97316', '#14b8a6'];
  const KHOANG_O = 3;          // khoảng cách giữa các ô trên bàn (px)
  const KHOANG_O_NHO = 2;      // khoảng cách giữa các ô nhỏ trong khay (px)
  const DEM_BAN = 6;           // phần đệm quanh bàn chơi (px)

  /* ---------- Các hình khối gốc: danh sách [hàng, cột] ---------- */
  const HINH_GOC = {
    mot:       { o: [[0, 0]] },
    ngang2:    { o: [[0, 0], [0, 1]] },
    ngang3:    { o: [[0, 0], [0, 1], [0, 2]] },
    ngang4:    { o: [[0, 0], [0, 1], [0, 2], [0, 3]] },
    ngang5:    { o: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
    vuong2:    { o: [[0, 0], [0, 1], [1, 0], [1, 1]] },
    vuong3:    { o: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]] },
    chuNhat23: { o: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]] },
    goc3:      { o: [[0, 0], [1, 0], [1, 1]] },
    L4:        { o: [[0, 0], [1, 0], [2, 0], [2, 1]], guong: true },
    T4:        { o: [[0, 0], [0, 1], [0, 2], [1, 1]] },
    S4:        { o: [[0, 1], [0, 2], [1, 0], [1, 1]], guong: true },
    goc5:      { o: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]] }
  };

  /* ---------- Cấu hình từng độ khó ----------
     n: số ô mỗi cạnh bàn   mucTieu: số hàng/cột cần xóa để thắng
     hinh: [tên hình, trọng số] (trọng số càng lớn càng hay xuất hiện) */
  const CAU_HINH_DO_KHO = {
    'de': {
      n: 6, mucTieu: 5,
      hinh: [['mot', 1], ['ngang2', 3], ['ngang3', 2], ['vuong2', 2], ['goc3', 3]]
    },
    'trung-binh': {
      n: 8, mucTieu: 8,
      hinh: [['ngang2', 2], ['ngang3', 3], ['ngang4', 2], ['vuong2', 2], ['chuNhat23', 1], ['goc3', 3], ['L4', 2], ['T4', 2]]
    },
    'kho': {
      n: 8, mucTieu: 12,
      hinh: [['mot', 1], ['ngang3', 2], ['ngang4', 2], ['ngang5', 1], ['vuong2', 2], ['vuong3', 1], ['goc3', 2], ['L4', 2], ['T4', 2], ['S4', 2], ['goc5', 1]]
    }
  };

  const CAU_HINH = {
    id: 'xep-hinh-khoi',
    ten: 'Xếp hình khối',
    bieuTuong: '🧱',
    huongDan: 'Kéo khối vào bàn chơi. Xếp đầy một hàng hoặc một cột là hàng đó biến mất!',
    moTaDoKho: {
      'de': 'Bàn nhỏ 6×6, xóa 5 hàng',
      'trung-binh': 'Bàn 8×8, xóa 8 hàng',
      'kho': 'Bàn 8×8, nhiều khối to, xóa 12 hàng'
    }
  };

  const LOI_HUONG_DAN = 'Xếp đầy một hàng hoặc một cột để xóa nhé! 🧱';
  const LOI_KHONG_XOA = ['Khéo quá! 👍', 'Vừa khít! 😄', 'Xếp đẹp lắm! ✨', 'Giỏi quá! 🌟'];

  /* ---------- Tiện ích hình khối ---------- */
  function chuanHoa(o) {
    let minH = Infinity;
    let minC = Infinity;
    o.forEach(function (p) { minH = Math.min(minH, p[0]); minC = Math.min(minC, p[1]); });
    return o.map(function (p) { return [p[0] - minH, p[1] - minC]; })
      .sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
  }
  function xoay90(o) { return chuanHoa(o.map(function (p) { return [p[1], -p[0]]; })); }
  function latGuong(o) { return chuanHoa(o.map(function (p) { return [p[0], -p[1]]; })); }
  function khoa(o) { return o.map(function (p) { return p[0] + ',' + p[1]; }).join(';'); }

  // Tất cả kiểu xoay (và lật gương nếu cần) của một hình, đã loại trùng
  function taoPhienBan(goc) {
    const ketQua = [];
    const daCo = {};
    let cacGoc = [chuanHoa(goc.o)];
    if (goc.guong) cacGoc.push(latGuong(goc.o));
    cacGoc.forEach(function (g) {
      let cur = g;
      for (let i = 0; i < 4; i++) {
        const k = khoa(cur);
        if (!daCo[k]) {
          daCo[k] = true;
          let rong = 0;
          let cao = 0;
          cur.forEach(function (p) { cao = Math.max(cao, p[0] + 1); rong = Math.max(rong, p[1] + 1); });
          ketQua.push({ o: cur, rong: rong, cao: cao });
        }
        cur = xoay90(cur);
      }
    });
    return ketQua;
  }

  function taoBoHinh(danhSach) {
    return danhSach.map(function (muc) {
      return { trongSo: muc[1], phienBan: taoPhienBan(HINH_GOC[muc[0]]) };
    });
  }

  function taoLuoi(n) {
    return Array.from({ length: n }, function () { return new Array(n).fill(null); });
  }

  /* ---------- Luật chơi (không đụng tới màn hình) ---------- */
  function vuaDat(luoi, n, hinh, r, c) {
    if (r < 0 || c < 0 || r + hinh.cao > n || c + hinh.rong > n) return false;
    for (let i = 0; i < hinh.o.length; i++) {
      if (luoi[r + hinh.o[i][0]][c + hinh.o[i][1]]) return false;
    }
    return true;
  }

  function conCho(luoi, n, hinh) {
    for (let r = 0; r + hinh.cao <= n; r++) {
      for (let c = 0; c + hinh.rong <= n; c++) {
        if (vuaDat(luoi, n, hinh, r, c)) return true;
      }
    }
    return false;
  }

  // Các hàng và cột đã đầy
  function tinhHangDay(luoi, n) {
    const hang = [];
    const cot = [];
    for (let r = 0; r < n; r++) {
      if (luoi[r].every(function (o) { return !!o; })) hang.push(r);
    }
    for (let c = 0; c < n; c++) {
      let day = true;
      for (let r = 0; r < n; r++) { if (!luoi[r][c]) { day = false; break; } }
      if (day) cot.push(c);
    }
    return { hang: hang, cot: cot, tong: hang.length + cot.length };
  }

  function moTaDay(day) {
    const phan = [];
    if (day.hang.length) phan.push(day.hang.length + ' hàng');
    if (day.cot.length) phan.push(day.cot.length + ' cột');
    return phan.join(' và ');
  }

  /* ---------- Một lượt chơi ---------- */
  function batDau(doKho) {
    const ch = CAU_HINH_DO_KHO[doKho];
    const n = ch.n;
    const mucTieu = ch.mucTieu;
    const boHinh = taoBoHinh(ch.hinh);
    const tongTrongSo = boHinh.reduce(function (s, h) { return s + h.trongSo; }, 0);
    let canhLonNhat = 1;
    boHinh.forEach(function (h) {
      h.phienBan.forEach(function (p) { canhLonNhat = Math.max(canhLonNhat, p.rong, p.cao); });
    });

    let luoi = taoLuoi(n);
    let khay = [];
    let daXoa = 0;
    let diemNhan = 0;
    let soCuuHo = 0;
    let dangXoa = false;      // đang chạy hiệu ứng nổ: tạm không cho thao tác
    let daThang = false;
    let manhChon = -1;        // khối đang được chạm chọn (chế độ chạm)
    let dangKeo = false;      // đang có một khối được kéo
    let maGoiY = 0;
    let kichO = 40;           // cạnh ô trên bàn (cập nhật khi đổi cỡ màn hình)
    DiemSo.datLaiChuoi();

    const k = document.getElementById('khu-tro-choi');

    /* ----- Bốc 3 khối mới, bảo đảm ít nhất 1 khối còn chỗ đặt ----- */
    function bocMotKhoi() {
      let x = Math.random() * tongTrongSo;
      let chon = boHinh[boHinh.length - 1];
      for (let i = 0; i < boHinh.length; i++) {
        x -= boHinh[i].trongSo;
        if (x < 0) { chon = boHinh[i]; break; }
      }
      const pb = App.chon(chon.phienBan);
      return { o: pb.o, rong: pb.rong, cao: pb.cao, mau: App.chon(BANG_MAU), daDung: false, moi: true };
    }

    function taoKhay() {
      for (let thu = 0; thu < 40; thu++) {
        const ba = [bocMotKhoi(), bocMotKhoi(), bocMotKhoi()];
        if (ba.some(function (m) { return conCho(luoi, n, m); })) return ba;
      }
      // Bàn quá chật: cho một khối 1 ô để bé luôn có nước đi
      const ba = [bocMotKhoi(), bocMotKhoi(), bocMotKhoi()];
      ba[0] = { o: [[0, 0]], rong: 1, cao: 1, mau: App.chon(BANG_MAU), daDung: false, moi: true };
      return ba;
    }

    /* ----- Khung giao diện ----- */
    k.innerHTML =
      '<section class="man-xep-khoi">' +
        '<div class="thanh-thong-tin">' +
          '<button type="button" class="nut nut-tron nut-trang nut-nho" id="nut-doi-do-kho" aria-label="Đổi độ khó" title="Đổi độ khó">🎚️</button>' +
          '<span class="o-thong-tin">🧱 Đã xóa: <b id="so-xoa">0</b>/' + mucTieu + '</span>' +
          '<button type="button" class="nut nut-vang nut-goi-y" id="nut-goi-y">💡 Gợi ý</button>' +
        '</div>' +
        '<div class="thanh-muc-tieu" role="progressbar" aria-valuemin="0" aria-valuemax="' + mucTieu + '" aria-valuenow="0"><span id="thanh-xoa" style="width:0%"></span></div>' +
        '<p class="huong-dan" id="loi-nhac" aria-live="polite">' + LOI_HUONG_DAN + '</p>' +
        '<div class="vung-khoi" id="vung-khoi">' +
          '<div class="ban-khoi" id="ban-khoi" style="--n:' + n + '"></div>' +
          '<div class="khay-khoi" id="khay-khoi"></div>' +
        '</div>' +
      '</section>';

    const manEl = k.querySelector('.man-xep-khoi');
    const vung = k.querySelector('#vung-khoi');
    const banEl = k.querySelector('#ban-khoi');
    const khayEl = k.querySelector('#khay-khoi');
    const loiNhacEl = k.querySelector('#loi-nhac');
    const oDom = [];

    for (let r = 0; r < n; r++) {
      oDom.push([]);
      for (let c = 0; c < n; c++) {
        const o = document.createElement('div');
        o.className = 'o-khoi';
        o.setAttribute('data-hang', r);
        o.setAttribute('data-cot', c);
        banEl.appendChild(o);
        oDom[r].push(o);
      }
    }
    for (let i = 0; i < 3; i++) {
      const the = document.createElement('button');
      the.type = 'button';
      the.className = 'the-manh';
      the.setAttribute('data-i', i);
      the.setAttribute('aria-label', 'Khối số ' + (i + 1));
      khayEl.appendChild(the);
    }

    function loiNhac(chu) { loiNhacEl.textContent = chu; }

    function capNhatTienDo() {
      k.querySelector('#so-xoa').textContent = Math.min(daXoa, mucTieu);
      k.querySelector('#thanh-xoa').style.width = Math.min(100, Math.round(daXoa / mucTieu * 100)) + '%';
      k.querySelector('.thanh-muc-tieu').setAttribute('aria-valuenow', Math.min(daXoa, mucTieu));
    }

    /* ----- Vẽ bàn chơi (kèm phần xem trước nếu có) ----- */
    // xt: { manh, r, c } hoặc null
    function veLai(xt) {
      const xem = {};
      const seXoa = {};
      if (xt) {
        const tam = luoi.map(function (h) { return h.slice(); });
        xt.manh.o.forEach(function (p) {
          tam[xt.r + p[0]][xt.c + p[1]] = xt.manh.mau;
          xem[(xt.r + p[0]) + ',' + (xt.c + p[1])] = true;
        });
        const day = tinhHangDay(tam, n);
        day.hang.forEach(function (r) { for (let c = 0; c < n; c++) seXoa[r + ',' + c] = true; });
        day.cot.forEach(function (c) { for (let r = 0; r < n; r++) seXoa[r + ',' + c] = true; });
      }
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const el = oDom[r][c];
          const kh = r + ',' + c;
          let lop = 'o-khoi';
          let mau = luoi[r][c];
          if (xem[kh]) { lop += ' xem-truoc'; mau = xt.manh.mau; }
          else if (mau) lop += ' co';
          if (seXoa[kh]) lop += ' se-xoa';
          el.className = lop;
          if (mau) el.style.setProperty('--m', mau);
        }
      }
    }

    /* ----- Vẽ khay 3 khối ----- */
    function veKhay() {
      Array.prototype.forEach.call(khayEl.children, function (the, i) {
        const m = khay[i];
        the.classList.remove('dang-chon', 'goi-y', 'an-tam');
        if (!m || m.daDung) {
          the.classList.add('da-dung');
          the.classList.remove('moi');
          the.innerHTML = '';
          return;
        }
        the.classList.remove('da-dung');
        the.innerHTML =
          '<div class="hinh-nho" style="grid-template-columns:repeat(' + m.rong + ',var(--on));grid-template-rows:repeat(' + m.cao + ',var(--on));--m:' + m.mau + '">' +
            m.o.map(function (p) {
              return '<span class="o-nho" style="grid-row:' + (p[0] + 1) + ';grid-column:' + (p[1] + 1) + '"></span>';
            }).join('') +
          '</div>';
        if (m.moi) {
          the.classList.remove('moi');
          void the.offsetWidth;
          the.classList.add('moi');
          m.moi = false;
        }
        if (i === manhChon) the.classList.add('dang-chon');
      });
    }

    /* ----- Tính kích thước cho vừa màn hình (cả chiều rộng lẫn chiều cao) ----- */
    function tinhKichThuoc() {
      if (!document.body.contains(banEl)) {
        window.removeEventListener('resize', tinhKichThuoc);
        return;
      }
      const cs = window.getComputedStyle(k);
      const rongKhung = k.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const haiBen = window.innerWidth >= 700 && window.innerWidth > window.innerHeight * 1.15;
      // Chiều cao còn lại cho vùng chơi = cửa sổ - phần phía trên khung - phần đệm - thanh thông tin
      const yKhung = k.getBoundingClientRect().top + window.scrollY;
      const phanTren = vung.getBoundingClientRect().top - manEl.getBoundingClientRect().top;
      const choTrong = window.innerHeight - yKhung - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 26 - phanTren - 8;
      let canhBan;
      if (haiBen) {
        canhBan = Math.min(rongKhung * 0.58, choTrong, 760);
      } else {
        canhBan = Math.min(rongKhung, 620);
        const nganDuTinh = Math.min((canhBan - 20) / 3, 190);
        canhBan = Math.min(canhBan, choTrong - 16 - nganDuTinh - 6);
      }
      canhBan = Math.max(canhBan, 200);
      const o = Math.floor((canhBan - 2 * DEM_BAN - (n - 1) * KHOANG_O) / n);
      const canhBanThat = o * n + (n - 1) * KHOANG_O + 2 * DEM_BAN;
      let canhNgan;
      if (haiBen) canhNgan = Math.min((canhBanThat - 20) / 3, rongKhung - canhBanThat - 60, 220);
      else canhNgan = Math.min((canhBanThat - 20) / 3, 190);
      canhNgan = Math.max(canhNgan, 60);
      const on = Math.min(o, Math.max(10, Math.floor((canhNgan - 16 - (canhLonNhat - 1) * KHOANG_O_NHO) / canhLonNhat)));
      kichO = o;
      vung.style.setProperty('--o', o + 'px');
      vung.style.setProperty('--on', on + 'px');
      vung.style.setProperty('--ngan', Math.floor(canhNgan) + 'px');
      vung.classList.toggle('hai-ben', haiBen);
    }

    /* ----- Hiệu ứng ngắn trên một ô ----- */
    function hieuUng(el, lop, ms) {
      el.classList.add(lop);
      setTimeout(function () { el.classList.remove(lop); }, ms);
    }

    /* ----- Đặt khối vào bàn ----- */
    function datManh(vi, r, c) {
      const m = khay[vi];
      m.o.forEach(function (p) { luoi[r + p[0]][c + p[1]] = m.mau; });
      m.daDung = true;
      manhChon = -1;
      maGoiY++;
      veLai(null);
      m.o.forEach(function (p) { hieuUng(oDom[r + p[0]][c + p[1]], 'vua-dat', 320); });
      veKhay();
      AmThanh.phat('dat');

      const day = tinhHangDay(luoi, n);
      if (!day.tong) {
        loiNhac(Math.random() < 0.4 ? App.chon(LOI_KHONG_XOA) : LOI_HUONG_DAN);
        tiepTuc();
        return;
      }
      xoaHang(day);
    }

    function xoaHang(day) {
      dangXoa = true;
      const cacO = {};
      day.hang.forEach(function (r) { for (let c = 0; c < n; c++) cacO[r + ',' + c] = [r, c]; });
      day.cot.forEach(function (c) { for (let r = 0; r < n; r++) cacO[r + ',' + c] = [r, c]; });
      const danhSach = Object.keys(cacO).map(function (x) { return cacO[x]; });
      danhSach.forEach(function (p) { oDom[p[0]][p[1]].classList.add('dang-no'); });
      AmThanh.phat('dung');
      if (day.tong >= 2) setTimeout(function () { AmThanh.phat('thanhTich'); }, 160);

      let diemLuot = 0;
      for (let i = 0; i < day.tong; i++) {
        const kq = DiemSo.traLoiDung();
        diemLuot += kq.diem + kq.thuong;
      }
      diemNhan += diemLuot;
      const giua = danhSach[Math.floor(danhSach.length / 2)];
      App.diemBay(oDom[giua[0]][giua[1]], '+' + diemLuot);
      loiNhac(day.tong >= 2
        ? '✨ Siêu quá! Xóa cùng lúc ' + moTaDay(day) + '!'
        : '🎉 Xóa được ' + moTaDay(day) + '!');

      daXoa += day.tong;
      capNhatTienDo();

      setTimeout(function () {
        danhSach.forEach(function (p) { luoi[p[0]][p[1]] = null; });
        veLai(null);
        dangXoa = false;
        if (daXoa >= mucTieu) thang();
        else tiepTuc();
      }, 430);
    }

    /* ----- Sau mỗi lần đặt: đổi khay mới / giúp bé nếu hết chỗ ----- */
    function tiepTuc() {
      if (khay.every(function (m) { return m.daDung; })) {
        khay = taoKhay();
        manhChon = -1;
        veKhay();
      }
      const conLai = khay.filter(function (m) { return !m.daDung; });
      if (!conLai.some(function (m) { return conCho(luoi, n, m); })) cuuHo(conLai);
    }

    // Hết chỗ: Gấu Mật dọn bớt hàng và cột đầy nhất. Không trừ điểm.
    function cuuHo(conLai) {
      soCuuHo++;
      dangXoa = true;
      loiNhac('🐻 Hết chỗ rồi! Gấu Mật dọn bớt giúp bé nhé!');
      const tam = luoi.map(function (h) { return h.slice(); });
      const cacO = {};
      for (let vong = 0; vong < 4; vong++) {
        let hangTot = 0, diemHang = -1, cotTot = 0, diemCot = -1;
        for (let r = 0; r < n; r++) {
          const dem = tam[r].filter(function (o) { return !!o; }).length;
          if (dem > diemHang) { diemHang = dem; hangTot = r; }
        }
        for (let c = 0; c < n; c++) {
          let dem = 0;
          for (let r = 0; r < n; r++) { if (tam[r][c]) dem++; }
          if (dem > diemCot) { diemCot = dem; cotTot = c; }
        }
        for (let c = 0; c < n; c++) { tam[hangTot][c] = null; cacO[hangTot + ',' + c] = [hangTot, c]; }
        for (let r = 0; r < n; r++) { tam[r][cotTot] = null; cacO[r + ',' + cotTot] = [r, cotTot]; }
        if (conLai.some(function (m) { return conCho(tam, n, m); })) break;
      }
      if (!conLai.some(function (m) { return conCho(tam, n, m); })) {
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cacO[r + ',' + c] = [r, c];
      }
      const danhSach = Object.keys(cacO).map(function (x) { return cacO[x]; });
      danhSach.forEach(function (p) { oDom[p[0]][p[1]].classList.add('dang-no'); });
      AmThanh.phat('bayVao');
      setTimeout(function () {
        danhSach.forEach(function (p) { luoi[p[0]][p[1]] = null; });
        veLai(null);
        dangXoa = false;
        loiNhac('Xong rồi! Bé xếp tiếp nhé! 😊');
      }, 600);
    }

    /* ----- Thắng màn ----- */
    function thang() {
      daThang = true;
      loiNhac('🎉 Chúc mừng! Bé đã xóa đủ ' + mucTieu + ' hàng rồi!');
      setTimeout(function () {
        TroChoiChung.ketThuc(CAU_HINH, {
          doKho: doKho,
          diemNhan: diemNhan,
          danhGia: Math.max(0, 1 - soCuuHo * 0.35),
          thongDiep: 'Bé đã xóa <b>' + daXoa + '</b> hàng và cột, xếp khối thật khéo! 🧱'
        }, {
          choiLai: function () { batDau(doKho); },
          doiDoKho: moDau
        });
      }, 1300);
    }

    /* ----- Tìm chỗ đặt khi kéo thả: hút về ô hợp lệ gần nhất ----- */
    function timViTriKeo(m, trai, tren) {
      const kh = banEl.getBoundingClientRect();
      const buoc = kichO + KHOANG_O;
      const fr = (tren - kh.top - DEM_BAN) / buoc;
      const fc = (trai - kh.left - DEM_BAN) / buoc;
      let tot = null;
      let khoangTot = 1.15;
      for (let r = Math.floor(fr) - 1; r <= Math.ceil(fr) + 1; r++) {
        for (let c = Math.floor(fc) - 1; c <= Math.ceil(fc) + 1; c++) {
          if (!vuaDat(luoi, n, m, r, c)) continue;
          const kc = Math.hypot(r - fr, c - fc);
          if (kc < khoangTot) { khoangTot = kc; tot = { manh: m, r: r, c: c }; }
        }
      }
      return tot;
    }

    /* ----- Tìm chỗ đặt khi chạm vào một ô của bàn ----- */
    function timViTriCham(m, r0, c0) {
      let tot = null;
      let khoangTot = Infinity;
      for (let r = r0 - m.cao + 1; r <= r0; r++) {
        for (let c = c0 - m.rong + 1; c <= c0; c++) {
          if (!vuaDat(luoi, n, m, r, c)) continue;
          const phuO = m.o.some(function (p) { return r + p[0] === r0 && c + p[1] === c0; });
          if (!phuO) continue;
          const kc = Math.hypot(r + (m.cao - 1) / 2 - r0, c + (m.rong - 1) / 2 - c0);
          if (kc < khoangTot) { khoangTot = kc; tot = { manh: m, r: r, c: c }; }
        }
      }
      return tot;
    }

    /* ----- Gợi ý: chỉ chỗ đặt khối tốt nhất ----- */
    function goiY() {
      if (dangXoa || daThang || dangKeo) return;
      let tot = null;
      let diemTot = -1;
      khay.forEach(function (m, vi) {
        if (m.daDung) return;
        for (let r = 0; r + m.cao <= n; r++) {
          for (let c = 0; c + m.rong <= n; c++) {
            if (!vuaDat(luoi, n, m, r, c)) continue;
            const tam = luoi.map(function (h) { return h.slice(); });
            m.o.forEach(function (p) { tam[r + p[0]][c + p[1]] = m.mau; });
            const diem = tinhHangDay(tam, n).tong * 10 + m.o.length + Math.random();
            if (diem > diemTot) { diemTot = diem; tot = { vi: vi, manh: m, r: r, c: c }; }
          }
        }
      });
      if (!tot) return;
      const ma = ++maGoiY;
      manhChon = -1;
      veKhay();
      khayEl.children[tot.vi].classList.add('goi-y');
      veLai(tot);
      AmThanh.phat('nhan');
      loiNhac('💡 Bé thử đặt khối nhấp nháy vào chỗ sáng này nhé!');
      setTimeout(function () {
        if (ma !== maGoiY || dangKeo) return;
        khayEl.children[tot.vi].classList.remove('goi-y');
        veLai(null);
      }, 2200);
    }

    /* ----- Kéo thả bằng chuột / cảm ứng (chạm nhẹ = chọn khối) ----- */
    Array.prototype.forEach.call(khayEl.children, function (the) {
      the.addEventListener('pointerdown', function (e) {
        const vi = Number(the.getAttribute('data-i'));
        const m = khay[vi];
        if (!m || m.daDung || dangXoa || daThang || dangKeo) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        maGoiY++;
        const xuatPhatX = e.clientX;
        const xuatPhatY = e.clientY;
        const laCamUng = e.pointerType !== 'mouse';
        let bong = null;
        let ungVien = null;
        let rongBong = 0;
        let caoBong = 0;

        function viTriBong(ev) {
          const trai = ev.clientX - rongBong / 2;
          // Cảm ứng: nâng khối lên cao hơn ngón tay để bé nhìn thấy
          const tren = ev.clientY - caoBong / 2 - (laCamUng ? caoBong / 2 + 1.3 * (kichO + KHOANG_O) : 0);
          return { trai: trai, tren: tren };
        }

        function diChuyen(ev) {
          if (!dangKeo && Math.hypot(ev.clientX - xuatPhatX, ev.clientY - xuatPhatY) > 8) {
            dangKeo = true;
            rongBong = m.rong * kichO + (m.rong - 1) * KHOANG_O;
            caoBong = m.cao * kichO + (m.cao - 1) * KHOANG_O;
            bong = document.createElement('div');
            bong.className = 'manh-khoi-keo';
            bong.style.cssText = 'grid-template-columns:repeat(' + m.rong + ',' + kichO + 'px);grid-template-rows:repeat(' + m.cao + ',' + kichO + 'px);--m:' + m.mau;
            bong.innerHTML = m.o.map(function (p) {
              return '<span class="o-keo" style="grid-row:' + (p[0] + 1) + ';grid-column:' + (p[1] + 1) + '"></span>';
            }).join('');
            document.body.appendChild(bong);
            the.classList.add('an-tam');
            AmThanh.phat('nhan');
          }
          if (dangKeo) {
            const v = viTriBong(ev);
            bong.style.transform = 'translate(' + v.trai + 'px,' + v.tren + 'px)';
            ungVien = timViTriKeo(m, v.trai, v.tren);
            veLai(ungVien);
          }
        }

        function tha() {
          window.removeEventListener('pointermove', diChuyen);
          window.removeEventListener('pointerup', tha);
          window.removeEventListener('pointercancel', huy);
          if (!dangKeo) {
            // Chỉ chạm: chọn / bỏ chọn khối
            manhChon = (manhChon === vi) ? -1 : vi;
            veKhay();
            AmThanh.phat('nhan');
            if (manhChon === vi) loiNhac('👉 Giờ bé chạm vào chỗ trên bàn muốn đặt khối nhé!');
            else loiNhac(LOI_HUONG_DAN);
            return;
          }
          dangKeo = false;
          bong.remove();
          the.classList.remove('an-tam');
          if (ungVien) {
            datManh(vi, ungVien.r, ungVien.c);
          } else {
            veLai(null);
            AmThanh.phat('sai');
            loiNhac('Chưa có chỗ vừa, bé thử chỗ khác nhé! 😊');
          }
        }

        function huy() {
          window.removeEventListener('pointermove', diChuyen);
          window.removeEventListener('pointerup', tha);
          window.removeEventListener('pointercancel', huy);
          if (bong) bong.remove();
          dangKeo = false;
          the.classList.remove('an-tam');
          veLai(null);
        }

        window.addEventListener('pointermove', diChuyen);
        window.addEventListener('pointerup', tha);
        window.addEventListener('pointercancel', huy);
      });
    });

    /* ----- Chế độ chạm: chọn khối rồi chạm vào bàn ----- */
    banEl.addEventListener('click', function (e) {
      const el = e.target.closest('.o-khoi');
      if (!el || manhChon < 0 || dangXoa || daThang || dangKeo) return;
      const m = khay[manhChon];
      if (!m || m.daDung) return;
      const vt = timViTriCham(m, Number(el.getAttribute('data-hang')), Number(el.getAttribute('data-cot')));
      if (vt) {
        datManh(manhChon, vt.r, vt.c);
      } else {
        AmThanh.phat('sai');
        loiNhac('Chỗ này chưa vừa, bé chạm chỗ khác nhé! 😊');
        hieuUng(el, 'vua-dat', 320);
      }
    });

    // Chuột: rê qua bàn thì thấy trước chỗ sẽ đặt
    banEl.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || manhChon < 0 || dangXoa || dangKeo) return;
      const el = e.target.closest('.o-khoi');
      const m = khay[manhChon];
      if (!el || !m || m.daDung) return;
      veLai(timViTriCham(m, Number(el.getAttribute('data-hang')), Number(el.getAttribute('data-cot'))));
    });
    banEl.addEventListener('pointerleave', function () {
      if (manhChon >= 0 && !dangKeo && !dangXoa) veLai(null);
    });

    k.querySelector('#nut-doi-do-kho').addEventListener('click', function () {
      AmThanh.phat('nhan');
      moDau();
    });
    k.querySelector('#nut-goi-y').addEventListener('click', goiY);

    /* ----- Bắt đầu ----- */
    khay = taoKhay();
    tinhKichThuoc();
    window.addEventListener('resize', tinhKichThuoc);
    veLai(null);
    veKhay();
    capNhatTienDo();
  }

  function moDau() {
    TroChoiChung.chonDoKho(CAU_HINH, batDau);
  }

  TroChoiChung.khoiDongTrang(moDau);
})();
