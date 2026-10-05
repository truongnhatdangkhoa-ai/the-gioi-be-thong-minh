/* Tự cập nhật: đăng ký Service Worker + báo khi có phiên bản mới trong lúc đang mở app. */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;

  navigator.serviceWorker.register('sw.js').catch(function () {});

  let phienBanDau = null;
  function layPhienBan() {
    return fetch('version.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && j.phienBan; })
      .catch(function () { return null; });
  }

  function hienThongBao() {
    if (document.getElementById('thong-bao-cap-nhat')) return;
    const nut = document.createElement('button');
    nut.id = 'thong-bao-cap-nhat';
    nut.type = 'button';
    nut.textContent = '🎉 Có bản mới! Bấm để cập nhật';
    nut.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:99999;' +
      'padding:12px 20px;border:0;border-radius:999px;background:#2fbf63;color:#fff;' +
      'font:800 16px system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.25)';
    nut.onclick = function () { location.reload(); };
    document.body.appendChild(nut);
  }

  function kiemTra() {
    layPhienBan().then(function (v) {
      if (!v) return;
      if (phienBanDau === null) phienBanDau = v;
      else if (v !== phienBanDau) hienThongBao();
    });
  }

  kiemTra();
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') kiemTra();
  });
})();
