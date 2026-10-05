/* =========================================================
   THÀNH TÍCH - danh sách và kiểm tra mở khóa.
   Muốn thêm thành tích mới: thêm một dòng vào DANH_SACH.
   ========================================================= */
const ThanhTich = (function () {
  'use strict';

  function daXong(d, idTroChoi) {
    const tc = d.troChoi[idTroChoi];
    return !!(tc && tc.soLanHoanThanh > 0);
  }

  const DANH_SACH = [
    { id: 'ngoi-sao-dau-tien', bieuTuong: '🌟', ten: 'Ngôi sao đầu tiên', moTa: 'Nhận ngôi sao đầu tiên', dieuKien: function (d) { return d.sao >= 1; } },
    { id: 'hoa-si-nhi', bieuTuong: '🎨', ten: 'Họa sĩ nhí', moTa: 'Tô xong một bức tranh', dieuKien: function (d) { return daXong(d, 'to-mau'); } },
    { id: 'chuyen-gia-ghep-hinh', bieuTuong: '🧩', ten: 'Chuyên gia ghép hình', moTa: 'Ghép xong một bức hình', dieuKien: function (d) { return daXong(d, 'ghep-hinh'); } },
    { id: 'vua-lat-hinh', bieuTuong: '🃏', ten: 'Vua lật hình', moTa: 'Chơi xong một màn Lật hình', dieuKien: function (d) { return daXong(d, 'lat-hinh'); } },
    { id: 'cao-thu-lat-hinh', bieuTuong: '👑', ten: 'Cao thủ lật hình', moTa: 'Vượt qua cả 50 màn Lật hình', dieuKien: function (d) { return !!(d.troChoi['lat-hinh'] && d.troChoi['lat-hinh'].daXongTatCa); } },
    { id: 'nha-tham-hiem', bieuTuong: '🗺️', ten: 'Nhà thám hiểm', moTa: 'Mở được chặng 2 của Lật hình', dieuKien: function (d) { return !!(d.troChoi['lat-hinh'] && d.troChoi['lat-hinh'].capDaMo > 10); } },
    { id: 'cung-thu-nhi', bieuTuong: '🏹', ten: 'Cung thủ nhí', moTa: 'Chơi xong trò Bắn cung', dieuKien: function (d) { return daXong(d, 'ban-cung'); } },
    { id: 'xa-thu-tai-ba', bieuTuong: '🎯', ten: 'Xạ thủ tài ba', moTa: 'Chơi xong Bắn cung ở mức Khó', dieuKien: function (d) { const tc = d.troChoi['ban-cung']; return !!(tc && tc.doKhoDaXong && tc.doKhoDaXong.kho); } },
    { id: 'tho-san-no', bieuTuong: '🏹', ten: 'Thợ săn bắn nỏ', moTa: 'Qua màn đầu tiên của trò Bắn nỏ', dieuKien: function (d) { return daXong(d, 'ban-no'); } },
    { id: 'than-no', bieuTuong: '🏅', ten: 'Thần nỏ', moTa: 'Vượt qua cả 10 màn Bắn nỏ', dieuKien: function (d) { return !!(d.troChoi['ban-no'] && d.troChoi['ban-no'].daXongTatCa); } },
    { id: 'tay-lai-lua', bieuTuong: '🏎️', ten: 'Tay lái lụa', moTa: 'Về đích trò Đua xe', dieuKien: function (d) { return daXong(d, 'dua-xe'); } },
    { id: 'lai-xe-an-toan', bieuTuong: '🛡️', ten: 'Lái xe an toàn', moTa: 'Về đích Đua xe mà không đụng vật cản nào', dieuKien: function (d) { const tc = d.troChoi['dua-xe']; return !!(tc && tc.khongVaCham); } },
    { id: 'tay-dua-sieu-hang', bieuTuong: '🥇', ten: 'Tay đua siêu hạng', moTa: 'Về đích Đua xe ở mức Khó', dieuKien: function (d) { const tc = d.troChoi['dua-xe']; return !!(tc && tc.doKhoDaXong && tc.doKhoDaXong.kho); } },
    { id: 'dau-bep-nhi', bieuTuong: '🧁', ten: 'Đầu bếp nhí', moTa: 'Làm xong một món ở Tiệm kẹo – bánh – kem', dieuKien: function (d) { return daXong(d, 'tiem-keo-banh-kem'); } }
  ];

  function kiemTra() {
    const d = LuuTru.layTatCa();
    const moi = DANH_SACH.filter(function (t) { return !d.thanhTich[t.id] && t.dieuKien(d); });
    if (!moi.length) return [];
    LuuTru.capNhat(function (x) {
      moi.forEach(function (t) { x.thanhTich[t.id] = Date.now(); });
    });
    moi.forEach(function (t) {
      if (typeof App !== 'undefined') App.hienThanhTichMoi(t);
    });
    return moi;
  }

  function daMo(id) {
    return !!(LuuTru.lay('thanhTich') || {})[id];
  }

  function soDaMo() {
    const t = LuuTru.lay('thanhTich') || {};
    return DANH_SACH.filter(function (a) { return t[a.id]; }).length;
  }

  return { DANH_SACH: DANH_SACH, kiemTra: kiemTra, daMo: daMo, soDaMo: soDaMo, tong: DANH_SACH.length };
})();
