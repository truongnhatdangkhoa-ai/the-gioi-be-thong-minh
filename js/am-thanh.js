/* =========================================================
   ÂM THANH - tạo bằng Web Audio, không cần tải file.
   Chỉ phát khi có sự kiện, không phát liên tục.
   ========================================================= */
const AmThanh = (function () {
  'use strict';

  let boAmThanh = null;

  function layBoAmThanh() {
    if (!boAmThanh) {
      const Lop = window.AudioContext || window.webkitAudioContext;
      if (!Lop) return null;
      try { boAmThanh = new Lop(); } catch (loi) { return null; }
    }
    if (boAmThanh.state === 'suspended') {
      boAmThanh.resume().catch(function () { /* bỏ qua */ });
    }
    return boAmThanh;
  }

  function dangBat() {
    const caiDat = LuuTru.lay('caiDat') || {};
    return caiDat.amThanh !== false;
  }

  function not(ba, tanSo, batDau, thoiLuong, kieu, amLuong) {
    const dao = ba.createOscillator();
    const am = ba.createGain();
    dao.type = kieu || 'sine';
    dao.frequency.setValueAtTime(tanSo, batDau);
    am.gain.setValueAtTime(0.0001, batDau);
    am.gain.exponentialRampToValueAtTime(amLuong || 0.15, batDau + 0.015);
    am.gain.exponentialRampToValueAtTime(0.0001, batDau + thoiLuong);
    dao.connect(am);
    am.connect(ba.destination);
    dao.start(batDau);
    dao.stop(batDau + thoiLuong + 0.02);
  }

  const BAN_NHAC = {
    nhan: function (ba, t) { not(ba, 660, t, 0.08, 'triangle', 0.1); },
    dung: function (ba, t) {
      not(ba, 523, t, 0.12, 'triangle', 0.16);
      not(ba, 659, t + 0.09, 0.12, 'triangle', 0.16);
      not(ba, 784, t + 0.18, 0.22, 'triangle', 0.16);
    },
    sai: function (ba, t) {
      not(ba, 330, t, 0.14, 'sine', 0.13);
      not(ba, 247, t + 0.13, 0.2, 'sine', 0.13);
    },
    hoanThanh: function (ba, t) {
      [523, 659, 784, 1047].forEach(function (f, i) { not(ba, f, t + i * 0.12, 0.2, 'triangle', 0.15); });
      not(ba, 784, t + 0.55, 0.5, 'sine', 0.1);
      not(ba, 1047, t + 0.55, 0.5, 'sine', 0.1);
    },
    thanhTich: function (ba, t) {
      [784, 988, 1175, 1568, 1976].forEach(function (f, i) { not(ba, f, t + i * 0.07, 0.18, 'triangle', 0.12); });
    },
    latThe: function (ba, t) { not(ba, 880, t, 0.06, 'sine', 0.08); },
    toMau: function (ba, t) {
      not(ba, 440, t, 0.07, 'sine', 0.08);
      not(ba, 660, t + 0.05, 0.1, 'sine', 0.08);
    },
    // Bắn cung: kéo dây (tham số 0..1 là độ căng), thả dây, nổ bóng, bóng sao, bắn trượt
    keoCung: function (ba, t, tham) { not(ba, 260 + 340 * (tham || 0), t, 0.05, 'triangle', 0.07); },
    banCung: function (ba, t) {
      not(ba, 196, t, 0.16, 'triangle', 0.16);
      not(ba, 392, t, 0.09, 'sine', 0.07);
      const dao = ba.createOscillator();
      const am = ba.createGain();
      dao.type = 'sine';
      dao.frequency.setValueAtTime(900, t);
      dao.frequency.exponentialRampToValueAtTime(240, t + 0.22);
      am.gain.setValueAtTime(0.0001, t);
      am.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
      am.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      dao.connect(am);
      am.connect(ba.destination);
      dao.start(t);
      dao.stop(t + 0.26);
    },
    // Bắn nỏ: tiếng "tách" nhẹ khi bắn (bắn liên tục nên ngắn và nhỏ)
    banNo: function (ba, t) {
      not(ba, 330, t, 0.07, 'triangle', 0.09);
      const dao = ba.createOscillator();
      const am = ba.createGain();
      dao.type = 'sine';
      dao.frequency.setValueAtTime(820, t);
      dao.frequency.exponentialRampToValueAtTime(260, t + 0.12);
      am.gain.setValueAtTime(0.0001, t);
      am.gain.exponentialRampToValueAtTime(0.045, t + 0.01);
      am.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      dao.connect(am);
      am.connect(ba.destination);
      dao.start(t);
      dao.stop(t + 0.16);
    },
    noBong: function (ba, t) {
      const n = Math.floor(ba.sampleRate * 0.09);
      const bo = ba.createBuffer(1, n, ba.sampleRate);
      const d = bo.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      const nguon = ba.createBufferSource();
      const am = ba.createGain();
      nguon.buffer = bo;
      am.gain.value = 0.2;
      nguon.connect(am);
      am.connect(ba.destination);
      nguon.start(t);
      not(ba, 523, t + 0.02, 0.09, 'triangle', 0.08);
    },
    bongVang: function (ba, t) {
      [1047, 1319, 1568, 2093].forEach(function (f, i) { not(ba, f, t + i * 0.06, 0.16, 'triangle', 0.1); });
    },
    truot: function (ba, t) { not(ba, 300, t, 0.1, 'sine', 0.06); },
    // Đua xe: xe đụng vật cản (tiếng "bộp" trầm, nhẹ nhàng)
    vaCham: function (ba, t) {
      not(ba, 150, t, 0.16, 'triangle', 0.14);
      not(ba, 105, t + 0.06, 0.2, 'triangle', 0.12);
    },
    // Tiệm kẹo – bánh – kem: rơi vào tô, đặt topping, trộn, nướng, lò kêu "ding", máy làm kẹo
    bayVao: function (ba, t) {
      not(ba, 740, t, 0.06, 'sine', 0.09);
      not(ba, 494, t + 0.05, 0.1, 'sine', 0.08);
    },
    dat: function (ba, t) {
      not(ba, 988, t, 0.06, 'triangle', 0.07);
      not(ba, 1319, t + 0.05, 0.1, 'triangle', 0.06);
    },
    tron: function (ba, t) {
      not(ba, 392, t, 0.09, 'triangle', 0.08);
      not(ba, 440, t + 0.08, 0.09, 'triangle', 0.08);
      not(ba, 392, t + 0.16, 0.12, 'triangle', 0.07);
    },
    nuong: function (ba, t) {
      not(ba, 262, t, 0.25, 'sine', 0.07);
      not(ba, 330, t + 0.12, 0.3, 'sine', 0.06);
    },
    ding: function (ba, t) {
      not(ba, 1319, t, 0.5, 'sine', 0.1);
      not(ba, 1760, t + 0.02, 0.35, 'sine', 0.05);
    },
    mayKeo: function (ba, t) {
      [523, 659, 587, 740, 659, 784, 698, 880].forEach(function (f, i) { not(ba, f, t + i * 0.17, 0.1, 'triangle', 0.06); });
    }
  };

  function phat(ten, tham) {
    if (!dangBat()) return;
    const ba = layBoAmThanh();
    const banNhac = BAN_NHAC[ten];
    if (!ba || !banNhac) return;
    try { banNhac(ba, ba.currentTime + 0.01, tham); } catch (loi) { /* bỏ qua lỗi âm thanh */ }
  }

  function batTat() {
    const moi = !dangBat();
    LuuTru.capNhat(function (d) { d.caiDat.amThanh = moi; });
    if (moi) phat('nhan');
    if (typeof NhacNen !== 'undefined') NhacNen.capNhat();   // nhạc nền bật/tắt theo âm thanh chung
    return moi;
  }

  return { phat: phat, batTat: batTat, dangBat: dangBat };
})();
