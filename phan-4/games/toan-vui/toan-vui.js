/* =========================================================
   TRÒ CHƠI: TOÁN VUI
   Dễ: cộng trong phạm vi 5 (có hình minh họa)
   Trung bình: cộng, trừ trong phạm vi 10
   Khó: cộng, trừ trong phạm vi 20, có dạng tìm số còn thiếu
   Không bao giờ ra kết quả âm.
   ========================================================= */
(function () {
  'use strict';

  const HINH = [':dau:', ':dua-thom:', ':dua-hau:', ':ca-chua:', ':vit:', ':ot:', ':nho:', ':buom:'];
  const DAU_TRU = '−';

  function minhHoa(a, b, phep) {
    const hinh = App.chon(HINH);
    let trai = '';
    if (phep === '+') {
      for (let i = 0; i < a; i++) trai += '<span>' + hinh + '</span>';
      let phai = '';
      for (let j = 0; j < b; j++) phai += '<span>' + hinh + '</span>';
      return '<div class="minh-hoa" aria-hidden="true"><span class="nhom">' + trai + '</span><b>+</b><span class="nhom">' + phai + '</span></div>';
    }
    // phép trừ: gạch bớt b hình trong a hình
    for (let k = 0; k < a; k++) {
      trai += '<span class="' + (k >= a - b ? 'bi-bot' : '') + '">' + hinh + '</span>';
    }
    return '<div class="minh-hoa" aria-hidden="true"><span class="nhom">' + trai + '</span></div>';
  }

  function phepTinhHtml(cacPhan) {
    return '<div class="phep-tinh">' + cacPhan.map(function (p) {
      if (p === '?') return '<span class="o-hoi">?</span>';
      if (p === '+' || p === DAU_TRU || p === '=') return '<span class="dau">' + p + '</span>';
      return '<span>' + p + '</span>';
    }).join('') + '</div>';
  }

  function taoCauHoi(doKho, lichSu) {
    const toiDa = doKho === 'de' ? 5 : (doKho === 'trung-binh' ? 10 : 20);
    const soLuaChon = doKho === 'kho' ? 4 : 3;
    let a, b, phep, ketQua, khoa, thu = 0;
    do {
      phep = (doKho === 'de' || Math.random() < 0.5) ? '+' : DAU_TRU;
      if (phep === '+') {
        a = App.ngauNhien(1, toiDa - 1);
        b = App.ngauNhien(1, toiDa - a);
        ketQua = a + b;
      } else {
        a = App.ngauNhien(2, toiDa);
        b = App.ngauNhien(1, a - 1);
        ketQua = a - b;
      }
      khoa = a + phep + b;
      thu++;
    } while (lichSu.indexOf(khoa) >= 0 && thu < 40);

    // Mức khó: 1/3 số câu là dạng tìm số còn thiếu (a + ? = kết quả)
    const timSoThieu = doKho === 'kho' && Math.random() < 0.35;
    const dapAnDung = timSoThieu ? b : ketQua;
    const lc = TroChoiChung.taoLuaChonSo(dapAnDung, soLuaChon, 0, toiDa);
    const coMinhHoa = doKho === 'de' || (doKho === 'trung-binh' && a <= 6);

    return {
      khoa: khoa,
      cauHoi: timSoThieu ? 'Số nào điền vào ô trống?' : 'Bằng bao nhiêu nhỉ?',
      noiDung: '<div class="khung-phep-tinh">' +
        phepTinhHtml(timSoThieu ? [a, phep, '?', '=', ketQua] : [a, phep, b, '=', '?']) +
        (coMinhHoa && !timSoThieu ? minhHoa(a, b, phep) : '') +
        '</div>',
      dapAn: lc.mang.map(String),
      lopDapAn: 'dap-an-so',
      dung: lc.dung
    };
  }

  const CAU_HINH = {
    id: 'toan-vui',
    ten: 'Toán vui',
    bieuTuong: '➕',
    soCau: 10,
    huongDan: 'Làm phép tính cộng, trừ thật vui nào!',
    moTaDoKho: {
      'de': 'Phép cộng đến 5, có hình',
      'trung-binh': 'Cộng, trừ đến 10',
      'kho': 'Cộng, trừ đến 20'
    },
    taoCauHoi: taoCauHoi
  };

  TroChoiChung.khoiDongTrang(function () { TroChoiChung.chayTroChoiCauHoi(CAU_HINH); });
})();
