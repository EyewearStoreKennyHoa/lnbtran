/* Hồ sơ năng lực - Lương Nguyễn Bảo Trân: điều hướng, nút sao chép, máy tính chỉ số khách sạn */
(function () {
  var GROUPS = {
    home: { pages: [['trang-chu', 'Trang chủ']] },
    nls: { pages: [['nls', 'Tổng quan'], ['nls-word', 'Word'], ['nls-excel', 'Excel'], ['nls-powerpoint', 'PowerPoint'], ['nls-ai', 'AI']] },
    nckh: { pages: [['nckh', 'Tổng quan'], ['nckh-boi-canh', 'Bối cảnh 2025–2027'], ['nckh-giai-thuong', 'Giải thưởng'], ['nckh-tai-lieu', 'Tài liệu'], ['nckh-2026-2027', 'Kế hoạch 2026–2027'], ['nckh-2027-2028', 'Kế hoạch 2027–2028'], ['nckh-2028-2029', 'Kế hoạch 2028–2029']] },
    cc: { pages: [['cc', 'Tổng quan'], ['cc-tin-hoc', 'Tin học'], ['cc-ngoai-ngu', 'Ngoại ngữ']] },
    kh: { pages: [['kh', 'Tổng quan'], ['kh-2026', '2026'], ['kh-2027', '2027']] }
  };
  var pageToGroup = {};
  Object.keys(GROUPS).forEach(function (g) {
    GROUPS[g].pages.forEach(function (p) { pageToGroup[p[0]] = g; });
  });
  var pages = [].slice.call(document.querySelectorAll('.page'));
  var navLinks = [].slice.call(document.querySelectorAll('.primary a'));
  var sub = document.getElementById('subnav');
  var first = true;

  function reveal(box, el) {
    if (!box || !el || box.scrollWidth <= box.clientWidth) return;
    var b = box.getBoundingClientRect(), e = el.getBoundingClientRect();
    box.scrollLeft += (e.left - b.left) - (b.width - e.width) / 2;
  }

  function route() {
    var id = '';
    try { id = decodeURIComponent((location.hash || '').replace(/^#/, '')); } catch (e) { id = ''; }
    if (!pageToGroup[id]) id = 'trang-chu';
    var g = pageToGroup[id];
    pages.forEach(function (el) { el.hidden = el.getAttribute('data-page') !== id; });
    navLinks.forEach(function (a) {
      if (a.getAttribute('data-group') === g) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    var list = GROUPS[g].pages;
    sub.textContent = '';
    if (list.length > 1) {
      list.forEach(function (p) {
        var a = document.createElement('a');
        a.href = '#' + p[0];
        a.textContent = p[1];
        if (p[0] === id) a.setAttribute('aria-current', 'page');
        sub.appendChild(a);
      });
      sub.hidden = false;
    } else {
      sub.hidden = true;
    }
    reveal(document.querySelector('.primary'), document.querySelector('.primary a[aria-current="page"]'));
    reveal(sub, sub.querySelector('a[aria-current="page"]'));
    if (!first) window.scrollTo(0, 0);
    first = false;
  }
  window.addEventListener('hashchange', route);
  route();

  // mark the academic year we are in (a year starts in September 2026)
  var now = new Date();
  var idx = now.getFullYear() - 2026 - (now.getMonth() < 8 ? 1 : 0);
  var cur = document.querySelector('.year[data-i="' + idx + '"]');
  if (cur) cur.classList.add('is-now');

  // copy buttons
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.copy') : null;
    if (!b) return;
    var el = document.getElementById(b.getAttribute('data-target'));
    if (!el) return;
    var old = b.getAttribute('data-label') || b.textContent;
    b.setAttribute('data-label', old);
    function done(msg) { b.textContent = msg; setTimeout(function () { b.textContent = old; }, 1800); }
    function fallback() {
      var r = document.createRange();
      r.selectNodeContents(el);
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      done('Đã chọn, nhấn Ctrl+C');
    }
    try {
      navigator.clipboard.writeText(el.textContent.trim()).then(function () { done('Đã sao chép'); }, fallback);
    } catch (err) { fallback(); }
  });

  // hotel KPI calculator
  var avail = document.getElementById('c-avail');
  var sold = document.getElementById('c-sold');
  var rev = document.getElementById('c-rev');
  var outOcc = document.getElementById('o-occ');
  var outAdr = document.getElementById('o-adr');
  var outRev = document.getElementById('o-revpar');
  var note = document.getElementById('c-note');
  var nf = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
  function money(n) { return nf.format(Math.round(n)) + ' đ'; }
  function calc() {
    var a = Number(avail.value), s = Number(sold.value), r = Number(rev.value);
    note.textContent = '';
    if (!(a > 0)) { outOcc.textContent = outAdr.textContent = outRev.textContent = '—'; note.textContent = 'Nhập số phòng có thể bán lớn hơn 0.'; return; }
    if (s > a) { outOcc.textContent = outAdr.textContent = outRev.textContent = '—'; note.textContent = 'Số phòng đã bán không thể lớn hơn số phòng có thể bán.'; return; }
    if (s < 0 || r < 0) { outOcc.textContent = outAdr.textContent = outRev.textContent = '—'; note.textContent = 'Các giá trị không được âm.'; return; }
    outOcc.textContent = (Math.round(s / a * 1000) / 10).toLocaleString('vi-VN') + '%';
    outAdr.textContent = s > 0 ? money(r / s) : '—';
    outRev.textContent = money(r / a);
  }
  [avail, sold, rev].forEach(function (el) { el.addEventListener('input', calc); });
  calc();
})();
