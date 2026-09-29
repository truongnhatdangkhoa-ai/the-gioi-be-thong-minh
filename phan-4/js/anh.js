/* Thay mã ảnh dạng :ten-anh: bằng ảnh thật trong assets/images/ (chạy được khi mở thẳng index.html) */
(function () {
  'use strict';
  var GOC = document.currentScript.src.replace(/js\/anh\.js.*$/, '') + 'assets/images/';
  var MAU = /:([a-z0-9-]+):/g;
  function doiNut(nut) {
    var chuoi = nut.nodeValue;
    if (!MAU.test(chuoi)) { MAU.lastIndex = 0; return; }
    MAU.lastIndex = 0;
    var kq = document.createDocumentFragment(), cuoi = 0, m;
    while ((m = MAU.exec(chuoi))) {
      if (m.index > cuoi) kq.appendChild(document.createTextNode(chuoi.slice(cuoi, m.index)));
      var a = document.createElement('img');
      a.className = 'anh-e'; a.src = GOC + m[1] + '.png'; a.alt = ''; a.draggable = false;
      kq.appendChild(a); cuoi = m.index + m[0].length;
    }
    if (cuoi < chuoi.length) kq.appendChild(document.createTextNode(chuoi.slice(cuoi)));
    nut.parentNode.replaceChild(kq, nut);
  }
  function quet(goc) {
    var ds = [], w = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) if (n.nodeValue.indexOf(':') >= 0) ds.push(n);
    ds.forEach(function (x) { if (x.parentNode && !/^(SCRIPT|STYLE)$/.test(x.parentNode.nodeName)) doiNut(x); });
  }
  new MutationObserver(function (ds) {
    ds.forEach(function (d) {
      if (d.type === 'characterData') doiNut(d.target);
      else d.addedNodes.forEach(function (n) { if (n.nodeType === 1) quet(n); else if (n.nodeType === 3) doiNut(n); });
    });
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', function () { quet(document.body); });
})();
