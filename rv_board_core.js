/* =====================================================================
   rv_board_core.js — 合戦盤の本体（1枚のHTMLで完結）
   依存：rv_config.js / rv_data.js / rv_sync.js / rv_gmap.js / Leaflet
   ===================================================================== */
(function () {
  const CFG = window.RV_CONFIG || {};
  const A_R = CFG.ARMY_R || '赤軍';
  const A_B = CFG.ARMY_B || '青軍';

  const qs = n => { const m = new RegExp('[?&]' + n + '=([^&#]*)').exec(location.search); return m ? decodeURIComponent(m[1]) : ''; };
  const isAdmin = !!(CFG.ADMIN_TOKEN && qs('admin') === CFG.ADMIN_TOKEN);
  const adminQS = isAdmin ? ('?admin=' + encodeURIComponent(CFG.ADMIN_TOKEN)) : '';

  document.body.innerHTML = `
<header>
  <div class="brand">
    <h1><span class="shu">別府</span>國盗リ<span class="ai">合戦</span></h1>
    <span class="sub">25エリア陣取盤 × リアル地図 ｜ 8/27</span>
    <a class="home" href="./index.html">← 本陣HUBへ</a>
  </div>
  <nav role="tablist">
    <button role="tab" aria-selected="true"  data-tab="game">合戦盤</button>
    <button role="tab" aria-selected="false" data-tab="busho">陣立 三十六将</button>
    <button role="tab" aria-selected="false" data-tab="edit">陣所一覧・書出</button>
    ${isAdmin ? '<button role="tab" aria-selected="false" data-tab="admin">🔐 運営</button>' : ''}
  </nav>
</header>

<main>
<section class="panel" id="tab-game">
  <div class="score">
    <div class="side r" id="sc-r"><span class="nm">${A_R}</span><span class="n" id="n-r">0</span></div>
    <div class="side b" id="sc-b"><span class="nm">${A_B}</span><span class="n" id="n-b">0</span></div>
  </div>
  <div class="bar">
    <span class="chip" id="mapChip">地図を準備中…</span>
    <span class="chip" id="modeChip"></span>
    <button class="btn" id="hudBtn">盤を地図に重ねる</button>
    <button class="btn" id="fitBtn">全陣所を表示</button>
    <a class="btn" id="mymapBtn" target="_blank" rel="noopener" hidden>公式マイマップ</a>
    ${isAdmin
      ? '<button class="btn red on" id="t-r">手番：赤</button><button class="btn blue" id="t-b">手番：青</button><button class="btn" id="resetBtn">盤を初期化</button>'
      : '<span class="chip off">観戦モード（占領は武将画面／GM本陣から）</span>'}
  </div>
  <div id="stage" style="display:grid;grid-template-columns:1fr 400px;gap:14px;align-items:start">
    <div class="mapwrap">
      <div id="map"></div>
      <div id="hud" hidden>
        <div class="hud-t">國盗リ盤（重ね表示）</div>
        <div class="board mini" id="board-hud"></div>
      </div>
    </div>
    <div>
      <div class="board" id="board"></div>
      <p class="side-note">パネル番号＝地図のピン番号。ホバーで連動。⚑＝GOAL。薄いパネル＝クールダウン中。</p>
      <div class="box" style="margin-top:12px"><h3>戦況ログ</h3><div id="log"></div></div>
    </div>
  </div>
</section>

<section class="panel" id="tab-busho" hidden>
  <div class="bar"><span class="chip">兜の前立（20種）× 家紋（29種）で36名を識別</span></div>
  <div class="army-head r"><h2>${A_R}　十八将</h2><span class="rule"></span></div>
  <div class="roster" id="roster-r"></div>
  <div class="army-head b"><h2>${A_B}　十八将</h2><span class="rule"></span></div>
  <div class="roster" id="roster-b"></div>
  <p class="side-note">※家紋・兜は識別性を優先した幾何簡略化の意匠です（正式紋の忠実再現ではありません）。</p>
</section>

<section class="panel" id="tab-edit" hidden>
  <div class="box">
    <h3>Googleマイマップで参加者に配る（キー不要・無料）</h3>
    <p>① CSVを書出 → ② <a href="https://www.google.com/maps/d/" target="_blank" rel="noopener">Googleマイマップ</a>で新規地図にインポート（緯度／経度列を指定・旗アイコン設定）→ ③「リンクを知る全員が閲覧可」で共有 → ④ URLを <code>rv_config.js</code> の MYMAP_URL に貼る。<br>
      参加者はGoogleマップアプリでそのままナビできます。地点を直したらCSVを入れ替えるだけ。<b>APIキーは不要です。</b></p>
    <div class="bar">
      <button class="btn" id="expCsv">マイマップ用CSV</button>
      <button class="btn" id="expKml">KML</button>
      <button class="btn" id="expJson">JSON書出</button>
      ${isAdmin ? '<button class="btn" id="impJson">JSON読込</button>' : ''}
    </div>
  </div>
  <div class="tbl-wrap">
    <table><thead><tr><th>№</th><th>陣所名</th><th>緯度</th><th>経度</th><th>ヒント</th><th>旗</th><th>確度</th><th></th></tr></thead>
    <tbody id="cpBody"></tbody></table>
  </div>
  <p class="side-note">${isAdmin ? '地図上のピンは<b>ドラッグで移動</b>でき、離した瞬間に座標が更新されます。<br>' : ''}確度：<b>確定</b>＝実測済／<b>候補</b>＝観光公開情報からの提案（要現地確認）。</p>
  ${isAdmin ? `<div class="box" style="margin-top:14px">
    <h3>控えの地（差し替え候補）</h3>
    <div class="tbl-wrap"><table><thead><tr><th>陣所名</th><th>緯度</th><th>経度</th><th>メモ</th><th></th></tr></thead><tbody id="spareBody"></tbody></table></div>
  </div>
  <div class="box"><h3>JSON入出力</h3><textarea id="io" spellcheck="false"></textarea></div>` : ''}
</section>

${isAdmin ? `<section class="panel" id="tab-admin" hidden>
  <div id="mapAdmin"></div>
  <div class="box">
    <h3>この画面について</h3>
    <p>URL に <code>?admin=…</code> が付いているため運営機能が出ています。
      <b>参加者に配るURLにはこのパラメータを付けないでください。</b>
      付いていない場合、地図の切替もキー入力欄も盤の操作ボタンもDOMに存在しません。</p>
    <div class="bar">
      <a class="btn" href="./rv_gm_dashboard.html">🎛️ GM本陣（ルール・承認・武将割当）</a>
      <a class="btn" href="./rv_player_app.html">📱 武将画面</a>
    </div>
  </div>
</section>` : ''}
</main>
<footer>RV CAMP — HONJIN ｜ 別府國盗リ合戦 · art-crea.jp</footer>`;

  const $ = id => document.getElementById(id);
  const TABS = ['game', 'busho', 'edit'].concat(isAdmin ? ['admin'] : []);
  document.querySelectorAll('nav button').forEach(btn => btn.onclick = () => {
    document.querySelectorAll('nav button').forEach(b => b.setAttribute('aria-selected', b === btn));
    TABS.forEach(t => $('tab-' + t).hidden = (t !== btn.dataset.tab));
    if (btn.dataset.tab === 'game') setTimeout(() => RVMap.resize(), 60);
  });

  /* ---------------- 盤 ---------------- */
  function cellHTML(s, i) {
    const cp = s.cps[i] || { name: '—' };
    const own = s.owner[i] === 'r' ? 'red' : s.owner[i] === 'b' ? 'blue' : '';
    const lock = (s.lockUntil && s.lockUntil[i] > Date.now()) ? ' lock' : '';
    const goal = /GOAL/.test(cp.name) ? '<span class="goal">⚑</span>' : '';
    return '<div class="cell ' + own + lock + '" data-i="' + i + '" tabindex="0">' + goal
      + '<span class="no">' + (i + 1) + '</span>'
      + '<span class="ic">' + svgKamon(PANEL_KAMON[i]) + '</span>'
      + '<span class="nm">' + esc(cp.name) + '</span></div>';
  }
  function renderBoard(s) {
    const html = Array.from({ length: 25 }, (_, i) => cellHTML(s, i)).join('');
    $('board').innerHTML = html;
    $('board-hud').innerHTML = html;
    document.querySelectorAll('.cell').forEach(el => {
      const i = +el.dataset.i;
      el.onmouseenter = () => document.querySelectorAll('.cell')
        .forEach(c => c.classList.toggle('focus', +c.dataset.i === i));
      if (isAdmin) {
        el.onclick = () => claim(i);
        el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); claim(i); } };
      } else { el.style.cursor = 'default'; }
    });
  }
  async function claim(i) {
    const s = Sync.state;
    if (s.lockUntil && s.lockUntil[i] > Date.now()) return alert('この陣所はクールダウン中です');
    const team = s.cfg.turnMode === 'alternate'
      ? s.turn
      : (prompt('どちらが占領しますか？  r＝' + A_R + ' ／ b＝' + A_B, 'r') || '').trim();
    if (team !== 'r' && team !== 'b') return;
    await Sync.commit(st => Sync.applyClaim(st, i, team, 'GM'));
  }
  function renderScore(s) {
    const sc = Sync.score(s);
    $('n-r').textContent = sc.r; $('n-b').textContent = sc.b;
    const alt = s.cfg.turnMode === 'alternate';
    $('sc-r').classList.toggle('turn', alt && s.turn === 'r');
    $('sc-b').classList.toggle('turn', alt && s.turn === 'b');
    $('modeChip').textContent = alt ? '交互手番（GM1台）' : '早取り制（36人モード）';
    if (isAdmin) {
      $('t-r').classList.toggle('on', s.turn === 'r');
      $('t-b').classList.toggle('on', s.turn === 'b');
      $('t-r').style.display = alt ? '' : 'none';
      $('t-b').style.display = alt ? '' : 'none';
    }
  }
  function renderLog(s) {
    $('log').innerHTML = (s.log || []).slice(0, 20).map(l => '<div class="logline">'
      + new Date(l.ts).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      + ' <b>' + esc(l.t) + '</b></div>').join('') || '<p class="side-note">まだ動きはありません。</p>';
  }

  /* ---------------- 地図ピン ---------------- */
  function renderPins(s) {
    if (!RVMap.map) return;
    RVMap.clearMarkers();
    s.cps.forEach((cp, i) => {
      const col = s.owner[i] === 'r' ? '#c8102e' : s.owner[i] === 'b' ? '#1f5fa9' : '#8d8878';
      RVMap.addMarker({
        lat: cp.lat, lng: cp.lng, label: String(i + 1),
        title: (cp.flag || '') + ' ' + cp.name, color: col,
        draggable: isAdmin,
        onClick: () => {
          document.querySelectorAll('.cell').forEach(c => c.classList.toggle('focus', +c.dataset.i === i));
          if (isAdmin && confirm((i + 1) + '. ' + cp.name + '\nこの陣所を占領しますか？')) claim(i);
        },
        onDragEnd: async (la, ln) =>
          Sync.commit(st => { st.cps[i].lat = +la.toFixed(6); st.cps[i].lng = +ln.toFixed(6); })
      });
    });
  }
  const fitAll = () => RVMap.fitAll(Sync.state.cps.map(c => ({ lat: c.lat, lng: c.lng })));

  /* ---------------- 陣立 ---------------- */
  function renderRoster(s) {
    const mk = b => '<div class="bcard ' + b.a + '">'
      + '<div class="kabuto">' + (b.img
          ? '<img src="./' + b.img + '" alt="' + esc(b.name) + '" loading="lazy">'
          : svgKabuto(b)) + '</div>'
      + '<div class="name">' + esc(b.name) + '</div>'
      + '<div class="meta">兜：' + esc(b.kbn) + (b.player ? '<br>👤 ' + esc(b.player) : '') + '</div>'
      + '<div class="crest">' + svgKamon(b.km) + '<span>' + esc(b.kmn) + '</span></div></div>';
    $('roster-r').innerHTML = s.busho.filter(b => b.a === 'r').map(mk).join('');
    $('roster-b').innerHTML = s.busho.filter(b => b.a === 'b').map(mk).join('');
  }

  /* ---------------- 一覧・書出 ---------------- */
  function renderEditor(s) {
    const ro = isAdmin ? '' : ' readonly';
    $('cpBody').innerHTML = s.cps.map((cp, i) => '<tr><td class="n">' + (i + 1) + '</td>'
      + ['name', 'lat', 'lng', 'hint', 'flag', 'conf']
        .map(k => '<td><input value="' + esc(cp[k]) + '" data-i="' + i + '" data-k="' + k + '"' + ro + '></td>').join('')
      + '<td><a class="mini-btn" href="' + gmapLink(cp) + '" target="_blank" rel="noopener">地図</a></td></tr>').join('');
    if (!isAdmin) return;
    $('cpBody').querySelectorAll('input').forEach(inp => inp.onchange = async () => {
      const i = +inp.dataset.i, k = inp.dataset.k, v = inp.value;
      await Sync.commit(st => { st.cps[i][k] = (k === 'lat' || k === 'lng') ? (parseFloat(v) || 0) : v; });
    });
    $('spareBody').innerHTML = DEFAULT_SPARE.map((sp, i) =>
      '<tr><td>' + esc(sp.name) + '</td><td>' + sp.lat + '</td><td>' + sp.lng + '</td><td>' + esc(sp.memo) + '</td>'
      + '<td><button class="mini-btn" data-add="' + i + '">25に追加</button></td></tr>').join('');
    $('spareBody').querySelectorAll('[data-add]').forEach(b => b.onclick = async () => {
      const sp = DEFAULT_SPARE[+b.dataset.add];
      await Sync.commit(st => { st.cps.push({ name: sp.name, lat: sp.lat, lng: sp.lng, hint: sp.memo, flag: '⚔', conf: '候補' }); });
    });
  }
  function dl(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain;charset=utf-8' }));
    a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  $('expCsv').onclick = () => dl('beppu_kunitori_25.csv',
    '\ufeff番号,陣所名,緯度,経度,ヒント,旗,確度,Googleマップ\n'
    + Sync.state.cps.map((c, i) => [i + 1, q(c.name), c.lat, c.lng, q(c.hint), c.flag, c.conf, gmapLink(c)].join(',')).join('\n'),
    'text/csv;charset=utf-8');
  $('expKml').onclick = () => dl('beppu_kunitori_25.kml',
    '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document>\n<name>別府國盗リ合戦 25陣所</name>\n'
    + Sync.state.cps.map((c, i) => '  <Placemark><name>' + (i + 1) + '. ' + esc(c.name) + '</name>'
      + '<description>' + esc(c.hint) + '</description><Point><coordinates>'
      + c.lng + ',' + c.lat + ',0</coordinates></Point></Placemark>').join('\n')
    + '\n</Document></kml>', 'application/vnd.google-earth.kml+xml');
  $('expJson').onclick = () => {
    const t = JSON.stringify({ cps: Sync.state.cps }, null, 2);
    if ($('io')) $('io').value = t;
    dl('beppu_kunitori_25.json', t, 'application/json');
  };
  if (isAdmin) $('impJson').onclick = async () => {
    try { const d = JSON.parse($('io').value); if (d.cps) await Sync.commit(st => { st.cps = d.cps; }); fitAll(); }
    catch (e) { alert('JSONを解析できません'); }
  };

  /* ---------------- ボタン ---------------- */
  $('hudBtn').onclick = e => { const h = $('hud'); h.hidden = !h.hidden; e.target.classList.toggle('on', !h.hidden); };
  $('fitBtn').onclick = fitAll;
  if (isAdmin) {
    $('t-r').onclick = () => Sync.commit(s => { s.turn = 'r'; });
    $('t-b').onclick = () => Sync.commit(s => { s.turn = 'b'; });
    $('resetBtn').onclick = () => { if (confirm('盤・ログ・申請をすべて初期化します。よろしいですか？')) Sync.reset(); };
  }
  if (CFG.MYMAP_URL) { $('mymapBtn').href = CFG.MYMAP_URL; $('mymapBtn').hidden = false; }
  if (window.innerWidth < 1000) $('stage').style.gridTemplateColumns = '1fr';

  /* ---------------- 起動 ---------------- */
  (async () => {
    await RVMap.init('map');
    $('mapChip').textContent = RVMap.statusText() + (RVMap.locked ? ' 🔒' : '');
    $('mapChip').className = 'chip ' + (RVMap.provider === 'google' ? 'live' : 'off');
    if (isAdmin) RVMap.mountAdminPanel($('mapAdmin'));

    let saved = null;
    try { saved = JSON.parse(localStorage.getItem('rv-conn')); } catch (e) {}
    try { await Sync.init(saved || CFG.SYNC || { backend: 'local', room: 'RV827' }); }
    catch (e) { await Sync.init({ backend: 'local', room: 'RV827' }); }

    Sync.subscribe(s => { renderBoard(s); renderScore(s); renderLog(s); renderPins(s); renderRoster(s); renderEditor(s); });
    fitAll();
    setInterval(() => { if (Sync.state) renderBoard(Sync.state); }, 5000);
  })();
})();
