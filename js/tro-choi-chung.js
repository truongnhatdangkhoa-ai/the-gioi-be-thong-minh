/* =========================================================
   KHUNG TRÒ CHƠI DÙNG CHUNG
   - Màn chọn độ khó
   - Màn kết quả
   - Các hàm dùng chung cho trò chơi
   Mỗi trò chơi chỉ cần khai báo "cấu hình" và hàm tạo câu hỏi.
   ========================================================= */
const TroChoiChung = (function () {
  'use strict';

  const DO_KHO = [
    { id: 'de', ten: 'Dễ', bieuTuong: '🟢', lop: 'do-kho-de' },
    { id: 'trung-binh', ten: 'Trung bình', bieuTuong: '🟡', lop: 'do-kho-tb' },
    { id: 'kho', ten: 'Khó', bieuTuong: '🔴', lop: 'do-kho-kho' }
  ];
  const LOI_KHEN = ['Giỏi quá! 👏', 'Tuyệt vời! 🌟', 'Đúng rồi! 🎉', 'Xuất sắc! 🏅', 'Bé thật thông minh! 💡', 'Hay lắm! 👍'];
  const LOI_DONG_VIEN = ['Thử lại nhé! 💪', 'Gần đúng rồi, cố lên! 🌈', 'Bé chọn lại nào! 😊'];

  function khung() { return document.getElementById('khu-tro-choi'); }

  function anhTieuDe(idTroChoi) {
    return '<img class="anh-tieu-de" src="' + App.duongDanIcon(idTroChoi) + '" alt="" draggable="false">';
  }

  function tenDoKho(id) {
    const dk = DO_KHO.filter(function (x) { return x.id === id; })[0];
    return dk ? dk.bieuTuong + ' ' + dk.ten : '';
  }

  /* ---------- Chọn độ khó ---------- */
  function chonDoKho(cauHinh, khiChon) {
    const k = khung();
    const tc = LuuTru.layTroChoi(cauHinh.id);
    // Gợi ý độ khó tiếp theo chưa hoàn thành
    const goiY = DO_KHO.filter(function (dk) { return !tc.doKhoDaXong[dk.id]; })[0];
    k.innerHTML =
      '<section class="man-chon-do-kho">' +
        '<div class="tieu-de-tro-choi">' + anhTieuDe(cauHinh.id) + '<h1>' + cauHinh.ten + '</h1></div>' +
        '<p class="huong-dan">' + cauHinh.huongDan + '</p>' +
        '<h2>Chọn độ khó</h2>' +
        '<div class="luoi-do-kho">' +
          DO_KHO.map(function (dk) {
            const xong = !!tc.doKhoDaXong[dk.id];
            const laGoiY = goiY && goiY.id === dk.id && tc.soLanHoanThanh > 0;
            return '<button type="button" class="nut-do-kho ' + dk.lop + (laGoiY ? ' goi-y' : '') + '" data-do-kho="' + dk.id + '">' +
              '<span class="dk-bieu-tuong" aria-hidden="true">' + dk.bieuTuong + '</span>' +
              '<span class="dk-ten">' + dk.ten + '</span>' +
              '<span class="dk-mo-ta">' + cauHinh.moTaDoKho[dk.id] + '</span>' +
              (xong ? '<span class="dk-nhan">⭐ Đã hoàn thành</span>' : '') +
              (laGoiY ? '<span class="dk-nhan dk-nhan-goi-y">👉 Thử sức nhé!</span>' : '') +
            '</button>';
          }).join('') +
        '</div>' +
      '</section>';
    k.querySelectorAll('[data-do-kho]').forEach(function (nut) {
      nut.addEventListener('click', function () {
        AmThanh.phat('nhan');
        khiChon(nut.getAttribute('data-do-kho'));
      });
    });
    window.scrollTo(0, 0);
  }

  /* ---------- Trò chơi câu hỏi ---------- */
  function chayTroChoiCauHoi(cauHinh) {
    chonDoKho(cauHinh, function (doKho) { batDauCauHoi(cauHinh, doKho); });
  }

  function batDauCauHoi(cauHinh, doKho) {
    const soCau = cauHinh.soCau || 10;
    const trangThai = { chiSo: 0, dungLanDau: 0, diemNhan: 0, lichSu: [] };
    DiemSo.datLaiChuoi();
    hienCau();

    function hienCau() {
      let cau;
      try {
        cau = cauHinh.taoCauHoi(doKho, trangThai.lichSu);
      } catch (loi) {
        console.error('[Trò chơi] Lỗi tạo câu hỏi', loi);
        khung().innerHTML = '<p class="huong-dan">Ối, có lỗi nhỏ. Bé bấm 🏠 để về trang chủ nhé.</p>';
        return;
      }
      trangThai.lichSu.push(cau.khoa);
      let lanDau = true;
      let daXong = false;
      const phanTram = Math.round((trangThai.chiSo / soCau) * 100);
      const k = khung();
      k.innerHTML =
        '<section class="man-cau-hoi">' +
          '<div class="tien-do">' +
            '<button type="button" class="nut nut-tron nut-trang nut-nho" id="nut-thoat-cau-hoi" aria-label="Đổi độ khó" title="Đổi độ khó">🎚️</button>' +
            '<div class="thanh-tien-do" role="progressbar" aria-valuemin="0" aria-valuemax="' + soCau + '" aria-valuenow="' + trangThai.chiSo + '"><span style="width:' + phanTram + '%"></span></div>' +
            '<div class="dem-cau">Câu ' + (trangThai.chiSo + 1) + '/' + soCau + '</div>' +
          '</div>' +
          '<h2 class="cau-hoi">' + cau.cauHoi + '</h2>' +
          '<div class="noi-dung-cau-hoi">' + (cau.noiDung || '') + '</div>' +
          '<div class="luoi-dap-an cot-' + cau.dapAn.length + ' ' + (cau.lopDapAn || '') + '">' +
            cau.dapAn.map(function (d, i) {
              return '<button type="button" class="nut-dap-an" data-i="' + i + '">' + d + '</button>';
            }).join('') +
          '</div>' +
          '<div class="phan-hoi" aria-live="polite"></div>' +
        '</section>';

      const phanHoi = k.querySelector('.phan-hoi');
      k.querySelector('#nut-thoat-cau-hoi').addEventListener('click', function () {
        AmThanh.phat('nhan');
        chayTroChoiCauHoi(cauHinh);
      });

      k.querySelectorAll('.nut-dap-an').forEach(function (nut) {
        nut.addEventListener('click', function () {
          if (daXong || nut.disabled) return;
          const i = Number(nut.getAttribute('data-i'));
          if (i === cau.dung) {
            daXong = true;
            nut.classList.add('dung');
            AmThanh.phat('dung');
            k.querySelectorAll('.nut-dap-an').forEach(function (n) { if (n !== nut) n.disabled = true; });
            let loi = App.chon(LOI_KHEN);
            if (lanDau) {
              const kq = DiemSo.traLoiDung();
              trangThai.dungLanDau++;
              trangThai.diemNhan += kq.diem + kq.thuong;
              App.diemBay(nut, '+' + kq.diem);
              if (kq.thuong) loi = '🔥 ' + kq.chuoi + ' câu đúng liên tiếp! Thưởng +' + kq.thuong + ' điểm';
            }
            phanHoi.className = 'phan-hoi tot';
            phanHoi.textContent = loi;
            setTimeout(cauTiepTheo, lanDau ? 1100 : 1300);
          } else {
            lanDau = false;
            DiemSo.traLoiSai();
            nut.classList.add('sai');
            nut.disabled = true;
            AmThanh.phat('sai');
            phanHoi.className = 'phan-hoi dong-vien';
            phanHoi.textContent = App.chon(LOI_DONG_VIEN);
          }
        });
      });
    }

    function cauTiepTheo() {
      trangThai.chiSo++;
      if (trangThai.chiSo >= soCau) {
        ketThuc(cauHinh, {
          doKho: doKho,
          diemNhan: trangThai.diemNhan,
          danhGia: trangThai.dungLanDau / soCau,
          thongDiep: 'Bé trả lời đúng ngay <b>' + trangThai.dungLanDau + '/' + soCau + '</b> câu!'
        }, {
          choiLai: function () { batDauCauHoi(cauHinh, doKho); },
          doiDoKho: function () { chayTroChoiCauHoi(cauHinh); }
        });
      } else {
        hienCau();
      }
    }
  }

  /* ---------- Màn kết quả ---------- */
  // kq: { doKho, diemNhan, thongDiep, danhGia (0..1) }
  // hanhDong: { choiLai, doiDoKho }
  function ketThuc(cauHinh, kq, hanhDong) {
    const saoNhan = DiemSo.hoanThanhTroChoi(cauHinh.id, kq.doKho, kq.diemNhan);
    AmThanh.phat('hoanThanh');
    App.phaoGiay(28);
    const danhGia = typeof kq.danhGia === 'number' ? kq.danhGia : 1;
    const soSao = kq.soSao || (danhGia >= 0.9 ? 3 : (danhGia >= 0.6 ? 2 : 1));
    const k = khung();
    k.innerHTML =
      '<section class="man-ket-qua">' +
        '<div class="bieu-tuong-ket-qua" aria-hidden="true">🎉</div>' +
        '<h1>Chúc mừng!</h1>' +
        (kq.doKho ? '<p class="nhan-do-kho">' + cauHinh.ten + ' · ' + tenDoKho(kq.doKho) + '</p>' : '') +
        '<div class="danh-gia-sao" aria-label="' + soSao + ' trên 3 sao">' +
          '<span>🌟</span><span class="' + (soSao >= 2 ? '' : 'mo') + '">🌟</span><span class="' + (soSao >= 3 ? '' : 'mo') + '">🌟</span>' +
        '</div>' +
        '<p class="thong-diep">' + kq.thongDiep + '</p>' +
        (kq.thongDiepPhu ? '<p class="thong-diep-phu">' + kq.thongDiepPhu + '</p>' : '') +
        '<div class="the-phan-thuong">' +
          '<div>🎯 +' + kq.diemNhan + ' điểm</div>' +
          '<div>⭐ +' + saoNhan + ' sao</div>' +
        '</div>' +
        '<div class="nhom-nut">' +
          (hanhDong.tiepTheo ? '<button type="button" class="nut nut-vang" id="nut-tiep-theo">' + (hanhDong.nhanTiepTheo || '➡️ Tiếp theo') + '</button>' : '') +
          '<button type="button" class="nut nut-xanh" id="nut-choi-lai">🔄 Chơi lại</button>' +
          (hanhDong.doiDoKho ? '<button type="button" class="nut nut-phu" id="nut-doi-do-kho">' + (hanhDong.nhanDoiDoKho || '🎚️ Đổi độ khó') + '</button>' : '') +
          '<a class="nut nut-trang" href="' + App.layDuongDanGoc() + 'index.html">🏠 Trang chủ</a>' +
        '</div>' +
      '</section>';
    k.querySelector('#nut-choi-lai').addEventListener('click', function () { AmThanh.phat('nhan'); hanhDong.choiLai(); });
    const nutTiep = k.querySelector('#nut-tiep-theo');
    if (nutTiep) nutTiep.addEventListener('click', function () { AmThanh.phat('nhan'); hanhDong.tiepTheo(); });
    const nutDoi = k.querySelector('#nut-doi-do-kho');
    if (nutDoi) nutDoi.addEventListener('click', function () { AmThanh.phat('nhan'); hanhDong.doiDoKho(); });
    window.scrollTo(0, 0);
  }

  /* ---------- Tiện ích tạo đáp án số ---------- */
  // Trả về { mang: [các số], dung: vị trí đáp án đúng }
  function taoLuaChonSo(dung, soLuong, nhoNhat, lonNhat) {
    const tapHop = [dung];
    const lanCan = App.tron([-1, 1, -2, 2, -3, 3]);
    for (let i = 0; i < lanCan.length && tapHop.length < soLuong; i++) {
      const g = dung + lanCan[i];
      if (g >= nhoNhat && g <= lonNhat && tapHop.indexOf(g) < 0) tapHop.push(g);
    }
    let thu = 0;
    while (tapHop.length < soLuong && thu < 200) {
      const g = App.ngauNhien(nhoNhat, lonNhat);
      if (tapHop.indexOf(g) < 0) tapHop.push(g);
      thu++;
    }
    const mang = App.tron(tapHop);
    return { mang: mang, dung: mang.indexOf(dung) };
  }

  // Chọn một phần tử chưa dùng (theo khóa) nếu có thể
  function chonKhongLap(danhSach, layKhoa, lichSu) {
    const conLai = danhSach.filter(function (x) { return lichSu.indexOf(layKhoa(x)) < 0; });
    return App.chon(conLai.length ? conLai : danhSach);
  }

  function khoiDongTrang(hamBatDau) {
    function chay() {
      App.khoiTao({ duongDanGoc: '../../' });
      hamBatDau();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chay);
    else chay();
  }

  return {
    DO_KHO: DO_KHO,
    LOI_KHEN: LOI_KHEN,
    chonDoKho: chonDoKho,
    chayTroChoiCauHoi: chayTroChoiCauHoi,
    ketThuc: ketThuc,
    taoLuaChonSo: taoLuaChonSo,
    chonKhongLap: chonKhongLap,
    khoiDongTrang: khoiDongTrang,
    tenDoKho: tenDoKho,
    anhTieuDe: anhTieuDe
  };
})();
