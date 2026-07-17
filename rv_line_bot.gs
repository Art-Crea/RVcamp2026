/* =====================================================================
   rv_gmap.js — 地図層（1枚のHTMLでOSM／Googleを切替）
   ---------------------------------------------------------------------
   ■ 地図モードの決まり方（上から順に評価）
     1. RV_CONFIG.LOCK_MAP === true
          → RV_CONFIG.MAP_MODE で全員固定（運営の端末上書きも無視）＝本番用
     2. 運営（?admin=…）が画面から選んだ値（localStorage 'rv-map-mode'）
          → その端末だけ。試用・検証用
     3. RV_CONFIG.MAP_MODE（既定）

   ■ キーの決まり方
     1. RV_CONFIG.GMAP_KEY   … 空でなければ全端末（参加者含む）に効く
     2. localStorage 'rv-gmap-key' … その端末だけ（＝A方式。GM端末のみGoogle地図）

   ■ 正直な注意（重要）
     ・キーが GM端末の localStorage にしか無い場合、
       Google地図が出るのは GM端末だけです。参加者は自動でOSMになります。
     ・参加者全員に Google地図を見せたいなら、キーは RV_CONFIG.GMAP_KEY に
       書く＝公開ファイルに載せるしかありません。
     ・クライアントサイドのキーは開発者ツールの Network タブに必ず現れます。
       UIで隠しても秘密にはなりません。実効的な防御は Google Cloud 側の
         1) アプリケーションの制限 → ウェブサイト → https://art-crea.github.io/*
         2) API の制限 → Maps JavaScript API のみ
         3) 予算とアラートで上限設定
       です。これをかけてあれば、キーが見えても他人には使えません。

   ■ 事故防止
     キー未設定・認証拒否・通信断・8秒無応答 → すべて OSM に自動フォールバック。
     当日、地図が真っ白になって試合が止まることはありません。
   ===================================================================== */
