/* =========================================================
   ĐIỂM SỐ - điểm, sao, cấp độ, thưởng chuỗi đúng liên tiếp.
   Không bao giờ trừ điểm.
   ========================================================= */
const DiemSo = (function () {
  'use strict';

  const DIEM_TRA_LOI_DUNG = 10;
  const SAO_HOAN_THANH = 5;
  const SO_CAU_CHUOI = 3;          // cứ 3 câu đúng liên tiếp...
  const DIEM_THUONG_CHUOI = 5;     // ...được thưởng thêm 5 điểm
  const DIEM_MOI_CAP = 100;

  let chuoi = 0;

  function tinhCapDo(diem) {
    return Math.floor(diem / DIEM_MOI_CAP) + 1;
  }

  function themDiem(soDiem) {
    if (!(soDiem > 0)) return;
    let capCu = 1;
    let capMoi = 1;
    LuuTru.capNhat(function (d) {
      capCu = d.capDo;
      d.diem += soDiem;
      d.capDo = tinhCapDo(d.diem);
      capMoi = d.capDo;
    });
    if (capMoi > capCu && typeof App !== 'undefined') {
      App.thongBao('🎈 Lên cấp ' + capMoi + '! Bé giỏi quá!');
    }
  }

  function themSao(soSao) {
    if (!(soSao > 0)) return;
    LuuTru.capNhat(function (d) { d.sao += soSao; });
    if (typeof ThanhTich !== 'undefined') ThanhTich.kiemTra();
  }

  function traLoiDung() {
    chuoi++;
    const thuong = (chuoi % SO_CAU_CHUOI === 0) ? DIEM_THUONG_CHUOI : 0;
    themDiem(DIEM_TRA_LOI_DUNG + thuong);
    return { diem: DIEM_TRA_LOI_DUNG, thuong: thuong, chuoi: chuoi };
  }

  function traLoiSai() { chuoi = 0; }
  function datLaiChuoi() { chuoi = 0; }

  // Gọi khi bé chơi xong một lượt trò chơi
  function hoanThanhTroChoi(idTroChoi, doKho, diemLuotNay) {
    LuuTru.capNhatTroChoi(idTroChoi, function (tc) {
      tc.soLanHoanThanh++;
      if (doKho) tc.doKhoDaXong[doKho] = true;
      if ((diemLuotNay || 0) > tc.diemCaoNhat) tc.diemCaoNhat = diemLuotNay;
      tc.lanChoiCuoi = Date.now();
    });
    themSao(SAO_HOAN_THANH);
    return SAO_HOAN_THANH;
  }

  return {
    DIEM_TRA_LOI_DUNG: DIEM_TRA_LOI_DUNG,
    SAO_HOAN_THANH: SAO_HOAN_THANH,
    themDiem: themDiem,
    themSao: themSao,
    traLoiDung: traLoiDung,
    traLoiSai: traLoiSai,
    datLaiChuoi: datLaiChuoi,
    hoanThanhTroChoi: hoanThanhTroChoi,
    tinhCapDo: tinhCapDo
  };
})();
