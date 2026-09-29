/* =========================================================
   TRÒ CHƠI: LẬT HÌNH
   Tìm 2 hình giống nhau. 50 màn chia 5 chặng, mỗi chặng 10 màn.
   Hình được chọn ngẫu nhiên từ HINH_LAT (hinh-lat.js)
   theo chủ đề bé chọn. Xong màn này mở khóa màn sau.
   ========================================================= */
(function () {
  'use strict';

  const ID = 'lat-hinh';
  const THU_MUC_HINH = 'hinh/';

  /* ---------- 50 màn, chia thành 5 chặng, mỗi chặng 10 màn ----------
     Xong màn cuối của một chặng thì mở thêm chặng tiếp theo.
     Muốn thêm chặng: thêm một dòng vào CHANG (10 số cặp + thời gian xem trước). */
  const SO_MAN_MOI_CHANG = 10;
  const CHANG = [
    { ten: 'Khu vườn nhỏ', bieuTuong: '🌱', soCap: [2, 3, 4, 6, 8, 10, 12, 15, 18, 21], xemTruoc: [2200, 2200, 2000, 2000, 1800, 1600, 1500, 1200, 1000, 0] },
    { ten: 'Cánh rừng xanh', bieuTuong: '🌳', soCap: [4, 6, 8, 10, 12, 14, 15, 16, 18, 21], xemTruoc: [1600, 1500, 1400, 1300, 1200, 1000, 900, 800, 600, 0] },
    { ten: 'Dòng sông hát', bieuTuong: '🌊', soCap: [6, 8, 10, 12, 14, 16, 18, 20, 21, 24], xemTruoc: [1200, 1100, 1000, 900, 800, 700, 600, 500, 400, 0] },
    { ten: 'Ngọn núi cao', bieuTuong: '⛰️', soCap: [8, 10, 12, 14, 16, 18, 20, 21, 24, 24], xemTruoc: [800, 800, 700, 700, 600, 500, 400, 300, 0, 0] },
    { ten: 'Lâu đài ngôi sao', bieuTuong: '🏰', soCap: [10, 12, 14, 16, 18, 20, 21, 24, 24, 24], xemTruoc: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
  ];

  // Số cột: ưu tiên số chia hết để các hàng đều nhau
  function tinhCot(soThe) {
    for (let c = Math.ceil(Math.sqrt(soThe)); c <= 8; c++) {
      if (soThe % c === 0) return c;
    }
    return Math.min(8, Math.ceil(Math.sqrt(soThe * 1.3)));
  }

  // doKho dùng để hiện 🟢🟡🔴 ở trang chủ
  function doKhoTheoSoCap(soCap) {
    return soCap <= 4 ? 'de' : (soCap <= 10 ? 'trung-binh' : 'kho');
  }

  const DANH_SACH_CAP = [];
  CHANG.forEach(function (ch, iChang) {
    ch.soCap.forEach(function (soCap, i) {
      DANH_SACH_CAP.push({
        cap: iChang * SO_MAN_MOI_CHANG + i + 1,
        chang: iChang,
        soCap: soCap,
        cot: tinhCot(soCap * 2),
        xemTruoc: ch.xemTruoc[i],
        doKho: doKhoTheoSoCap(soCap)
      });
    });
  });
  const TONG_MAN = DANH_SACH_CAP.length;
  let changDangXem = 0;

  const CHU_DE = [
    { id: 'ngau-nhien', ten: 'Ngẫu nhiên', bieuTuong: '🎲' },
    { id: 'con-vat', ten: 'Con vật', bieuTuong: '🐾' },
    { id: 'hoa', ten: 'Hoa', bieuTuong: '🌸' },
    { id: 'trai-cay', ten: 'Cây trái', bieuTuong: '🍎' }
  ];

  const CAU_HINH = { id: ID, ten: 'Lật hình', bieuTuong: '🃏' };
  const k = document.getElementById('khu-tro-choi');
  let chuDeDangChon = 'ngau-nhien';

  function layTienTrinh() {
    const tc = LuuTru.layTroChoi(ID);
    return {
      capDaMo: Math.max(1, Math.min(TONG_MAN, tc.capDaMo || 1)),
      saoCap: tc.saoCap || {},
      chuDe: tc.chuDe || 'ngau-nhien'
    };
  }

  function veSao(soSao) {
    let s = '';
    for (let i = 1; i <= 3; i++) s += '<span class="' + (i <= soSao ? '' : 'mo') + '">⭐</span>';
    return s;
  }

  function changCuaMan(soMan) { return Math.floor((soMan - 1) / SO_MAN_MOI_CHANG); }

  // Chỉ hiện các chặng đã mở, cộng thêm 1 chặng kế tiếp đang khóa để bé biết còn nữa
  function veTabChang(tt) {
    const changMoCaoNhat = changCuaMan(tt.capDaMo);
    let html = '<div class="tab-chang" role="tablist" aria-label="Các chặng">';
    for (let i = 0; i <= Math.min(changMoCaoNhat + 1, CHANG.length - 1); i++) {
      const mo = i <= changMoCaoNhat;
      html += '<button type="button" role="tab" class="nut-chang' + (i === changDangXem ? ' dang-chon' : '') + (mo ? '' : ' khoa') + '" data-chang="' + i + '"' +
        ' aria-selected="' + (i === changDangXem) + '">' + (mo ? CHANG[i].bieuTuong : '🔒') + ' ' + (i * SO_MAN_MOI_CHANG + 1) + '–' + ((i + 1) * SO_MAN_MOI_CHANG) + '</button>';
    }
    return html + '</div>';
  }

  /* ---------- Màn hình chọn màn chơi ---------- */
  function moDau(changMuonXem) {
    document.body.classList.remove('dang-choi-lat');
    const tt = layTienTrinh();
    changDangXem = typeof changMuonXem === 'number' ? changMuonXem : changCuaMan(tt.capDaMo);
    chuDeDangChon = tt.chuDe;
    k.innerHTML =
      '<section class="man-chon-cap">' +
        '<div class="tieu-de-tro-choi">' + TroChoiChung.anhTieuDe(ID) + '<h1>Lật hình</h1></div>' +
        '<p class="huong-dan">Lật 2 thẻ giống nhau để ghép cặp. Chơi xong màn này sẽ mở màn tiếp theo!</p>' +
        '<h2>Chọn chủ đề</h2>' +
        '<div class="nhom-chu-de" role="group" aria-label="Chủ đề hình">' +
          CHU_DE.map(function (cd) {
            return '<button type="button" class="nut-chu-de' + (cd.id === chuDeDangChon ? ' dang-chon' : '') + '" data-chu-de="' + cd.id + '">' +
              '<span aria-hidden="true">' + cd.bieuTuong + '</span> ' + cd.ten + '</button>';
          }).join('') +
        '</div>' +
        '<h2>Chọn màn</h2>' +
        veTabChang(tt) +
        '<p class="ten-chang">' + CHANG[changDangXem].bieuTuong + ' Chặng ' + (changDangXem + 1) + ': ' + CHANG[changDangXem].ten +
          ' <span>(Màn ' + (changDangXem * SO_MAN_MOI_CHANG + 1) + '–' + ((changDangXem + 1) * SO_MAN_MOI_CHANG) + ')</span></p>' +
        '<div class="luoi-cap">' +
          DANH_SACH_CAP.filter(function (c) { return c.chang === changDangXem; }).map(function (c) {
            const mo = c.cap <= tt.capDaMo;
            const sao = tt.saoCap[c.cap] || 0;
            return '<button type="button" class="nut-cap cap-' + c.doKho + (mo ? '' : ' khoa') + (mo && c.cap === tt.capDaMo && !sao ? ' goi-y' : '') + '" data-cap="' + c.cap + '"' +
              (mo ? '' : ' aria-disabled="true"') + ' aria-label="Màn ' + c.cap + (mo ? '' : ', chưa mở') + '">' +
              '<span class="so-cap">' + (mo ? c.cap : '🔒') + '</span>' +
              '<span class="mo-ta-cap">' + c.soCap + ' cặp</span>' +
              '<span class="sao-cap">' + (mo ? veSao(sao) : 'Màn ' + c.cap) + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</section>';

    k.querySelectorAll('.nut-chu-de').forEach(function (n) {
      n.addEventListener('click', function () {
        chuDeDangChon = n.getAttribute('data-chu-de');
        AmThanh.phat('nhan');
        k.querySelectorAll('.nut-chu-de').forEach(function (x) { x.classList.toggle('dang-chon', x === n); });
        LuuTru.capNhatTroChoi(ID, function (tc) { tc.chuDe = chuDeDangChon; });
      });
    });
    k.querySelectorAll('.nut-chang').forEach(function (n) {
      n.addEventListener('click', function () {
        if (n.classList.contains('khoa')) {
          AmThanh.phat('sai');
          App.thongBao('🔒 Bé chơi xong Màn ' + (Number(n.getAttribute('data-chang')) * SO_MAN_MOI_CHANG) + ' để mở chặng này nhé!');
          return;
        }
        AmThanh.phat('nhan');
        moDau(Number(n.getAttribute('data-chang')));
      });
    });
    k.querySelectorAll('.nut-cap').forEach(function (n) {
      n.addEventListener('click', function () {
        if (n.classList.contains('khoa')) {
          AmThanh.phat('sai');
          App.thongBao('🔒 Bé chơi xong màn trước để mở màn này nhé!');
          return;
        }
        AmThanh.phat('nhan');
        batDau(Number(n.getAttribute('data-cap')));
      });
    });
    window.scrollTo(0, 0);
  }

  /* ---------- Chọn hình ngẫu nhiên theo chủ đề ---------- */
  function chonHinh(soCap) {
    const theoChuDe = chuDeDangChon === 'ngau-nhien' ? HINH_LAT
      : HINH_LAT.filter(function (h) { return h.nhom === chuDeDangChon; });
    let chon = App.tron(theoChuDe).slice(0, soCap);
    if (chon.length < soCap) {
      // Chủ đề không đủ hình thì lấy thêm từ chủ đề khác
      const conLai = App.tron(HINH_LAT.filter(function (h) { return chon.indexOf(h) < 0; }));
      chon = chon.concat(conLai.slice(0, soCap - chon.length));
    }
    return chon;
  }

  function taiTruoc(dsHinh, xong) {
    let conLai = dsHinh.length;
    let daXong = false;
    function mot() {
      conLai--;
      if (conLai <= 0 && !daXong) { daXong = true; xong(); }
    }
    dsHinh.forEach(function (h) {
      const anh = new Image();
      anh.onload = mot;
      anh.onerror = mot;
      anh.src = THU_MUC_HINH + h.id + '.png';
    });
    // Không chờ quá 3 giây
    setTimeout(function () { if (!daXong) { daXong = true; xong(); } }, 3000);
  }

  // Chọn số cột/hàng (chia hết số thẻ) để thẻ to nhất, lấp đầy khoảng trống của màn hình
  function xepLuoi(luoi, soThe) {
    const w = luoi.clientWidth, h = luoi.clientHeight;
    if (!w || !h) return;
    const gap = parseFloat(getComputedStyle(luoi).columnGap) || 0;
    let tot = null;
    for (let c = 1; c <= soThe; c++) {
      if (soThe % c) continue;
      const r = soThe / c;
      const canh = Math.min((w - gap * (c - 1)) / c, (h - gap * (r - 1)) / r);
      if (!tot || canh > tot.canh + 1) tot = { c: c, r: r, canh: canh };
    }
    luoi.style.gridTemplateColumns = 'repeat(' + tot.c + ', minmax(0, 1fr))';
    luoi.style.gridTemplateRows = 'repeat(' + tot.r + ', minmax(0, 1fr))';
  }

  /* ---------- Chơi một màn ---------- */
  function batDau(soCapDo) {
    const cd = DANH_SACH_CAP[soCapDo - 1];
    const hinh = chonHinh(cd.soCap);
    const bo = App.tron(hinh.concat(hinh));
    let luotLat = 0;
    let soCapDung = 0;
    let diemNhan = 0;
    let dangMo = [];
    let khoa = true;
    DiemSo.datLaiChuoi();

    document.body.classList.add('dang-choi-lat');
    k.innerHTML = '<p class="huong-dan dang-tai">⏳ Đang chuẩn bị thẻ hình...</p>';

    taiTruoc(hinh, function () {
      k.innerHTML =
        '<section class="man-lat-hinh">' +
          '<div class="thanh-thong-tin">' +
            '<button type="button" class="nut nut-tron nut-trang nut-nho" id="nut-chon-cap" aria-label="Chọn màn khác" title="Chọn màn khác">🗂️</button>' +
            '<span class="o-thong-tin o-cap cap-' + cd.doKho + '">' + CHANG[cd.chang].bieuTuong + ' Màn ' + cd.cap + '</span>' +
            '<span class="o-thong-tin">🔄 Lượt: <b id="luot-lat">0</b></span>' +
            '<span class="o-thong-tin">✅ <b id="so-cap">0</b>/' + cd.soCap + '</span>' +
          '</div>' +
          '<p class="huong-dan" id="loi-nhac">' + (cd.xemTruoc ? '👀 Bé hãy ghi nhớ các hình nhé!' : 'Màn này không được xem trước đâu nhé! 💪') + '</p>' +
          '<div class="luoi-the-lat" id="luoi-the-lat">' +
            bo.map(function (h, i) {
              return '<button type="button" class="the-lat' + (cd.xemTruoc ? ' lat' : '') + '" data-hinh="' + h.id + '" aria-label="Thẻ số ' + (i + 1) + '">' +
                '<span class="the-trong">' +
                  '<span class="mat mat-sau" aria-hidden="true"></span>' +
                  '<span class="mat mat-truoc"><img src="' + THU_MUC_HINH + h.id + '.png" alt="' + h.ten + '" draggable="false"></span>' +
                '</span>' +
              '</button>';
            }).join('') +
          '</div>' +
        '</section>';

      const luoi = k.querySelector('#luoi-the-lat');
      xepLuoi(luoi, bo.length);
      if (window.ResizeObserver) new ResizeObserver(function () { xepLuoi(luoi, bo.length); }).observe(luoi);
      const cacThe = Array.prototype.slice.call(k.querySelectorAll('.the-lat'));
      const loiNhac = k.querySelector('#loi-nhac');
      k.querySelector('#nut-chon-cap').addEventListener('click', function () {
        AmThanh.phat('nhan');
        moDau();
      });

      if (cd.xemTruoc) {
        setTimeout(function () {
          cacThe.forEach(function (t) { t.classList.remove('lat'); });
          loiNhac.textContent = 'Lật hai thẻ giống nhau nào! 🃏';
          khoa = false;
        }, cd.xemTruoc);
      } else {
        khoa = false;
      }

      cacThe.forEach(function (the) {
        the.addEventListener('click', function () {
          if (khoa || the.classList.contains('lat') || the.classList.contains('khop')) return;
          AmThanh.phat('latThe');
          the.classList.add('lat');
          dangMo.push(the);
          if (dangMo.length < 2) return;

          luotLat++;
          k.querySelector('#luot-lat').textContent = luotLat;
          const a = dangMo[0];
          const b = dangMo[1];
          dangMo = [];

          if (a.getAttribute('data-hinh') === b.getAttribute('data-hinh')) {
            a.classList.add('khop');
            b.classList.add('khop');
            soCapDung++;
            k.querySelector('#so-cap').textContent = soCapDung;
            const kq = DiemSo.traLoiDung();
            diemNhan += kq.diem + kq.thuong;
            AmThanh.phat('dung');
            App.diemBay(b, '+' + kq.diem);
            const ten = HINH_LAT.filter(function (h) { return h.id === a.getAttribute('data-hinh'); })[0].ten;
            loiNhac.textContent = kq.thuong
              ? '🔥 ' + kq.chuoi + ' cặp liên tiếp! Thưởng +' + kq.thuong
              : '🎉 ' + ten + '! ' + App.chon(TroChoiChung.LOI_KHEN);
            if (soCapDung === cd.soCap) setTimeout(function () { hoanThanhCap(cd, luotLat, diemNhan); }, 900);
          } else {
            khoa = true;
            DiemSo.traLoiSai();
            loiNhac.textContent = 'Chưa giống rồi, thử lại nhé! 😊';
            setTimeout(function () {
              a.classList.remove('lat');
              b.classList.remove('lat');
              khoa = false;
            }, 850);
          }
        });
      });
    });
  }

  function hoanThanhCap(cd, luotLat, diemNhan) {
    document.body.classList.remove('dang-choi-lat');
    const soSao = luotLat <= Math.ceil(cd.soCap * 1.4) ? 3 : (luotLat <= cd.soCap * 2 ? 2 : 1);
    const coCapSau = cd.cap < TONG_MAN;
    const moChangMoi = coCapSau && cd.cap % SO_MAN_MOI_CHANG === 0;
    let moCapMoi = false;
    LuuTru.capNhatTroChoi(ID, function (tc) {
      const capDaMo = tc.capDaMo || 1;
      if (coCapSau && cd.cap + 1 > capDaMo) { tc.capDaMo = cd.cap + 1; moCapMoi = true; }
      if (!coCapSau) tc.daXongTatCa = true;
      tc.saoCap = tc.saoCap || {};
      if (!(tc.saoCap[cd.cap] >= soSao)) tc.saoCap[cd.cap] = soSao;
    });
    TroChoiChung.ketThuc(CAU_HINH, {
      doKho: cd.doKho,
      diemNhan: diemNhan,
      soSao: soSao,
      thongDiep: 'Bé qua <b>Màn ' + cd.cap + '</b>: tìm hết ' + cd.soCap + ' cặp sau <b>' + luotLat + '</b> lượt lật!',
      thongDiepPhu: (moCapMoi && moChangMoi)
        ? '🎁 Mở thêm 10 màn mới: ' + CHANG[cd.chang + 1].bieuTuong + ' ' + CHANG[cd.chang + 1].ten + '!'
        : (moCapMoi ? '🔓 Đã mở khóa Màn ' + (cd.cap + 1) + '!' : (coCapSau ? '' : '🏆 Bé đã chinh phục cả ' + TONG_MAN + ' màn!'))
    }, {
      tiepTheo: coCapSau ? function () { batDau(cd.cap + 1); } : null,
      nhanTiepTheo: '➡️ Màn ' + (cd.cap + 1),
      choiLai: function () { batDau(cd.cap); },
      doiDoKho: function () { moDau(); },
      nhanDoiDoKho: '🗂️ Chọn màn'
    });
  }

  TroChoiChung.khoiDongTrang(moDau);
})();
