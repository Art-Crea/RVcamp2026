/* =====================================================================
   rv_portraits.js — 武将の顔写真を「どちらの置き方でも」表示させる
   ---------------------------------------------------------------------
   いま起きていたこと
     ・36枚の写真はリポジトリ直下（01_r.jpg 〜 36_b.jpg）にある
     ・rv_data.js は portraits/01_r.jpg を見に行っていた
     ・portraits はフォルダではなく0バイトのファイルだった
     → 全部404。これが「顔が1枚も出ない」原因でした。

   このファイルの役目は2つ。

     1. 画像の読み込みに失敗したら、もう一方の場所を自動で試す
          01_r.jpg           が失敗 → portraits/01_r.jpg を試す
          portraits/01_r.jpg が失敗 → 01_r.jpg を試す

     2. それでも駄目なら、その武将の「兜」に戻す
          rv_data.js が持っている svgKabuto() をそのまま使います。
          写真を入れる前の姿です。武田信玄なら諏訪法性兜、
          真田幸村なら鹿角脇立。赤軍は朱、青軍は藍で描きます。

   置き方
     <script src="./rv_portraits.js"></script> を rv_data.js より前に。
     兜の描画は「画像が失敗した瞬間」に行うので、
     その時点では rv_data.js の読み込みが済んでいます。
   ===================================================================== */
(function () {
  'use strict';

  var TRIED = new WeakMap();
  var SHU = '#c0392b';   /* 朱 — 赤軍 */
  var AI  = '#2c5f8a';   /* 藍 — 青軍 */
  var SUMI = '#16151a';  /* 墨 — 兜の陰に使われている色に合わせる */
  var KIN = '#c9a227';   /* 金 — 縁 */

  /* ── ファイル名から武将を特定する ──────────────────────────
     01_r.jpg → BUSHO[0]（赤軍1人目）
     36_b.jpg → BUSHO[35]
     rv_data.js の並び順がそのまま番号になっています。          */
  function bushoFromSrc(src) {
    if (!src) return null;
    var m = String(src).match(/(\d{1,2})_([rb])\.(?:jpe?g|png|webp)/i);
    if (!m) return null;
    var idx = parseInt(m[1], 10) - 1;
    var army = m[2].toLowerCase();

    /* rv_data.js の BUSHO は const 宣言なので window 経由では取れません。
       名前で直接参照します（rv_data.js 読み込み後にのみ成功）。      */
    var list = null;
    try { list = (typeof BUSHO !== 'undefined') ? BUSHO : null; } catch (e) { list = null; }
    if (list && list[idx]) return list[idx];

    /* 万一データが無くても、軍だけは分かるので最低限を返す */
    return { name: '', kb: 'kuwagata', kbn: '', a: army };
  }

  /* ── 兜を data URI にする ──────────────────────────────────
     svgKabuto() は currentColor で描かれています。
     img タグの中では色が解決されないので、軍の色に置き換えます。 */
  function kabutoDataURI(b, src) {
    var blue = (b && b.a === 'b') || /_b\./i.test(src || '');
    var color = blue ? AI : SHU;
    var inner = '';

    try {
      if (typeof svgKabuto === 'function' && b) {
        /* rv_data.js の本物の兜。<svg> の中身だけ取り出します。 */
        var s = svgKabuto(b);
        inner = s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
      }
    } catch (e) { inner = ''; }

    if (!inner) {
      /* rv_data.js が読めていないときの最低限の兜 */
      inner =
        '<path d="M50 30c-20 0-33 14-35 32-1 8 1 12 5 12h60c4 0 6-4 5-12-2-18-15-32-35-32z"' +
          ' fill="currentColor" opacity=".9"/>' +
        '<path d="M13 74c-2 10 4 16 14 16h46c10 0 16-6 14-16z" fill="currentColor" opacity=".5"/>' +
        '<path d="M50 56c-5 0-8 4-8 9v9h16v-9c0-5-3-9-8-9z" fill="' + SUMI + '" opacity=".85"/>';
    }
    inner = inner.split('currentColor').join(color);

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
        '<rect width="100" height="100" fill="' + SUMI + '"/>' +
        '<rect x="1.5" y="1.5" width="97" height="97" fill="none" stroke="' + KIN +
          '" stroke-width="1.2" opacity=".45"/>' +
        '<g transform="translate(0,4)">' + inner + '</g>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ── もう一方の置き場所を返す ───────────────────────────── */
  function swap(src) {
    if (!src || /^data:/.test(src)) return null;
    var clean = String(src).split('?')[0];
    if (clean.indexOf('portraits/') >= 0) return clean.replace('portraits/', '');
    var i = clean.lastIndexOf('/');
    return (i < 0) ? 'portraits/' + clean
                   : clean.slice(0, i + 1) + 'portraits/' + clean.slice(i + 1);
  }

  /* ── 読み込み失敗をページ全体で拾う（capture phase）──────────
     あとから差し込まれた img にも効きます。                     */
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (!el || el.tagName !== 'IMG') return;

    var origin = el.dataset.origin || el.getAttribute('src') || '';
    if (!el.dataset.origin) el.dataset.origin = origin;

    var n = (TRIED.get(el) || 0) + 1;
    TRIED.set(el, n);

    if (n === 1) {
      var alt = swap(el.getAttribute('src'));
      if (alt) { el.src = alt; return; }
    }
    /* 2度失敗したら兜に戻す */
    var b = bushoFromSrc(origin) || bushoFromSrc(el.getAttribute('src'));
    el.src = kabutoDataURI(b, origin);
    el.classList.add('rv-kabuto-fallback');
    if (b && b.kbn && !el.getAttribute('title')) {
      el.title = (b.name ? b.name + '：' : '') + b.kbn + '（写真準備中）';
    }
  }, true);

  /* 差し替え前の src を控える */
  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.images, function (img) {
      if (!img.dataset.origin) img.dataset.origin = img.getAttribute('src') || '';
    });
  });

  /* 画面側から直接使いたいとき */
  window.RVPortrait = {
    swap: swap,
    kabuto: kabutoDataURI,
    bushoFromSrc: bushoFromSrc,
    /* 写真が無いことが分かっている武将を、最初から兜で出したいとき */
    kabutoFor: function (b) { return kabutoDataURI(b, b && b.img); },
    img: function (src, name) {
      var el = new Image();
      el.dataset.origin = src;
      el.alt = name || '';
      el.src = src;
      return el;
    }
  };
})();
