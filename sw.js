/* Service Worker - giúp app chạy offline và LUÔN lấy bản mới nhất khi có mạng.
   Cách hoạt động: có mạng -> tải bản mới (và lưu lại); mất mạng -> dùng bản đã lưu. */
const TEN_BO_NHO = 'the-gioi-be-thong-minh-v1';
const CHO_MANG_TOI_DA = 4000; // ms: mạng chậm quá thì dùng bản đã lưu

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil((async function () {
    try {
      const bo = await caches.open(TEN_BO_NHO);
      const ds = await (await fetch('sw-files.json', { cache: 'no-cache' })).json();
      await Promise.all(ds.map(function (f) {
        return bo.add(new Request(f, { cache: 'reload' })).catch(function () {});
      }));
    } catch (err) { /* chạy local/không có danh sách file: bỏ qua */ }
  })());
});

self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    const ten = await caches.keys();
    await Promise.all(ten.filter(function (k) { return k !== TEN_BO_NHO; })
      .map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async function () {
    const bo = await caches.open(TEN_BO_NHO);
    const mang = fetch(req, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok) bo.put(req, res.clone());
      return res;
    });
    try {
      return await Promise.race([
        mang,
        new Promise(function (_, tu) { setTimeout(tu, CHO_MANG_TOI_DA); })
      ]);
    } catch (err) {
      const cu = await bo.match(req, { ignoreSearch: true });
      if (cu) return cu;
      return mang; // chưa có bản lưu: đợi mạng
    }
  })());
});
