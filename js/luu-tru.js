/* =========================================================
   LƯU TRỮ TẬP TRUNG - Thế Giới Bé Thông Minh
   Mọi trò chơi đều đọc/ghi dữ liệu qua LuuTru, không tự
   gọi localStorage riêng.
   ========================================================= */
const LuuTru = (function () {
  'use strict';

  const KHOA_LUU_TRU = 'the-gioi-be-thong-minh';
  const PHIEN_BAN = 1;

  function duLieuMacDinh() {
    return {
      phienBan: PHIEN_BAN,
      tenNguoiChoi: '',
      diem: 0,
      sao: 0,
      capDo: 1,
      thanhTich: {},   // { idThanhTich: thờiĐiểmMởKhóa }
      troChoi: {},     // { idTroChoi: { soLanHoanThanh, doKhoDaXong, diemCaoNhat, lanChoiCuoi } }
      caiDat: { amThanh: true, nhacNen: true, daHoiTen: false, toanManHinh: false }
    };
  }

  function troChoiMacDinh() {
    return { soLanHoanThanh: 0, doKhoDaXong: {}, diemCaoNhat: 0, lanChoiCuoi: 0 };
  }

  function laDoiTuong(x) {
    return x !== null && typeof x === 'object' && !Array.isArray(x);
  }

  // Gộp dữ liệu đã lưu vào dữ liệu mặc định (giữ dữ liệu cũ, bổ sung trường mới)
  function hopNhat(macDinh, daLuu) {
    const ketQua = Object.assign({}, macDinh);
    if (!laDoiTuong(daLuu)) return ketQua;
    Object.keys(daLuu).forEach(function (khoa) {
      if (laDoiTuong(macDinh[khoa]) && laDoiTuong(daLuu[khoa])) {
        ketQua[khoa] = hopNhat(macDinh[khoa], daLuu[khoa]);
      } else if (daLuu[khoa] !== undefined) {
        ketQua[khoa] = daLuu[khoa];
      }
    });
    return ketQua;
  }

  function chuanHoa(d) {
    ['diem', 'sao'].forEach(function (k) {
      if (typeof d[k] !== 'number' || !isFinite(d[k]) || d[k] < 0) d[k] = 0;
    });
    if (typeof d.capDo !== 'number' || !isFinite(d.capDo) || d.capDo < 1) d.capDo = 1;
    if (typeof d.tenNguoiChoi !== 'string') d.tenNguoiChoi = '';
    if (!laDoiTuong(d.thanhTich)) d.thanhTich = {};
    if (!laDoiTuong(d.troChoi)) d.troChoi = {};
    if (!laDoiTuong(d.caiDat)) d.caiDat = duLieuMacDinh().caiDat;
    d.phienBan = PHIEN_BAN;
    return d;
  }

  let boNhoTam = null;
  let daCanhBao = false;

  function docTuTrinhDuyet() {
    try {
      const chuoi = window.localStorage.getItem(KHOA_LUU_TRU);
      if (!chuoi) return duLieuMacDinh();
      return chuanHoa(hopNhat(duLieuMacDinh(), JSON.parse(chuoi)));
    } catch (loi) {
      console.warn('[Lưu trữ] Không đọc được dữ liệu cũ, dùng dữ liệu mới.', loi);
      return duLieuMacDinh();
    }
  }

  function layDuLieu() {
    if (!boNhoTam) boNhoTam = docTuTrinhDuyet();
    return boNhoTam;
  }

  function ghi() {
    try {
      window.localStorage.setItem(KHOA_LUU_TRU, JSON.stringify(boNhoTam));
      return true;
    } catch (loi) {
      if (!daCanhBao) {
        daCanhBao = true;
        console.warn('[Lưu trữ] Trình duyệt không cho lưu dữ liệu. Tiến trình chỉ giữ trong lần chơi này.', loi);
      }
      return false;
    }
  }

  function saoChep(x) {
    return JSON.parse(JSON.stringify(x));
  }

  function baoThayDoi() {
    try { window.dispatchEvent(new CustomEvent('tgbtm:thay-doi')); } catch (loi) { /* bỏ qua */ }
  }

  function lay(khoa) {
    const giaTri = layDuLieu()[khoa];
    return (giaTri && typeof giaTri === 'object') ? saoChep(giaTri) : giaTri;
  }

  function layTatCa() {
    return saoChep(layDuLieu());
  }

  function dat(khoa, giaTri) {
    layDuLieu()[khoa] = giaTri;
    chuanHoa(boNhoTam);
    ghi();
    baoThayDoi();
  }

  // hamSua nhận trực tiếp đối tượng dữ liệu để sửa
  function capNhat(hamSua) {
    const d = layDuLieu();
    hamSua(d);
    chuanHoa(d);
    ghi();
    baoThayDoi();
    return saoChep(d);
  }

  function layTroChoi(id) {
    return hopNhat(troChoiMacDinh(), layDuLieu().troChoi[id] || {});
  }

  function capNhatTroChoi(id, hamSua) {
    return capNhat(function (d) {
      const tc = hopNhat(troChoiMacDinh(), d.troChoi[id] || {});
      hamSua(tc);
      d.troChoi[id] = tc;
    });
  }

  function xoaTatCa() {
    boNhoTam = duLieuMacDinh();
    boNhoTam.caiDat.daHoiTen = true;
    try { window.localStorage.removeItem(KHOA_LUU_TRU); } catch (loi) { /* bỏ qua */ }
    ghi();
    baoThayDoi();
  }

  // Đồng bộ khi mở trò chơi ở nhiều tab
  window.addEventListener('storage', function (e) {
    if (e.key === KHOA_LUU_TRU) {
      boNhoTam = null;
      baoThayDoi();
    }
  });

  return {
    lay: lay,
    layTatCa: layTatCa,
    dat: dat,
    capNhat: capNhat,
    layTroChoi: layTroChoi,
    capNhatTroChoi: capNhatTroChoi,
    xoaTatCa: xoaTatCa
  };
})();