(function () {
  const CFG = window.RV_CONFIG || {};
  const LS_KEY  = 'rv-gmap-key';
  const LS_MODE = 'rv-map-mode';

  function qs(n) {
    const m = new RegExp('[?&]' + n + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : '';
  }
  const isAdmin = !!(CFG.ADMIN_TOKEN && qs('admin') === CFG.ADMIN_TOKEN);

  const ls = {
    get(k)   { try { return (localStorage.getItem(k) || '').trim(); } catch (e) { return ''; } },
    set(k,v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k)   { try { localStorage.removeItem(k); } catch (e) {} }
  };

  /* ---- 解決ロジック ---- */
  function resolveMode() {
    if (CFG.LOCK_MAP === true) return { mode: CFG.MAP_MODE || 'osm', src: '本番固定（rv_config.js）' };
    const local = ls.get(LS_MODE);
    if (local === 'osm' || local === 'gmap') return { mode: local, src: 'この端末の設定' };
    return { mode: CFG.MAP_MODE || 'osm', src: 'rv_config.js の既定' };
  }
  function resolveKey() {
    const cfgKey = String(CFG.GMAP_KEY || '').trim();
    if (cfgKey) return { key: cfgKey, src: 'rv_config.js（全端末に配布）' };
    const local = ls.get(LS_KEY);
    if (local) return { key: local, src: 'この端末のみ（参加者には未配布）' };
    return { key: '', src: 'なし' };
  }
  /* 参加者（?adminなし・キー未保存の端末）に何が見えるか */
  function publicView() {
    const mode = CFG.MAP_MODE || 'osm';
    const key  = String(CFG.GMAP_KEY || '').trim();
    return (mode === 'gmap' && key) ? 'Google地図' : 'OpenStreetMap';
  }
  function mask(k) {
    if (!k) return '（未設定）';
    return k.length <= 10 ? k[0] + '••••••' : k.slice(0, 6) + '••••••••••••' + k.slice(-4);
  }

  function loadScript(src) {
    return new Promise((ok, ng) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = ok; s.onerror = () => ng(new Error('LOAD'));
      document.head.appendChild(s);
    });
  }
  function loadGoogle(key) {
    return new Promise((ok, ng) => {
      let done = false;
      const fin = (fn, v) => { if (!done) { done = true; fn(v); } };
      // キー不正 / リファラー拒否 / 請求先未設定 のとき Google がこれを呼ぶ
      window.gm_authFailure = () => fin(ng, new Error('AUTH'));
      window.__rvGmapReady  = () => fin(ok);
      loadScript('https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key)
        + '&callback=__rvGmapReady&language=ja&region=JP').catch(() => fin(ng, new Error('LOAD')));
      setTimeout(() => fin(ng, new Error('TIMEOUT')), 8000);
    });
  }

  /* スクリプトは読めたのにタイルが描画されない場合（割当超過・課金停止など、
     gm_authFailure が飛ばないケース）を検知する。6秒以内に tilesloaded が
     来なければ失敗とみなし、OSM にフォールバックする。 */
  function watchTiles(gmap, ms) {
    return new Promise((ok, ng) => {
      let done = false;
      const t = setTimeout(() => { if (!done) { done = true; ng(new Error('NOTILES')); } }, ms || 6000);
      google.maps.event.addListenerOnce(gmap, 'tilesloaded', () => {
        if (!done) { done = true; clearTimeout(t); ok(); }
      });
    });
  }

  const GSTYLE = [
    { elementType: 'geometry',           stylers: [{ color: '#1d1c22' }] },
    { elementType: 'labels.text.fill',   stylers: [{ color: '#a49f92' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0c0f' }] },
    { featureType: 'water',    elementType: 'geometry', stylers: [{ color: '#12202f' }] },
    { featureType: 'road',     elementType: 'geometry', stylers: [{ color: '#2c2b33' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1b2a1e' }] }
  ];

  const RVMap = {
    isAdmin,
    locked: CFG.LOCK_MAP === true,
    mode: 'osm',          // 要求されたモード
    modeSrc: '',
    provider: null,       // 実際に動いているもの
    fallbackReason: '',
    map: null,
    _markers: [],

    async init(elId) {
      const el = document.getElementById(elId);
      const r = resolveMode();
      this.mode = r.mode; this.modeSrc = r.src;
      const c = CFG.MAP_CENTER || { lat: 33.30, lng: 131.47 };
      const z = CFG.MAP_ZOOM || 12;

      if (this.mode === 'gmap') {
        const k = resolveKey();
        if (!k.key) {
          this.fallbackReason = 'キー未設定';
        } else {
          try {
            await loadGoogle(k.key);
            const gmap = new google.maps.Map(el, {
              center: c, zoom: z, mapTypeControl: true,
              streetViewControl: false, fullscreenControl: true, styles: GSTYLE
            });
            await watchTiles(gmap, 6000);   // タイルが本当に出たか検証
            this.provider = 'google';
            this.map = gmap;
            this._ready();
            return this;
          } catch (e) {
            this.fallbackReason = ({
              AUTH:    'キーが拒否されました（リファラー制限／請求先を確認）',
              LOAD:    '読み込み失敗（通信を確認）',
              TIMEOUT: '応答なし（通信を確認）',
              NOTILES: 'タイルが描画されません（割当上限の超過が濃厚）'
            })[e.message] || e.message;
            el.innerHTML = '';              // Googleが残した残骸を消す
            try { delete window.google; } catch (x) {}
          }
        }
      }

      if (!window.L) {
        el.innerHTML = '<p style="padding:24px;text-align:center;color:#a49f92;font-size:12px">地図ライブラリを読み込めませんでした。</p>';
        return this;
      }
      this.provider = 'osm';
      this.map = L.map(el).setView([c.lat, c.lng], z);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(this.map);
      this._ready();
      return this;
    },

    _ready() {
      document.dispatchEvent(new CustomEvent('rvmap:ready',
        { detail: { provider: this.provider, mode: this.mode } }));
    },

    statusText() {
      if (this.provider === 'google') return '🗺 Google地図';
      if (this.mode === 'gmap') return '🗺 OpenStreetMap（' + (this.fallbackReason || '代替') + '）';
      return '🗺 OpenStreetMap（キー不要）';
    },

    /* ---- マーカー（両プロバイダ共通） ---- */
    addMarker(o) {
      const color = o.color || '#8d8878';
      const label = String(o.label == null ? '' : o.label);
      const title = o.title || '';

      if (this.provider === 'google') {
        const m = new google.maps.Marker({
          position: { lat: o.lat, lng: o.lng }, map: this.map,
          draggable: !!o.draggable, title,
          label: { text: label, color: '#fff', fontSize: '11px', fontWeight: '600' },
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 13, fillColor: color,
                  fillOpacity: 1, strokeColor: '#e8e3d6', strokeWeight: 2 }
        });
        if (o.onClick)   m.addListener('click', o.onClick);
        if (o.onDragEnd) m.addListener('dragend', e => o.onDragEnd(e.latLng.lat(), e.latLng.lng()));
        this._markers.push(m);
        return m;
      }

      // ラベルはピンの外・下に別要素で置く（アイコンと文字が重ならない）
      const html = '<div style="display:flex;flex-direction:column;align-items:center;line-height:1">'
        + '<div style="width:26px;height:26px;border-radius:50%;background:' + color
        + ';border:2px solid #e8e3d6;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.5)">'
        + '<span style="color:#fff;font:600 11px/1 sans-serif">' + label + '</span></div>'
        + (title ? '<span style="margin-top:3px;padding:1px 5px;border-radius:2px;background:rgba(13,12,15,.85);'
            + 'color:#e8e3d6;font:10px/1.4 sans-serif;white-space:nowrap;border:1px solid rgba(232,227,214,.2)">'
            + title + '</span>' : '')
        + '</div>';
      const m = L.marker([o.lat, o.lng], {
        icon: L.divIcon({ html, className: '', iconSize: [26, 26], iconAnchor: [13, 13] }),
        draggable: !!o.draggable
      }).addTo(this.map);
      if (o.onClick)   m.on('click', o.onClick);
      if (o.onDragEnd) m.on('dragend', e => { const ll = e.target.getLatLng(); o.onDragEnd(ll.lat, ll.lng); });
      this._markers.push(m);
      return m;
    },

    clearMarkers() {
      this._markers.forEach(m => { if (this.provider === 'google') m.setMap(null); else this.map.removeLayer(m); });
      this._markers = [];
    },

    fitAll(pts) {
      const p = (pts && pts.length) ? pts : this._markers.map(m => this.provider === 'google'
        ? { lat: m.getPosition().lat(), lng: m.getPosition().lng() }
        : { lat: m.getLatLng().lat, lng: m.getLatLng().lng });
      if (!p.length || !this.map) return;
      if (this.provider === 'google') {
        const b = new google.maps.LatLngBounds();
        p.forEach(x => b.extend(x));
        this.map.fitBounds(b, 48);
      } else {
        this.map.fitBounds(L.latLngBounds(p.map(x => [x.lat, x.lng])), { padding: [40, 40] });
      }
    },

    resize() {
      if (!this.map) return;
      if (this.provider === 'google') google.maps.event.trigger(this.map, 'resize');
      else this.map.invalidateSize();
    },

    /* =================================================================
       運営専用パネル：地図の切替・キー登録・本番固定の設定出力
       ?admin=<ADMIN_TOKEN> のときだけ描画。それ以外ではDOMに何も作らない。
       ================================================================= */
    mountAdminPanel(el) {
      if (!el) return;
      if (!isAdmin) { el.innerHTML = ''; return; }

      const k = resolveKey();
      const cur = resolveMode();
      const pub = publicView();
      const cfgKeySet = !!String(CFG.GMAP_KEY || '').trim();

      el.innerHTML = `
<div class="box" style="border-color:var(--kin)">
  <h3>🗺 地図の切替（運営のみ）</h3>

  <table style="margin-bottom:12px">
    <tr><th style="width:44%">誰の画面か</th><th>表示される地図</th></tr>
    <tr><td>この端末（運営）</td><td><b style="color:var(--washi)">${this.statusText()}</b></td></tr>
    <tr><td>参加者のスマホ</td><td><b style="color:${pub === 'Google地図' ? 'var(--ok)' : 'var(--washi-dim)'}">${pub}</b>${
      pub === 'OpenStreetMap' && cur.mode === 'gmap' && !cfgKeySet
        ? '<br><span style="font-size:11px;color:var(--washi-dim)">（キーが端末内のみのため。全員Googleにするには下の②で固定）</span>' : ''
    }</td></tr>
  </table>

  <label>この端末で使う地図${this.locked ? '（🔒 本番固定中：切替は無効）' : ''}</label>
  <div class="bar">
    <button class="btn ${cur.mode === 'osm'  ? 'on' : ''}" id="rv-m-osm"  ${this.locked ? 'disabled' : ''}>OpenStreetMap（キー不要）</button>
    <button class="btn ${cur.mode === 'gmap' ? 'on' : ''}" id="rv-m-gmap" ${this.locked ? 'disabled' : ''}>Google地図</button>
    <span class="chip">現在の出所：${cur.src}</span>
  </div>

  <label style="margin-top:14px">Google Maps APIキー</label>
  <p style="margin:0 0 6px">現在：<b style="color:var(--washi)">${mask(k.key)}</b>　出所：${k.src}</p>
  <input id="rv-gkey" type="password" autocomplete="off" placeholder="AIza…（1度入れれば以後は不要）">
  <div class="bar" style="margin-top:8px">
    <button class="btn go" id="rv-gsave">キーを保存して再読込</button>
    <button class="btn" id="rv-gclear">この端末のキーを消す</button>
  </div>

  <h3 style="margin-top:20px">🔒 本番用に固定する</h3>
  <p>決まったら下のどちらかを押し、出力を <code>rv_config.js</code> の該当行に貼ってコミットしてください。
     以後は全端末（運営含む）がその設定で固定され、切替ボタンは無効になります。</p>
  <div class="bar">
    <button class="btn" id="rv-fix-osm">全員 OSM で固定</button>
    <button class="btn" id="rv-fix-gmap">全員 Google地図 で固定</button>
  </div>
  <div id="rv-fixout"></div>
</div>`;

      const $ = s => el.querySelector(s);

      if (!this.locked) {
        $('#rv-m-osm').onclick  = () => { ls.set(LS_MODE, 'osm');  location.reload(); };
        $('#rv-m-gmap').onclick = () => { ls.set(LS_MODE, 'gmap'); location.reload(); };
      }
      $('#rv-gsave').onclick = () => {
        const v = $('#rv-gkey').value.trim();
        if (!v) return alert('キーを入力してください');
        ls.set(LS_KEY, v);
        ls.set(LS_MODE, 'gmap');   // キーを入れたらGoogle地図に切り替える
        location.reload();
      };
      $('#rv-gclear').onclick = () => {
        if (confirm('この端末に保存したキーを削除します。地図は OpenStreetMap に戻ります。')) {
          ls.del(LS_KEY); ls.set(LS_MODE, 'osm'); location.reload();
        }
      };

      const emit = (snippet, warn) => {
        $('#rv-fixout').innerHTML =
          (warn ? '<p style="color:var(--ng);margin:10px 0 4px">' + warn + '</p>' : '')
          + '<textarea id="rv-snip" readonly style="margin-top:8px">' + snippet + '</textarea>'
          + '<div class="bar" style="margin-top:6px"><button class="btn" id="rv-copy">コピー</button>'
          + '<span class="chip">rv_config.js の該当3行を、これで置き換える</span></div>';
        $('#rv-copy').onclick = () => {
          const t = $('#rv-snip'); t.select();
          navigator.clipboard ? navigator.clipboard.writeText(t.value).then(() => alert('コピーしました'))
                              : document.execCommand('copy');
        };
      };

      $('#rv-fix-osm').onclick = () => emit(
        "  MAP_MODE: 'osm',\n  GMAP_KEY: '',\n  LOCK_MAP: true,");

      $('#rv-fix-gmap').onclick = () => {
        const key = resolveKey().key;
        if (!key) return alert('先にAPIキーを保存してください');
        emit("  MAP_MODE: 'gmap',\n  GMAP_KEY: '" + key + "',\n  LOCK_MAP: true,",
          '⚠ この設定はキーを rv_config.js に書き込みます＝<b>GitHub上で公開されます</b>。'
          + '参加者全員にGoogle地図を見せるには、これしか方法がありません。<br>'
          + '<b>コミット前に必ず</b> Google Cloud で次の4点を設定してください：<br>'
          + '① リファラー制限 <code>https://art-crea.github.io/*</code>　'
          + '② API制限：Maps JavaScript API のみ　'
          + '③ <b>1日あたりの割当上限（例：500）</b>　'
          + '④ 予算とアラート<br>'
          + '①②でキーの悪用を防ぎ、③で課金を物理的に止めます。'
          + '（割当を超えてもこのページは自動でOpenStreetMapに切り替わるため、当日の試合は止まりません）');
      };
    }
  };

  window.RVMap = RVMap;
})();
