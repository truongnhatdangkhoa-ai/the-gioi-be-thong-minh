/* =========================================================
   TRÒ CHƠI: ĐOÁN CON VẬT
   - nhin-hinh: nhìn hình, chọn tên
   - tim-hinh:  nghe tên, tìm hình
   - goi-y:     đoán qua tiếng kêu hoặc đặc điểm (Khó)
   ========================================================= */
(function () {
  'use strict';

  // quen: con vật quen thuộc (dùng ở mức Dễ)
  const CON_VAT = [
    { hinh: ':cho:', ten: 'Con chó', keu: 'Gâu gâu', quen: true },
    { hinh: ':voi:', ten: 'Con voi', dacDiem: 'có cái vòi rất dài', quen: true },
    { hinh: ':ca:', ten: 'Con cá', dacDiem: 'bơi dưới nước và có vây', quen: true },
    { hinh: ':ga:', ten: 'Con gà', keu: 'Ò ó o', quen: true },
    { hinh: ':heo:', ten: 'Con heo', keu: 'Ụt ịt', quen: true },
    { hinh: ':vit:', ten: 'Con vịt', keu: 'Cạp cạp', quen: true },
    { hinh: ':tho:', ten: 'Con thỏ', dacDiem: 'có đôi tai dài, thích ăn cà rốt', quen: true },
    { hinh: ':chuot:', ten: 'Con chuột', keu: 'Chít chít', quen: true },
    { hinh: ':ngua:', ten: 'Con ngựa', keu: 'Hí hí' },
    { hinh: ':khi:', ten: 'Con khỉ', dacDiem: 'thích ăn chuối và leo trèo' },
    { hinh: ':ech:', ten: 'Con ếch', keu: 'Ộp ộp' },
    { hinh: ':rua:', ten: 'Con rùa', dacDiem: 'mang mai cứng trên lưng, bò rất chậm' },
    { hinh: ':ran:', ten: 'Con rắn', dacDiem: 'có thân dài và không có chân' },
    { hinh: ':gau:', ten: 'Con gấu', dacDiem: 'to lớn và thích ăn mật ong' },
    { hinh: ':huou:', ten: 'Hươu cao cổ', dacDiem: 'có cái cổ rất dài' },
    { hinh: ':canh-cut:', ten: 'Chim cánh cụt', dacDiem: 'sống ở xứ lạnh, đi lạch bạch' },
    { hinh: ':buom:', ten: 'Con bướm', dacDiem: 'có đôi cánh nhiều màu sắc' },
    { hinh: ':ca-sau:', ten: 'Cá sấu', dacDiem: 'có hàm răng nhọn, sống dưới sông' },
    { hinh: ':cua:', ten: 'Con cua', dacDiem: 'có hai cái càng và bò ngang' },
    { hinh: ':bach-tuoc:', ten: 'Bạch tuộc', dacDiem: 'có tám cái chân' },
    { hinh: ':cuu:', ten: 'Con cừu', keu: 'Be be', dacDiem: 'có bộ lông xù trắng' },
    { hinh: ':de:', ten: 'Con dê', dacDiem: 'có chòm râu và cặp sừng nhỏ' }
  ];

  function taoCauHoi(doKho, lichSu) {
    const kho = doKho === 'de' ? CON_VAT.filter(function (c) { return c.quen; }) : CON_VAT;
    const soLuaChon = doKho === 'de' ? 3 : 4;
    const cacKieu = doKho === 'de' ? ['nhin-hinh', 'nhin-hinh', 'tim-hinh']
      : (doKho === 'trung-binh' ? ['nhin-hinh', 'tim-hinh'] : ['nhin-hinh', 'tim-hinh', 'goi-y', 'goi-y']);
    const kieu = App.chon(cacKieu);
    const muc = TroChoiChung.chonKhongLap(kho, function (c) { return c.hinh; }, lichSu);
    const khac = App.layNhieu(kho.filter(function (c) { return c !== muc; }), soLuaChon - 1);
    const luaChon = App.tron([muc].concat(khac));
    const dung = luaChon.indexOf(muc);

    if (kieu === 'nhin-hinh') {
      return {
        khoa: muc.hinh,
        cauHoi: 'Đây là con gì?',
        noiDung: '<div class="hinh-lon hinh-con-vat" aria-hidden="true">' + muc.hinh + '</div>',
        dapAn: luaChon.map(function (c) { return '<span class="chu-nho">' + c.ten + '</span>'; }),
        lopDapAn: 'dap-an-ten',
        dung: dung
      };
    }

    const dapAnHinh = luaChon.map(function (c) {
      return '<span class="hinh-nho hinh-nho-lon" aria-label="' + c.ten + '">' + c.hinh + '</span>';
    });

    if (kieu === 'tim-hinh') {
      return {
        khoa: muc.hinh,
        cauHoi: '<span class="chu-nhan">' + muc.ten + '</span> ở đâu nhỉ?',
        noiDung: '<div class="bieu-tuong-tim" aria-hidden="true">🔍</div>',
        dapAn: dapAnHinh,
        lopDapAn: 'dap-an-hinh',
        dung: dung
      };
    }

    // goi-y: ưu tiên tiếng kêu, nếu không có thì dùng đặc điểm
    const dungTiengKeu = muc.keu && (!muc.dacDiem || Math.random() < 0.6);
    return {
      khoa: muc.hinh,
      cauHoi: dungTiengKeu ? 'Con gì kêu “' + muc.keu + '”?' : 'Con gì ' + muc.dacDiem + '?',
      noiDung: '<div class="bieu-tuong-tim" aria-hidden="true">' + (dungTiengKeu ? '👂' : '🤔') + '</div>',
      dapAn: dapAnHinh,
      lopDapAn: 'dap-an-hinh',
      dung: dung
    };
  }

  const CAU_HINH = {
    id: 'doan-con-vat',
    ten: 'Đoán con vật',
    bieuTuong: '🐶',
    soCau: 10,
    huongDan: 'Nhìn hình, nghe gợi ý và đoán tên con vật nhé!',
    moTaDoKho: {
      'de': 'Con vật quen thuộc',
      'trung-binh': 'Nhiều con vật hơn',
      'kho': 'Đoán qua tiếng kêu và đặc điểm'
    },
    taoCauHoi: taoCauHoi
  };

  TroChoiChung.khoiDongTrang(function () { TroChoiChung.chayTroChoiCauHoi(CAU_HINH); });
})();
