/* =========================================================
   TRÒ CHƠI: GHÉP HÌNH
   Kéo mảnh hình vào đúng ô. Trên điện thoại có thể chạm
   vào mảnh hình rồi chạm vào ô muốn đặt.
   Hình lấy từ assets/images/ghep/ (ảnh dựng sẵn 480x480).
   ========================================================= */
(function () {
  'use strict';

  const BUC_HINH = [
    { hinh: 'cho', ten: 'Chú cún' },
    { hinh: 'gau', ten: 'Chú gấu' },
    { hinh: 'xe', ten: 'Xe đua' },
    { hinh: 'ca-vang', ten: 'Cá vàng' },
    { hinh: 'ech', ten: 'Chú ếch' },
    { hinh: 'voi', ten: 'Chú voi' },
    { hinh: 'huou', ten: 'Hươu cao cổ' },
    { hinh: 'buom', ten: 'Con bướm' }
  ];
  const SO_O = { 'de': 2, 'trung-binh': 3, 'kho': 4 };
  const KICH_THUOC_ANH = 480;

  const CAU_HINH = {
    id: 'ghep-hinh',
    ten: 'Ghép hình',
    bieuTuong: '🧩',
    huongDan: 'Kéo từng mảnh vào đúng chỗ để ghép thành bức hình nhé!',
    moTaDoKho: {
      'de': '4 mảnh, có hình mờ',
      'trung-binh': '9 mảnh, có hình mờ',
      'kho': '16 mảnh, không có hình mờ'
    }
  };

  // Vẽ bức hình lên canvas và trả về ảnh dạng dữ liệu
  function veBucHinh(buc) {
    return '../../assets/images/ghep/' + buc.hinh + '.png';
  }

  function batDau(doKho) {
    const n = SO_O[doKho];
    const tong = n * n;
    const buc = App.chon(BUC_HINH);
    const anh = veBucHinh(buc);
    const k = document.getElementById('khu-tro-choi');
    let daGhep = 0;
    let diemNhan = 0;
    let soLanSai = 0;
    let manhDangChon = null;
    DiemSo.datLaiChuoi();

    const thuTu = App.tron(Array.from({ length: tong }, function (_, i) { return i; }));

    function viTriNen(i) {
      const hang = Math.floor(i / n);
      const cot = i % n;
      return (cot / (n - 1) * 100) + '% ' + (hang / (n - 1) * 100) + '%';
    }

    k.innerHTML =
      '<section class="man-ghep-hinh">' +
        '<div class="thanh-thong-tin">' +
          '<button type="button" class="nut nut-tron nut-trang nut-nho" id="nut-doi-do-kho" aria-label="Đổi độ khó" title="Đổi độ khó">🎚️</button>' +
          '<span class="o-thong-tin">🧩 Đã ghép: <b id="da-ghep">0</b>/' + tong + '</span>' +
          '<span class="o-thong-tin hinh-mau-nho"><img src="' + anh + '" alt="Hình mẫu: ' + buc.ten + '"> Hình mẫu</span>' +
        '</div>' +
        '<p class="huong-dan" id="loi-nhac">Kéo mảnh hình vào đúng ô nhé!</p>' +
        '<div class="vung-ghep">' +
          '<div class="ban-ghep ' + (doKho === 'kho' ? '' : 'co-hinh-mo') + '" style="--n:' + n + ';--anh:url(' + anh + ')">' +
            Array.from({ length: tong }, function (_, i) {
              return '<div class="o-ghep" data-vi-tri="' + i + '" aria-label="Ô số ' + (i + 1) + '"></div>';
            }).join('') +
          '</div>' +
          '<div class="khay-manh" style="--n:' + n + '">' +
            thuTu.map(function (i) {
              return '<button type="button" class="manh-ghep" data-vi-tri="' + i + '" aria-label="Mảnh hình" ' +
                'style="background-image:url(' + anh + ');background-size:' + (n * 100) + '% ' + (n * 100) + '%;background-position:' + viTriNen(i) + '"></button>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>';

    const banGhep = k.querySelector('.ban-ghep');
    const khay = k.querySelector('.khay-manh');
    const loiNhac = k.querySelector('#loi-nhac');

    k.querySelector('#nut-doi-do-kho').addEventListener('click', function () {
      AmThanh.phat('nhan');
      moDau();
    });

    // Tính kích thước mảnh cho vừa màn hình
    function tinhKichThuoc() {
      if (!document.body.contains(banGhep)) {
        window.removeEventListener('resize', tinhKichThuoc);
        return;
      }
      const cs = window.getComputedStyle(k);
      const rongKhung = k.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const haiBen = window.innerWidth >= 860;
      // trừ khoảng cách giữa hai bên (30px) và phần đệm của bàn ghép/khay (~24px)
      const rongMoiBen = (haiBen ? (rongKhung - 30) / 2 : rongKhung) - 24;
      const cao = window.innerHeight * (haiBen ? 0.62 : 0.4);
      const canhToiDa = haiBen ? 820 : 420; // màn hình lớn thì cho bàn ghép to hơn
      const canh = Math.max(160, Math.min(canhToiDa, rongMoiBen, cao));
      const kt = Math.floor((canh - (n - 1) * 8) / n);
      k.querySelector('.vung-ghep').style.setProperty('--kt', kt + 'px');
    }
    tinhKichThuoc();
    window.addEventListener('resize', tinhKichThuoc);

    function datManh(manh, o) {
      o.appendChild(manh);
      manh.classList.remove('dang-chon');
      manh.classList.add('da-dat');
      manh.disabled = true;
      o.classList.add('da-co');
      manhDangChon = null;
      daGhep++;
      k.querySelector('#da-ghep').textContent = daGhep;
      const kq = DiemSo.traLoiDung();
      diemNhan += kq.diem + kq.thuong;
      AmThanh.phat('dung');
      App.diemBay(o, '+' + kq.diem);
      loiNhac.textContent = kq.thuong ? '🔥 ' + kq.chuoi + ' mảnh liên tiếp! Thưởng +' + kq.thuong : App.chon(TroChoiChung.LOI_KHEN);
      if (daGhep === tong) {
        banGhep.classList.add('hoan-thanh');
        loiNhac.textContent = '🎉 Chúc mừng! Bé ghép xong ' + buc.ten.toLowerCase() + ' rồi!';
        setTimeout(function () {
          TroChoiChung.ketThuc(CAU_HINH, {
            doKho: doKho,
            diemNhan: diemNhan,
            danhGia: Math.max(0, 1 - soLanSai / (tong * 1.5)),
            thongDiep: 'Bé đã ghép xong bức hình <b>' + buc.ten + '</b> ' + buc.hinh
          }, {
            choiLai: function () { batDau(doKho); },
            doiDoKho: moDau
          });
        }, 1400);
      }
    }

    function datSai(o) {
      soLanSai++;
      DiemSo.traLoiSai();
      AmThanh.phat('sai');
      loiNhac.textContent = 'Chưa đúng chỗ rồi, thử ô khác nhé! 😊';
      if (o) {
        o.classList.remove('lac');
        void o.offsetWidth;
        o.classList.add('lac');
      }
    }

    function thuDat(manh, o) {
      if (!o || o.classList.contains('da-co')) return false;
      if (o.getAttribute('data-vi-tri') === manh.getAttribute('data-vi-tri')) {
        datManh(manh, o);
        return true;
      }
      datSai(o);
      return false;
    }

    // Chế độ chạm: chạm mảnh rồi chạm ô
    banGhep.addEventListener('click', function (e) {
      const o = e.target.closest('.o-ghep');
      if (!o || !manhDangChon) return;
      thuDat(manhDangChon, o);
    });

    // Kéo thả bằng chuột hoặc cảm ứng
    khay.querySelectorAll('.manh-ghep').forEach(function (manh) {
      manh.addEventListener('pointerdown', function (e) {
        if (manh.classList.contains('da-dat')) return;
        e.preventDefault();
        const khungManh = manh.getBoundingClientRect();
        const lechX = e.clientX - khungManh.left;
        const lechY = e.clientY - khungManh.top;
        const xuatPhatX = e.clientX;
        const xuatPhatY = e.clientY;
        let dangKeo = false;
        let bong = null;

        function diChuyen(ev) {
          if (!dangKeo && Math.hypot(ev.clientX - xuatPhatX, ev.clientY - xuatPhatY) > 8) {
            dangKeo = true;
            bong = manh.cloneNode(true);
            bong.classList.add('manh-dang-keo');
            bong.style.width = khungManh.width + 'px';
            bong.style.height = khungManh.height + 'px';
            document.body.appendChild(bong);
            manh.classList.add('an-tam');
          }
          if (dangKeo) {
            bong.style.transform = 'translate(' + (ev.clientX - lechX) + 'px,' + (ev.clientY - lechY) + 'px) scale(1.08)';
          }
        }

        function tha(ev) {
          window.removeEventListener('pointermove', diChuyen);
          window.removeEventListener('pointerup', tha);
          window.removeEventListener('pointercancel', tha);
          if (!dangKeo) {
            // Chỉ chạm: chọn / bỏ chọn mảnh
            khay.querySelectorAll('.dang-chon').forEach(function (m) { if (m !== manh) m.classList.remove('dang-chon'); });
            manh.classList.toggle('dang-chon');
            manhDangChon = manh.classList.contains('dang-chon') ? manh : null;
            AmThanh.phat('nhan');
            if (manhDangChon) loiNhac.textContent = '👉 Giờ bé chạm vào ô muốn đặt mảnh này nhé!';
            return;
          }
          bong.style.display = 'none';
          const duoi = document.elementFromPoint(ev.clientX, ev.clientY);
          bong.remove();
          manh.classList.remove('an-tam');
          const o = duoi ? duoi.closest('.o-ghep') : null;
          if (o) thuDat(manh, o);
        }

        window.addEventListener('pointermove', diChuyen);
        window.addEventListener('pointerup', tha);
        window.addEventListener('pointercancel', tha);
      });
    });
  }

  function moDau() {
    TroChoiChung.chonDoKho(CAU_HINH, batDau);
  }

  TroChoiChung.khoiDongTrang(moDau);
})();
