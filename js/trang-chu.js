/* =========================================================
   TRANG CHỦ - vẽ các khu trò chơi, lời chào của Gấu Mật,
   hỏi tên bé lần đầu.
   ========================================================= */
const TrangChu = (function () {
  'use strict';

  const DO_KHO = [
    { id: 'de', bieuTuong: '🟢', ten: 'Dễ' },
    { id: 'trung-binh', bieuTuong: '🟡', ten: 'Trung bình' },
    { id: 'kho', bieuTuong: '🔴', ten: 'Khó' }
  ];

  function khoiTao() {
    App.khoiTao({ duongDanGoc: '', laTrangChu: true });
    veLuoiTroChoi();
    capNhatLoiChao();
    ganSuKien();
    window.addEventListener('tgbtm:thay-doi', function () {
      veLuoiTroChoi();
      capNhatLoiChao();
    });
    hoiTenLanDau();
  }

  function veTienDo(troChoi) {
    const tc = LuuTru.layTroChoi(troChoi.id);
    if (!troChoi.coDoKho) {
      const n = troChoi.truongTienDo ? (tc[troChoi.truongTienDo] || 0) : tc.soLanHoanThanh;   // truongTienDo: lấy số liệu riêng của trò chơi
      return (tc.soLanHoanThanh > 0 || n > 0)
        ? '<span class="tien-do-the">' + (troChoi.nhanTienDo || '🖼️ Đã tô {n} tranh').replace('{n}', n) + '</span>'
        : '<span class="tien-do-the">✨ Chơi thử nhé</span>';
    }
    return '<span class="tien-do-the" aria-label="Độ khó đã hoàn thành">' +
      DO_KHO.map(function (dk) {
        const xong = !!tc.doKhoDaXong[dk.id];
        return '<span class="' + (xong ? 'xong' : 'chua') + '" title="' + dk.ten + (xong ? ': đã hoàn thành' : ': chưa chơi') + '">' + dk.bieuTuong + '</span>';
      }).join('') + '</span>';
  }

  function veLuoiTroChoi() {
    const luoi = document.getElementById('luoi-tro-choi');
    if (!luoi) return;
    luoi.innerHTML = App.DANH_SACH_TRO_CHOI.map(function (tc, i) {
      return '<a class="the-tro-choi" href="games/' + tc.id + '/index.html" ' +
        'style="--mau-the:' + tc.mau + ';--mau-bong:' + tc.mauBong + ';--tre:' + (i * 0.25) + 's">' +
        '<img class="bieu-tuong-anh" src="' + App.duongDanIcon(tc.id) + '" alt="" draggable="false">' +
        '<span class="ten">' + tc.ten + '</span>' +
        veTienDo(tc) +
        '</a>';
    }).join('');
  }

  function tenBe() {
    const ten = LuuTru.lay('tenNguoiChoi');
    return ten ? App.thoatHtml(ten) : 'bé';
  }

  function capNhatLoiChao() {
    const loiChao = document.getElementById('loi-chao');
    if (loiChao) loiChao.innerHTML = 'Chào ' + tenBe() + '! Hôm nay mình chơi gì nhé? 🎈';
  }

  function ganSuKien() {
    const nhanVat = document.getElementById('nut-nhan-vat');
    const loiChao = document.getElementById('loi-chao');
    if (nhanVat && loiChao) {
      nhanVat.addEventListener('click', function () {
        const d = LuuTru.layTatCa();
        const cau = [
          'Bé giỏi lắm! Mình cùng học nào! 📚',
          'Bé đang có ' + d.sao + ' ngôi sao đó! ⭐',
          'Chạm vào một trò chơi để bắt đầu nhé! 👇',
          'Mỗi câu đúng được 10 điểm đó! 🎯',
          'Đúng 3 câu liên tiếp được thưởng thêm điểm! 🔥',
          'Gấu Mật thương ' + tenBe() + ' nhiều lắm! 💛'
        ];
        loiChao.innerHTML = App.chon(cau);
        AmThanh.phat('nhan');
        nhanVat.classList.remove('vui');
        void nhanVat.offsetWidth;
        nhanVat.classList.add('vui');
      });
    }
    const nutThanhTich = document.getElementById('nut-thanh-tich');
    if (nutThanhTich) nutThanhTich.addEventListener('click', function () { AmThanh.phat('nhan'); App.hienManThanhTich(); });
    const nutCaiDat = document.getElementById('nut-cai-dat');
    if (nutCaiDat) nutCaiDat.addEventListener('click', function () { AmThanh.phat('nhan'); App.hienCaiDat(); });
  }

  function hoiTenLanDau() {
    const caiDat = LuuTru.lay('caiDat') || {};
    if (caiDat.daHoiTen) return;
    App.hopThoai({
      tieuDe: '👋 Xin chào!',
      bamNenDeDong: false,
      noiDungHtml:
        '<p>Bé tên là gì nhỉ?</p>' +
        '<input id="o-ten-lan-dau" class="o-nhap" maxlength="20" autocomplete="off" placeholder="Tên gọi ở nhà của bé">',
      nut: [
        { nhan: 'Bỏ qua', lop: 'nut-trang', hanhDong: function () {
          LuuTru.capNhat(function (d) { d.caiDat.daHoiTen = true; });
        } },
        { nhan: '🚀 Bắt đầu chơi', lop: 'nut-xanh', hanhDong: function (hop) {
          const ten = hop.querySelector('#o-ten-lan-dau').value.trim().slice(0, 20);
          LuuTru.capNhat(function (d) { d.tenNguoiChoi = ten; d.caiDat.daHoiTen = true; });
        } }
      ]
    });
  }

  return { khoiTao: khoiTao };
})();
