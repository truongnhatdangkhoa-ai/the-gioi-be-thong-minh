/* =========================================================
   TRÒ CHƠI: HỌC SỐ
   4 kiểu câu hỏi: đếm đồ vật, chọn số đúng,
   so sánh lớn nhỏ, tìm số còn thiếu.
   ========================================================= */
(function () {
  'use strict';

  const DO_VAT = [
    { hinh: ':dau:', ten: 'quả dâu' },
    { hinh: ':ca:', ten: 'con cá' },
    { hinh: ':vit:', ten: 'chú vịt' },
    { hinh: ':xe:', ten: 'chiếc xe' },
    { hinh: ':dua-hau:', ten: 'quả dưa hấu' },
    { hinh: ':dua-thom:', ten: 'quả dứa' },
    { hinh: ':ca-chua:', ten: 'quả cà chua' },
    { hinh: ':hoa-hong:', ten: 'bông hoa' }
  ];
  const DOC_SO = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười',
    'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín', 'hai mươi'];
  const PHAM_VI = { 'de': 5, 'trung-binh': 10, 'kho': 20 };

  function taoCauHoi(doKho, lichSu) {
    const toiDa = PHAM_VI[doKho];
    const soLuaChon = doKho === 'de' ? 3 : 4;
    const cacKieu = doKho === 'de' ? ['dem', 'dem', 'chon-so'] : ['dem', 'chon-so', 'so-sanh', 'con-thieu'];
    let kieu, n, khoa, thu = 0;
    do {
      kieu = App.chon(cacKieu);
      n = App.ngauNhien(1, toiDa);
      khoa = kieu + n;
      thu++;
    } while (lichSu.indexOf(khoa) >= 0 && thu < 40);

    if (kieu === 'dem') {
      const vat = App.chon(DO_VAT);
      const lc = TroChoiChung.taoLuaChonSo(n, soLuaChon, 1, toiDa);
      let doVat = '';
      for (let i = 0; i < n; i++) doVat += '<span>' + vat.hinh + '</span>';
      return {
        khoa: khoa,
        cauHoi: 'Có bao nhiêu ' + vat.ten + '?',
        noiDung: '<div class="nhom-do-vat' + (n > 5 ? ' nhieu' : '') + '" aria-label="' + n + ' ' + vat.ten + '">' + doVat + '</div>',
        dapAn: lc.mang.map(String),
        lopDapAn: 'dap-an-so',
        dung: lc.dung
      };
    }

    if (kieu === 'chon-so') {
      const lc = TroChoiChung.taoLuaChonSo(n, soLuaChon, 1, toiDa);
      return {
        khoa: khoa,
        cauHoi: 'Bé hãy tìm số:',
        noiDung: '<div class="the-chu-so">' + DOC_SO[n] + '</div>',
        dapAn: lc.mang.map(String),
        lopDapAn: 'dap-an-so',
        dung: lc.dung
      };
    }

    if (kieu === 'so-sanh') {
      let m;
      do { m = App.ngauNhien(1, toiDa); } while (m === n);
      const hoiLon = Math.random() < 0.5;
      const mang = App.tron([n, m]);
      const dapAnDung = hoiLon ? Math.max(n, m) : Math.min(n, m);
      return {
        khoa: khoa + (hoiLon ? 'lon' : 'nho') + m,
        cauHoi: hoiLon ? 'Số nào <b>lớn hơn</b>?' : 'Số nào <b>nhỏ hơn</b>?',
        noiDung: '<div class="bieu-tuong-so-sanh" aria-hidden="true">' + (hoiLon ? '🐘' : '🐭') + '</div>',
        dapAn: mang.map(String),
        lopDapAn: 'dap-an-so',
        dung: mang.indexOf(dapAnDung)
      };
    }

    // con-thieu: dãy số liên tiếp có một ô trống
    const doDai = doKho === 'kho' ? 5 : 4;
    const batDau = App.ngauNhien(1, Math.max(1, toiDa - doDai + 1));
    const viTriTrong = App.ngauNhien(1, doDai - 1);
    const soThieu = batDau + viTriTrong;
    let day = '';
    for (let i = 0; i < doDai; i++) {
      day += i === viTriTrong
        ? '<span class="o-so thieu">?</span>'
        : '<span class="o-so">' + (batDau + i) + '</span>';
    }
    const lc = TroChoiChung.taoLuaChonSo(soThieu, soLuaChon, 1, toiDa);
    return {
      khoa: 'con-thieu' + soThieu,
      cauHoi: 'Số nào còn thiếu?',
      noiDung: '<div class="day-so">' + day + '</div>',
      dapAn: lc.mang.map(String),
      lopDapAn: 'dap-an-so',
      dung: lc.dung
    };
  }

  const CAU_HINH = {
    id: 'hoc-so',
    ten: 'Học số',
    bieuTuong: '🔢',
    soCau: 10,
    huongDan: 'Đếm, tìm số và so sánh cùng Gấu Mật nhé!',
    moTaDoKho: {
      'de': 'Số từ 1 đến 5',
      'trung-binh': 'Số từ 1 đến 10',
      'kho': 'Số từ 1 đến 20'
    },
    taoCauHoi: taoCauHoi
  };

  TroChoiChung.khoiDongTrang(function () { TroChoiChung.chayTroChoiCauHoi(CAU_HINH); });
})();
