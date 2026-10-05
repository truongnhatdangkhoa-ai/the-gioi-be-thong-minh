/* =========================================================
   NHẠC NỀN - không lời, nhẹ nhàng, mỗi trò chơi một bản riêng.
   Nhạc được tạo trực tiếp bằng Web Audio (không cần tải file, chạy
   được khi không có mạng). Mỗi trò có: giọng, tốc độ, nhịp, nhạc cụ
   và giai điệu riêng; giai điệu cố định theo từng trò nên bé nghe
   quen dần "bài của trò đó".
   ========================================================= */
const NhacNen = (function () {
  'use strict';

  /* ---------- Thang âm ---------- */
  const THANG = {
    major: [0, 2, 4, 5, 7, 9, 11],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixo: [0, 2, 4, 5, 7, 9, 10]
  };

  /* ---------- Mỗi trò một phong cách ----------
     goc: nốt chủ (số MIDI, C3 = 48)   tien: hợp âm từng ô nhịp (8 ô nhịp, lặp lại)
     giaiDieu: hop (hộp nhạc) | marimba | pluck (gảy nhẹ) | celesta
     dem: pad (nền ngân) | arp (rải hợp âm) | none     bass: chac | nay | none
     trong: 0 không | 1 tiếng gõ nhẹ | 2 trống nhẹ    mat: độ dày nốt giai điệu (thua | vua | day) */
  const PHONG_CACH = {
    'trang-chu':          { goc: 48, thang: 'major',  bpm: 104, nhip: 4, tien: [0, 4, 5, 3, 0, 4, 3, 0], giaiDieu: 'hop',     dem: 'arp', bass: 'chac', trong: 1, swing: 0,    echo: false, mat: 'vua',  hat: 11 },
    'to-mau':             { goc: 53, thang: 'major',  bpm: 80,  nhip: 3, tien: [0, 5, 3, 4, 0, 5, 1, 4], giaiDieu: 'celesta', dem: 'arp', bass: 'chac', trong: 0, swing: 0,    echo: true,  mat: 'thua', hat: 41 },
    'ghep-hinh':          { goc: 50, thang: 'major',  bpm: 84,  nhip: 4, tien: [0, 2, 3, 0, 0, 5, 3, 4], giaiDieu: 'hop',     dem: 'pad', bass: 'chac', trong: 0, swing: 0,    echo: true,  mat: 'thua', hat: 53 },
    'lat-hinh':           { goc: 58, thang: 'major',  bpm: 96,  nhip: 4, tien: [0, 5, 1, 4, 0, 3, 4, 0], giaiDieu: 'pluck',   dem: 'arp', bass: 'chac', trong: 0, swing: 0.1,  echo: false, mat: 'vua',  hat: 71 },
    'ban-cung':           { goc: 50, thang: 'major',  bpm: 112, nhip: 4, tien: [0, 4, 5, 3, 0, 4, 3, 4], giaiDieu: 'pluck',   dem: 'pad', bass: 'nay', trong: 2, swing: 0,    echo: false, mat: 'day',  hat: 83 },
    'ban-no':             { goc: 57, thang: 'mixo',   bpm: 120, nhip: 4, tien: [0, 6, 3, 0, 0, 6, 4, 0], giaiDieu: 'marimba', dem: 'none', bass: 'nay', trong: 2, swing: 0,    echo: false, mat: 'day',  hat: 97 },
    'dua-xe':             { goc: 48, thang: 'major',  bpm: 128, nhip: 4, tien: [0, 3, 4, 3, 0, 5, 4, 4], giaiDieu: 'pluck',   dem: 'none', bass: 'nay', trong: 2, swing: 0,    echo: false, mat: 'day',  hat: 113 },
    'tiem-keo-banh-kem':  { goc: 51, thang: 'major',  bpm: 100, nhip: 4, tien: [0, 5, 1, 4, 0, 5, 3, 4], giaiDieu: 'celesta', dem: 'arp', bass: 'nay', trong: 1, swing: 0.25, echo: false, mat: 'vua',  hat: 131 },
    'xep-hinh-khoi':      { goc: 55, thang: 'lydian', bpm: 92,  nhip: 4, tien: [0, 3, 4, 0, 0, 5, 3, 4], giaiDieu: 'marimba', dem: 'arp', bass: 'chac', trong: 1, swing: 0,    echo: true,  mat: 'thua', hat: 149 },
    'vuot-me-cung':       { goc: 52, thang: 'mixo',   bpm: 88,  nhip: 4, tien: [0, 3, 4, 0, 0, 5, 3, 4], giaiDieu: 'pluck',   dem: 'arp', bass: 'chac', trong: 1, swing: 0.1,  echo: true,  mat: 'vua',  hat: 167 }
  };

  /* Mẫu nhịp cho giai điệu: [vị trí bước (nửa phách), độ dài (bước)] */
  const MAU_4 = {
    A: [[0, 2], [2, 2], [4, 2], [6, 2]],
    B: [[0, 3], [3, 1], [4, 2], [6, 2]],
    C: [[0, 2], [2, 1], [3, 1], [4, 2], [6, 1], [7, 1]],
    D: [[0, 1], [1, 1], [2, 2], [4, 1], [5, 1], [6, 2]],
    E: [[0, 4], [4, 2], [6, 2]]
  };
  const MAU_3 = {
    A: [[0, 2], [2, 2], [4, 2]],
    B: [[0, 3], [3, 1], [4, 2]],
    C: [[0, 2], [2, 1], [3, 1], [4, 2]],
    D: [[0, 1], [1, 1], [2, 2], [4, 2]],
    E: [[0, 4], [4, 2]]
  };
  const CHON_MAU = { thua: ['A', 'E', 'A', 'B'], vua: ['A', 'B', 'C', 'B'], day: ['C', 'D', 'B', 'C'] };

  /* ---------- Tiện ích ---------- */
  function rng(hat) {            // bộ số ngẫu nhiên cố định theo hạt giống
    let a = hat >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function midiTuBac(pc, bac) {  // bậc của thang âm (có thể âm hoặc > 6) -> số MIDI
    const thang = THANG[pc.thang];
    const bacChuan = ((bac % 7) + 7) % 7;
    const quangTam = Math.floor(bac / 7);
    return pc.goc + 12 * quangTam + thang[bacChuan];
  }
  function tanSo(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  /* ---------- Soạn giai điệu 8 ô nhịp (cố định theo từng trò) ---------- */
  function soanGiaiDieu(pc) {
    const ngau = rng(pc.hat);
    const mau = pc.nhip === 3 ? MAU_3 : MAU_4;
    const ds = CHON_MAU[pc.mat];
    const soBuoc = pc.nhip * 2;
    const ketQua = [];
    let bac = 4;                  // bắt đầu quanh bậc 5 của nốt chủ
    let huong = 1;
    const mauNua = [];            // mẫu nhịp nửa đầu, dùng lại cho nửa sau để nghe như một bài

    for (let o = 0; o < 8; o++) {
      const hopAm = pc.tien[o];
      const chuAm = [hopAm, hopAm + 2, hopAm + 4];
      const laChuAm = function (b) { return chuAm.indexOf(((b % 7) + 7) % 7) >= 0; };
      let kieu;
      if (o === 7 || o === 3) kieu = 'E';
      else if (o < 4) { kieu = ds[Math.floor(ngau() * ds.length)]; mauNua[o] = kieu; }
      else kieu = mauNua[o - 4];
      const cacNot = [];
      mau[kieu].forEach(function (nhip, i) {
        const buoc = nhip[0], dai = nhip[1];
        // chừa vài chỗ nghỉ ở phách yếu cho dễ thở
        if (i > 0 && buoc % 2 === 1 && ngau() < 0.25) return;
        let b;
        const cuoiBai = (o === 7 && i === mau[kieu].length - 1);
        const cuoiCau = (o === 3 && i === mau[kieu].length - 1);
        if (cuoiBai) {                                       // kết bài: nốt thuộc hợp âm, gần nốt chủ nhất
          b = 7;
          [7, 8, 6, 9].some(function (u) { if (laChuAm(u)) { b = u; return true; } return false; });
        }
        else if (cuoiCau) b = 8;                             // dừng ở bậc 2 (chưa hết, còn nối tiếp)
        else if (i === 0) {                                  // đầu ô nhịp: chọn nốt thuộc hợp âm gần nhất
          let tot = bac, kc = 99;
          for (let k = -4; k <= 4; k++) {
            const ub = bac + k;
            if (ub < 2 || ub > 11 || !laChuAm(ub)) continue;
            const d = Math.abs(k) + ngau() * 1.2;
            if (d < kc) { kc = d; tot = ub; }
          }
          b = tot;
        } else {
          const x = ngau();
          if (x < 0.55) b = bac + huong;
          else if (x < 0.75) b = bac + 2 * huong;
          else if (x < 0.9) { b = bac - huong; huong = -huong; }
          else b = bac;
          if (b === bac && ngau() < 0.7) b = bac + huong;
          if (b > 11) { b = bac - 1; huong = -1; }
          if (b < 2) { b = bac + 1; huong = 1; }
        }
        if (b > bac) huong = 1; else if (b < bac) huong = -1;
        bac = b;
        cacNot.push({ buoc: buoc, dai: dai, bac: b });
      });
      ketQua.push(cacNot);
    }
    return ketQua;
  }

  /* ---------- Nhạc cụ ---------- */
  let ba = null, tong = null, kenhGiaiDieu = null, kenhNen = null, bufTiengGio = null;

  function dat(am, t, dinh, tanCong, tat) {   // đường âm lượng: lên nhanh, tắt dần
    am.gain.setValueAtTime(0.0001, t);
    am.gain.exponentialRampToValueAtTime(dinh, t + tanCong);
    am.gain.exponentialRampToValueAtTime(0.0001, t + tat);
  }
  function dao(kieu, f, t, ket, tat) {
    const o = ba.createOscillator();
    o.type = kieu;
    o.frequency.setValueAtTime(f, t);
    o.connect(ket);
    o.start(t);
    o.stop(t + tat + 0.05);
    return o;
  }

  const NHAC_CU = {
    hop: function (t, f, v) {            // hộp nhạc
      const am = ba.createGain(); am.connect(kenhGiaiDieu);
      dat(am, t, v, 0.005, 1.1);
      dao('sine', f, t, am, 1.1);
      const am2 = ba.createGain(); am2.connect(kenhGiaiDieu);
      dat(am2, t, v * 0.22, 0.003, 0.28);
      dao('sine', f * 4, t, am2, 0.28);
    },
    marimba: function (t, f, v) {        // mộc cầm
      const am = ba.createGain(); am.connect(kenhGiaiDieu);
      dat(am, t, v * 1.1, 0.004, 0.5);
      dao('sine', f, t, am, 0.5);
      const am2 = ba.createGain(); am2.connect(kenhGiaiDieu);
      dat(am2, t, v * 0.3, 0.002, 0.12);
      dao('sine', f * 4, t, am2, 0.12);
    },
    pluck: function (t, f, v) {          // gảy nhẹ
      const loc = ba.createBiquadFilter();
      loc.type = 'lowpass';
      loc.frequency.setValueAtTime(3800, t);
      loc.frequency.exponentialRampToValueAtTime(700, t + 0.28);
      const am = ba.createGain();
      loc.connect(am); am.connect(kenhGiaiDieu);
      dat(am, t, v, 0.006, 0.38);
      dao('triangle', f, t, loc, 0.38);
    },
    celesta: function (t, f, v) {        // đàn chuông nhỏ
      const am = ba.createGain(); am.connect(kenhGiaiDieu);
      dat(am, t, v, 0.004, 1.4);
      dao('sine', f, t, am, 1.4);
      const am2 = ba.createGain(); am2.connect(kenhGiaiDieu);
      dat(am2, t, v * 0.35, 0.003, 0.8);
      dao('sine', f * 2, t, am2, 0.8);
      const am3 = ba.createGain(); am3.connect(kenhGiaiDieu);
      dat(am3, t, v * 0.12, 0.003, 0.4);
      dao('sine', f * 3, t, am3, 0.4);
    }
  };

  function notBass(t, f, v) {
    const am = ba.createGain(); am.connect(kenhNen);
    dat(am, t, v, 0.01, 0.42);
    dao('sine', f, t, am, 0.42);
    const am2 = ba.createGain(); am2.connect(kenhNen);   // thêm họa âm để loa điện thoại nghe rõ
    dat(am2, t, v * 0.35, 0.01, 0.3);
    dao('triangle', f * 2, t, am2, 0.3);
  }
  function notNen(t, f, dai, v) {        // âm nền ngân nhẹ
    const loc = ba.createBiquadFilter();
    loc.type = 'lowpass'; loc.frequency.value = 900;
    const am = ba.createGain();
    loc.connect(am); am.connect(kenhNen);
    const kt = t + dai;
    am.gain.setValueAtTime(0.0001, t);
    am.gain.exponentialRampToValueAtTime(v, t + 0.3);
    am.gain.setValueAtTime(v, Math.max(t + 0.31, kt - 0.5));
    am.gain.exponentialRampToValueAtTime(0.0001, kt);
    const o1 = dao('triangle', f, t, loc, dai); o1.detune.value = -6;
    const o2 = dao('triangle', f, t, loc, dai); o2.detune.value = 6;
  }
  function notRai(t, f, v) {             // rải hợp âm
    const loc = ba.createBiquadFilter();
    loc.type = 'lowpass'; loc.frequency.setValueAtTime(2400, t); loc.frequency.exponentialRampToValueAtTime(600, t + 0.2);
    const am = ba.createGain();
    loc.connect(am); am.connect(kenhNen);
    dat(am, t, v, 0.006, 0.3);
    dao('triangle', f, t, loc, 0.3);
  }
  function trongTram(t, v) {
    const am = ba.createGain(); am.connect(kenhNen);
    dat(am, t, v, 0.004, 0.16);
    const o = ba.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
    o.connect(am); o.start(t); o.stop(t + 0.2);
  }
  function tiengGo(t, v) {               // tiếng "tích" nhẹ như phách
    if (!bufTiengGio) {
      const n = Math.floor(ba.sampleRate * 0.06);
      bufTiengGio = ba.createBuffer(1, n, ba.sampleRate);
      const d = bufTiengGio.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1);
    }
    const nguon = ba.createBufferSource();
    nguon.buffer = bufTiengGio;
    const loc = ba.createBiquadFilter();
    loc.type = 'highpass'; loc.frequency.value = 7000;
    const am = ba.createGain();
    nguon.connect(loc); loc.connect(am); am.connect(kenhNen);
    dat(am, t, v, 0.003, 0.05);
    nguon.start(t); nguon.stop(t + 0.07);
  }

  /* ---------- Bộ phát ---------- */
  let pc = null, tenTroChoi = '', giaiDieu = [], thoiBuoc = 0.25, buocHienTai = 0, tiepTheo = 0;
  let hen = 0, dangPhat = false, daCoCuChi = false, daKhoiTao = false;

  function chonTenTroChoi() {
    const m = (location.pathname || '').match(/\/games\/([^/]+)\//);
    return m ? m[1] : 'trang-chu';
  }

  function duocPhep() {
    let cd = {};
    try { cd = (LuuTru.lay('caiDat') || {}); } catch (e) { cd = {}; }
    const amThanhBat = (typeof AmThanh !== 'undefined') ? AmThanh.dangBat() : true;
    return amThanhBat && cd.nhacNen !== false;
  }
  function dangBatNhac() {
    let cd = {};
    try { cd = (LuuTru.lay('caiDat') || {}); } catch (e) { cd = {}; }
    return cd.nhacNen !== false;
  }

  function taoBoAm() {
    if (ba) return true;
    const Lop = window.AudioContext || window.webkitAudioContext;
    if (!Lop) return false;
    try { ba = new Lop(); } catch (e) { return false; }
    tong = ba.createGain();
    tong.gain.value = 0.0001;
    const nen = ba.createDynamicsCompressor();
    tong.connect(nen); nen.connect(ba.destination);
    kenhNen = ba.createGain(); kenhNen.gain.value = 1; kenhNen.connect(tong);
    kenhGiaiDieu = ba.createGain(); kenhGiaiDieu.gain.value = 1; kenhGiaiDieu.connect(tong);
    return true;
  }

  function taoVang(bpm) {                // tiếng vang nhẹ (cho các trò mơ màng)
    const tre = ba.createDelay(1);
    tre.delayTime.value = 60 / bpm * 0.75;
    const hoiTiep = ba.createGain(); hoiTiep.gain.value = 0.3;
    const loc = ba.createBiquadFilter(); loc.type = 'lowpass'; loc.frequency.value = 2200;
    const uot = ba.createGain(); uot.gain.value = 0.38;
    kenhGiaiDieu.connect(tre); tre.connect(loc); loc.connect(hoiTiep); hoiTiep.connect(tre);
    loc.connect(uot); uot.connect(tong);
  }

  function phatBuoc(buoc, t0) {
    const soBuoc = pc.nhip * 2;
    const oNhip = Math.floor(buoc / soBuoc) % 8;
    const vt = buoc % soBuoc;
    const t = t0 + ((vt % 2 === 1) ? pc.swing * thoiBuoc : 0);
    const hopAm = pc.tien[oNhip];
    const dg = pc.giaiDieu;
    const vGd = { hop: 0.085, marimba: 0.095, pluck: 0.08, celesta: 0.075 }[dg];

    // giai điệu
    giaiDieu[oNhip].forEach(function (n) {
      if (n.buoc === vt) NHAC_CU[dg](t, tanSo(midiTuBac(pc, n.bac + 7)), vGd);
    });

    // hợp âm nền ngân
    if (pc.dem === 'pad' && vt === 0) {
      const dai = soBuoc * thoiBuoc;
      [0, 2, 4].forEach(function (k) { notNen(t, tanSo(midiTuBac(pc, hopAm + k)), dai, 0.016); });
    }
    // rải hợp âm
    if (pc.dem === 'arp') {
      const mau = [0, 1, 2, 1, 0, 2, 1, 2];
      notRai(t, tanSo(midiTuBac(pc, hopAm + 2 * mau[vt % 8])), 0.03);
    }
    // bass
    if (pc.bass === 'chac') {
      if (vt === 0) notBass(t, tanSo(midiTuBac(pc, hopAm - 7)), 0.085);
      else if (pc.nhip === 4 && vt === 4) notBass(t, tanSo(midiTuBac(pc, hopAm - 7 + 4)), 0.065);
    } else if (pc.bass === 'nay') {
      if (vt % 2 === 0) {
        const phach = vt / 2;
        const quang5 = (pc.nhip === 4) ? (phach % 2 === 1) : (phach !== 0);
        notBass(t, tanSo(midiTuBac(pc, hopAm - 7 + (quang5 ? 4 : 0))), phach === 0 ? 0.085 : 0.06);
      }
    }
    // nhịp gõ
    if (pc.trong >= 1 && vt % 2 === 1) tiengGo(t, pc.trong === 2 ? 0.02 : 0.014);
    if (pc.trong === 2 && pc.nhip === 4 && (vt === 0 || vt === 4)) trongTram(t, 0.1);
  }

  function vong() {
    if (!dangPhat) return;
    while (tiepTheo < ba.currentTime + 0.3) {
      phatBuoc(buocHienTai, tiepTheo);
      tiepTheo += thoiBuoc;
      buocHienTai++;
    }
    hen = setTimeout(vong, 70);
  }

  function batDauPhat() {
    if (dangPhat || !duocPhep() || !daCoCuChi || !ba || ba.state !== 'running') return;
    if (document.hidden) return;
    if (!pc) {
      tenTroChoi = chonTenTroChoi();
      pc = PHONG_CACH[tenTroChoi] || PHONG_CACH['trang-chu'];
      giaiDieu = soanGiaiDieu(pc);
      thoiBuoc = 60 / pc.bpm / 2;
      if (pc.echo) taoVang(pc.bpm);
    }
    dangPhat = true;
    buocHienTai = 0;
    tiepTheo = ba.currentTime + 0.15;
    const t = ba.currentTime;
    tong.gain.cancelScheduledValues(t);
    tong.gain.setValueAtTime(Math.max(tong.gain.value, 0.0001), t);
    tong.gain.exponentialRampToValueAtTime(0.6, t + 1.6);   // nhạc nhỏ dần vào, không giật mình
    vong();
  }

  function dungPhat() {
    if (!dangPhat) return;
    dangPhat = false;
    clearTimeout(hen);
    if (ba) {
      const t = ba.currentTime;
      tong.gain.cancelScheduledValues(t);
      tong.gain.setValueAtTime(Math.max(tong.gain.value, 0.0001), t);
      tong.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    }
  }

  function thuPhat() {
    if (!duocPhep() || !daCoCuChi || document.hidden) return;
    if (!taoBoAm()) return;
    if (ba.state === 'suspended') {
      ba.resume().then(batDauPhat).catch(function () { /* chờ lần chạm sau */ });
    } else {
      batDauPhat();
    }
  }

  function capNhat() {
    if (duocPhep()) thuPhat(); else dungPhat();
  }

  function batTatNhac() {
    const moi = !dangBatNhac();
    LuuTru.capNhat(function (d) { d.caiDat = d.caiDat || {}; d.caiDat.nhacNen = moi; });
    capNhat();
    return moi;
  }

  function khoiTao() {
    if (daKhoiTao) return;
    daKhoiTao = true;
    // Trình duyệt chỉ cho phát nhạc sau lần chạm đầu tiên của bé
    const cuChi = function () {
      daCoCuChi = true;
      thuPhat();
      if (ba && ba.state === 'running') {
        ['pointerdown', 'touchend', 'keydown', 'click'].forEach(function (s) { document.removeEventListener(s, cuChi, true); });
      }
    };
    ['pointerdown', 'touchend', 'keydown', 'click'].forEach(function (s) { document.addEventListener(s, cuChi, true); });

    // Tạm dừng khi bé chuyển sang ứng dụng khác / tắt màn hình
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        dungPhat();
        if (ba && ba.state === 'running') ba.suspend().catch(function () { /* bỏ qua */ });
      } else if (daCoCuChi) {
        thuPhat();
      }
    });

    // Thử phát ngay (ứng dụng APK thường cho phép luôn)
    try {
      if (taoBoAm()) {
        ba.resume().then(function () { daCoCuChi = true; batDauPhat(); }).catch(function () { /* chờ chạm */ });
      }
    } catch (e) { /* chờ chạm */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', khoiTao);
  else khoiTao();

  return { capNhat: capNhat, batTatNhac: batTatNhac, dangBatNhac: dangBatNhac, soanGiaiDieu: soanGiaiDieu, phongCach: PHONG_CACH };
})();
