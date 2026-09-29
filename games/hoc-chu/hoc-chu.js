/* =========================================================
   TRÒ CHƠI: HỌC CHỮ
   3 kiểu câu hỏi:
   - chon-hinh:   nhìn chữ cái, chọn hình bắt đầu bằng chữ đó
   - thieu-chu:   nhìn hình, tìm chữ cái còn thiếu ở đầu từ
   - viet-thuong: chữ in hoa viết thường là chữ nào
   ========================================================= */
(function () {
  'use strict';

  const CHU_CAI = [
    { chu: 'B', tu: 'Bướm', hinh: ':buom:' },
    { chu: 'C', tu: 'Cá', hinh: ':ca:' },
    { chu: 'D', tu: 'Dê', hinh: ':de:' },
    { chu: 'Đ', tu: 'Đào', hinh: ':cay-dao:', dacBiet: true },
    { chu: 'Ê', tu: 'Ếch', hinh: ':ech:', dacBiet: true },
    { chu: 'G', tu: 'Gà', hinh: ':ga:' },
    { chu: 'H', tu: 'Hoa', hinh: ':hoa-hong:' },
    { chu: 'K', tu: 'Khỉ', hinh: ':khi:' },
    { chu: 'L', tu: 'Ly ly', hinh: ':ly-ly:' },
    { chu: 'M', tu: 'Măng cụt', hinh: ':mang-cut:' },
    { chu: 'N', tu: 'Nho', hinh: ':nho:' },
    { chu: 'Ô', tu: 'Ốc sên', hinh: ':oc-sen:', dacBiet: true },
    { chu: 'Ơ', tu: 'Ớt', hinh: ':ot:', dacBiet: true },
    { chu: 'Q', tu: 'Quất', hinh: ':cay-quat:' },
    { chu: 'R', tu: 'Rùa', hinh: ':rua:' },
    { chu: 'S', tu: 'Sóc', hinh: ':soc:' },
    { chu: 'T', tu: 'Thỏ', hinh: ':tho:' },
    { chu: 'V', tu: 'Voi', hinh: ':voi:' },
    { chu: 'X', tu: 'Xe', hinh: ':xe:' }
  ];
  const CHU_DE = ['B', 'C', 'D', 'G', 'H', 'M', 'T'];

  // Chữ đầu của từ không có dấu thanh (dùng cho kiểu "tìm chữ còn thiếu")
  function laChuGoc(c) { return c.tu.charAt(0).toUpperCase() === c.chu; }

  function layKhoChu(doKho) {
    if (doKho === 'de') return CHU_CAI.filter(function (c) { return CHU_DE.indexOf(c.chu) >= 0; });
    if (doKho === 'trung-binh') return CHU_CAI.filter(function (c) { return !c.dacBiet; });
    return CHU_CAI;
  }

  function tuToChuDau(c) {
    return '<b class="chu-dau">' + c.tu.charAt(0) + '</b>' + c.tu.slice(1);
  }

  function taoCauHoi(doKho, lichSu) {
    const kho = layKhoChu(doKho);
    const soLuaChon = doKho === 'de' ? 3 : 4;
    const cacKieu = doKho === 'de' ? ['chon-hinh', 'thieu-chu'] : ['chon-hinh', 'thieu-chu', 'viet-thuong'];

    let kieu, muc, thu = 0;
    do {
      kieu = App.chon(cacKieu);
      const nguon = kieu === 'thieu-chu' ? kho.filter(laChuGoc) : kho;
      muc = App.chon(nguon);
      thu++;
    } while (lichSu.indexOf(kieu + muc.chu) >= 0 && thu < 40);

    const khac = App.layNhieu(kho.filter(function (c) { return c.chu !== muc.chu; }), soLuaChon - 1);
    const luaChon = App.tron([muc].concat(khac));
    const dung = luaChon.indexOf(muc);
    const khoa = kieu + muc.chu;

    if (kieu === 'chon-hinh') {
      return {
        khoa: khoa,
        cauHoi: 'Đây là chữ <span class="chu-nhan">' + muc.chu + '</span>. Hình nào bắt đầu bằng chữ này?',
        noiDung: '<div class="the-chu-lon" aria-hidden="true">' + muc.chu + '</div>',
        dapAn: luaChon.map(function (c) {
          return '<span class="hinh-nho" aria-hidden="true">' + c.hinh + '</span><span class="chu-nho">' + c.tu + '</span>';
        }),
        lopDapAn: 'dap-an-hinh',
        dung: dung
      };
    }

    if (kieu === 'thieu-chu') {
      return {
        khoa: khoa,
        cauHoi: 'Đây là chữ gì? Bé tìm chữ còn thiếu nhé!',
        noiDung: '<div class="the-tu"><span class="hinh-lon" aria-hidden="true">' + muc.hinh + '</span>' +
          '<span class="tu"><span class="o-trong">?</span>' + muc.tu.slice(1) + '</span></div>',
        dapAn: luaChon.map(function (c) { return c.chu; }),
        lopDapAn: 'dap-an-chu',
        dung: dung
      };
    }

    // viet-thuong
    return {
      khoa: khoa,
      cauHoi: 'Chữ <span class="chu-nhan">' + muc.chu + '</span> viết thường là chữ nào?',
      noiDung: '<div class="the-tu"><div class="the-chu-lon" aria-hidden="true">' + muc.chu + '</div>' +
        '<span class="goi-y-tu">' + muc.hinh + ' ' + tuToChuDau(muc) + '</span></div>',
      dapAn: luaChon.map(function (c) { return c.chu.toLowerCase(); }),
      lopDapAn: 'dap-an-chu',
      dung: dung
    };
  }

  const CAU_HINH = {
    id: 'hoc-chu',
    ten: 'Học chữ',
    bieuTuong: '🔤',
    soCau: 10,
    huongDan: 'Nhìn chữ cái và hình, rồi chọn đáp án đúng nhé!',
    moTaDoKho: {
      'de': '10 chữ quen thuộc',
      'trung-binh': 'Nhiều chữ hơn, có chữ thường',
      'kho': 'Có cả Ă, Â, Đ, Ê, Ô, Ơ'
    },
    taoCauHoi: taoCauHoi
  };

  TroChoiChung.khoiDongTrang(function () { TroChoiChung.chayTroChoiCauHoi(CAU_HINH); });
})();
