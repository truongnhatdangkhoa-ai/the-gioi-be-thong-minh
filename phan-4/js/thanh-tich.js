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
    { id: 'be-hoc-chu', bieuTuong: '🔤', ten: 'Bé học chữ', moTa: 'Chơi xong trò Học chữ', dieuKien: function (d) { return daXong(d, 'hoc-chu'); } },
    { id: 'be-gioi-dem', bieuTuong: '🧮', ten: 'Bé giỏi đếm', moTa: 'Chơi xong trò Học số', dieuKien: function (d) { return daXong(d, 'hoc-so'); } },
    { id: 'hoa-si-nhi', bieuTuong: '🎨', ten: 'Họa sĩ nhí', moTa: 'Tô xong một bức tranh', dieuKien: function (d) { return daXong(d, 'to-mau'); } },
    { id: 'chuyen-gia-ghep-hinh', bieuTuong: '🧩', ten: 'Chuyên gia ghép hình', moTa: 'Ghép xong một bức hình', dieuKien: function (d) { return daXong(d, 'ghep-hinh'); } },
    { id: 'ban-cua-cac-loai-vat', bieuTuong: '🐶', ten: 'Bạn của các loài vật', moTa: 'Chơi xong trò Đoán con vật', dieuKien: function (d) { return daXong(d, 'doan-con-vat'); } },
    { id: 'vua-lat-hinh', bieuTuong: '🃏', ten: 'Vua lật hình', moTa: 'Chơi xong một màn Lật hình', dieuKien: function (d) { return daXong(d, 'lat-hinh'); } },
    { id: 'cao-thu-lat-hinh', bieuTuong: '👑', ten: 'Cao thủ lật hình', moTa: 'Vượt qua cả 50 màn Lật hình', dieuKien: function (d) { return !!(d.troChoi['lat-hinh'] && d.troChoi['lat-hinh'].daXongTatCa); } },
    { id: 'nha-tham-hiem', bieuTuong: '🗺️', ten: 'Nhà thám hiểm', moTa: 'Mở được chặng 2 của Lật hình', dieuKien: function (d) { return !!(d.troChoi['lat-hinh'] && d.troChoi['lat-hinh'].capDaMo > 10); } },
    { id: 'cung-thu-nhi', bieuTuong: '🏹', ten: 'Cung thủ nhí', moTa: 'Chơi xong trò Bắn cung', dieuKien: function (d) { return daXong(d, 'ban-cung'); } },
    { id: 'xa-thu-tai-ba', bieuTuong: '🎯', ten: 'Xạ thủ tài ba', moTa: 'Chơi xong Bắn cung ở mức Khó', dieuKien: function (d) { const tc = d.troChoi['ban-cung']; return !!(tc && tc.doKhoDaXong && tc.doKhoDaXong.kho); } },
    { id: 'ban-cua-loai-ca', bieuTuong: '🐠', ten: 'Bạn của loài cá', moTa: 'Chơi xong trò Cho cá ăn', dieuKien: function (d) { return daXong(d, 'cho-ca-an'); } },
    { id: 'tay-lai-lua', bieuTuong: '🏎️', ten: 'Tay lái lụa', moTa: 'Về đích trò Đua xe', dieuKien: function (d) { return daXong(d, 'dua-xe'); } },
    { id: 'lai-xe-an-toan', bieuTuong: '🛡️', ten: 'Lái xe an toàn', moTa: 'Về đích Đua xe mà không đụng vật cản nào', dieuKien: function (d) { const tc = d.troChoi['dua-xe']; return !!(tc && tc.khongVaCham); } },
    { id: 'tay-dua-sieu-hang', bieuTuong: '🥇', ten: 'Tay đua siêu hạng', moTa: 'Về đích Đua xe ở mức Khó', dieuKien: function (d) { const tc = d.troChoi['dua-xe']; return !!(tc && tc.doKhoDaXong && tc.doKhoDaXong.kho); } },
    { id: 'be-gioi-toan', bieuTuong: '🔢', ten: 'Bé giỏi toán', moTa: 'Chơi xong trò Toán vui', dieuKien: function (d) { return daXong(d, 'toan-vui'); } }
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
