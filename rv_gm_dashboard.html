<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GM本陣 — 別府國盗リ合戦</title>
<link rel="stylesheet" href="./rv_style.css">
</head>
<body>
<header>
  <div class="brand">
    <h1>🎛️ GM<span class="shu">本</span><span class="ai">陣</span></h1>
    <span class="sub">運営専用 ｜ ルール・承認・武将割当</span>
    <a class="home" href="./rv_kunitori_board25.html">合戦盤へ →</a>
  </div>
  <nav role="tablist">
    <button role="tab" aria-selected="true"  data-tab="ops">開戦・ルール</button>
    <button role="tab" aria-selected="false" data-tab="claims">承認キュー <span id="qBadge"></span></button>
    <button role="tab" aria-selected="false" data-tab="cast">武将割当（36名）</button>
    <button role="tab" aria-selected="false" data-tab="board">盤・ログ</button>
  </nav>
</header>

<main>
<!-- ===== 開戦・ルール ===== -->
<section class="panel" id="tab-ops">
  <div class="box">
    <h3>1. 同期バックエンド</h3>
    <p>GM1台で回すなら「ローカル」。36人モードは GAS か Firebase を選択。</p>
    <label>方式</label>
    <select id="backend">
      <option value="local">ローカル（GM1台・オフライン可・参加者アプリは使えません）</option>
      <option value="gas">Googleスプレッドシート＋Apps Script（遅延3秒・運営が中身を直接見れる）</option>
      <option value="firebase">Firebase Realtime Database（即時同期）</option>
    </select>
    <label>合戦ルームID</label>
    <input type="text" id="room" value="RV827">
    <div id="gasBox" hidden>
      <label>Apps Script ウェブアプリURL（/exec）</label>
      <input type="url" id="gasUrl" placeholder="https://script.google.com/macros/s/××××/exec">
    </div>
    <div id="fbBox" hidden>
      <label>firebaseConfig（JSON）</label>
      <textarea id="fbCfg" placeholder='{"apiKey":"...","databaseURL":"https://xxx.firebasedatabase.app","projectId":"..."}'></textarea>
    </div>
    <div class="bar" style="margin-top:10px">
      <button class="btn go" id="connBtn">接続</button>
      <span class="chip off" id="connChip">未接続</span>
    </div>
  </div>

  <div class="box">
    <h3>2. 合戦ルール</h3>
    <label>手番方式</label>
    <select id="turnMode">
      <option value="alternate">交互手番 — GM1台向け（本家アタック25）</option>
      <option value="free">早取り制 — 36人モード向け（手番なし・着いた者勝ち）</option>
    </select>
    <label>占領の判定</label>
    <select id="judge">
      <option value="gps">① GPS圏内に入れば即占領（速い／不正の余地あり）</option>
      <option value="gps_quiz">② GPS圏内＋ヒント回答 → GM承認（推奨）</option>
      <option value="photo">③ 現地写真＋GM承認（最も厳格／GM負荷大）</option>
    </select>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><label>GPS判定半径（m）</label><input type="number" id="radius" value="80" min="20" max="500"></div>
      <div><label>再占領クールダウン（秒）</label><input type="number" id="cooldown" value="180" min="0" max="1800"></div>
    </div>
    <div class="bar" style="margin-top:12px">
      <button class="btn go" id="saveRule">ルールを保存</button>
      <button class="btn" id="openBtn">⚔ 開戦（申請受付を開く）</button>
      <button class="btn" id="closeBtn">■ 停戦（受付を閉じる）</button>
      <span class="chip" id="openChip">受付：停止中</span>
    </div>
  </div>

  <div class="box">
    <h3>3. 参加者への配布</h3>
    <p>下のURLをQRにして武将カードに印刷。開くと自動で同じルームに接続します。</p>
    <div class="bar"><button class="btn" id="joinBtn">参戦リンクを作る</button>
      <button class="btn" id="pinBtn">暗証番号を再発行</button>
      <button class="btn" id="castCsv">武将カード用CSVを書出</button></div>
    <input type="text" id="joinUrl" readonly style="margin-top:8px">
  </div>

  <div class="box">
    <h3>危険な操作</h3>
    <div class="bar">
      <button class="btn" id="resetBtn" style="border-color:var(--ng);color:var(--ng)">全初期化（盤・ログ・申請）</button>
      <button class="btn" id="clearClaims">申請キューだけ消す</button>
    </div>
  </div>
</section>

<!-- ===== 承認キュー ===== -->
<section class="panel" id="tab-claims" hidden>
  <div class="bar">
    <span class="chip" id="qChip">保留 0件</span>
    <button class="btn" id="allOk">圏内の申請をまとめて承認</button>
  </div>
  <div id="claims"></div>
</section>

<!-- ===== 武将割当 ===== -->
<section class="panel" id="tab-cast" hidden>
  <div class="bar"><span class="chip">担当者名を入れると武将画面のログイン一覧に出ます</span></div>
  <div class="tbl-wrap">
    <table><thead><tr><th>No</th><th>肖像</th><th>軍</th><th>武将</th><th>兜（前立）</th><th>家紋</th><th>担当者</th><th>暗証</th></tr></thead>
    <tbody id="castBody"></tbody></table>
  </div>
</section>

<!-- ===== 盤・ログ ===== -->
<section class="panel" id="tab-board" hidden>
  <div class="score">
    <div class="side r" id="sc-r"><span class="nm">赤軍・朱雀</span><span class="n" id="n-r">0</span></div>
    <div class="side b" id="sc-b"><span class="nm">青軍・蒼海</span><span class="n" id="n-b">0</span></div>
  </div>
  <div class="bar">
    <button class="btn red" id="t-r">手番：赤</button>
    <button class="btn blue" id="t-b">手番：青</button>
    <span class="chip">パネルをクリックで手動占領（GM権限）</span>
  </div>
  <div style="max-width:520px"><div class="board" id="board"></div></div>
  <div class="box" style="margin-top:14px"><h3>戦況ログ</h3><div id="log"></div></div>
</section>
</main>

<footer>RV CAMP — GM本陣 ｜ 別府國盗リ合戦</footer>

<script src="./rv_data.js"></script>
<script src="./rv_sync.js"></script>
<script>
const $=id=>document.getElementById(id);
document.querySelectorAll('nav button').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('nav button').forEach(b=>b.setAttribute('aria-selected',b===btn));
  ['ops','claims','cast','board'].forEach(t=>$('tab-'+t).hidden=(t!==btn.dataset.tab));
});

/* ── 接続 ── */
$('backend').onchange=e=>{ $('gasBox').hidden=e.target.value!=='gas'; $('fbBox').hidden=e.target.value!=='firebase'; };
function connCfg(){
  const backend=$('backend').value;
  const o={backend, room:$('room').value.trim()||'RV827'};
  if(backend==='gas') o.gasUrl=$('gasUrl').value.trim();
  if(backend==='firebase'){ try{ o.firebase=JSON.parse($('fbCfg').value); }catch(e){ alert('firebaseConfig のJSONが不正です'); throw e; } }
  return o;
}
$('connBtn').onclick=async()=>{
  const o=connCfg();
  localStorage.setItem('rv-conn',JSON.stringify(o));
  try{ await Sync.init(o); alert('接続しました'); }
  catch(e){ alert('接続失敗：'+e.message); }
};
$('joinBtn').onclick=()=>{
  const o={backend:$('backend').value, room:$('room').value.trim(), gasUrl:$('gasUrl').value.trim(), firebase:$('fbCfg').value.trim()};
  const token=btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  $('joinUrl').value=location.href.replace(/[^/]*$/,'')+'rv_player_app.html#j='+token;
  $('joinUrl').select();
};

/* ── ルール ── */
$('saveRule').onclick=()=>Sync.commit(s=>{
  s.cfg.turnMode=$('turnMode').value;
  s.cfg.judge=$('judge').value;
  s.cfg.radius=+$('radius').value||80;
  s.cfg.cooldown=+$('cooldown').value||0;
  Sync.log(s,'⚙ ルール変更：'+(s.cfg.turnMode==='alternate'?'交互手番':'早取り制')
    +' ／ 判定'+({gps:'GPSのみ',gps_quiz:'GPS＋回答',photo:'写真'}[s.cfg.judge])
    +' ／ '+s.cfg.radius+'m ／ CD'+s.cfg.cooldown+'秒');
});
$('openBtn').onclick=()=>Sync.commit(s=>{ s.cfg.open=true;  Sync.log(s,'⚔ 開戦。申請受付を開きました'); });
$('closeBtn').onclick=()=>Sync.commit(s=>{ s.cfg.open=false; Sync.log(s,'■ 停戦。申請受付を閉じました'); });
$('resetBtn').onclick=()=>{ if(confirm('盤・ログ・申請・武将割当をすべて初期化します。よろしいですか？')) Sync.reset(); };
$('clearClaims').onclick=()=>Sync.commit(s=>{ s.claims=[]; });
$('pinBtn').onclick=()=>Sync.commit(s=>{
  s.busho.forEach(b=>b.pin=String(Math.floor(1000+Math.random()*9000)));
  Sync.log(s,'🔑 暗証番号を再発行しました');
});
$('castCsv').onclick=()=>{
  const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const s=Sync.state;
  const join=$('joinUrl').value||'';
  const rows=s.busho.map((b,i)=>[i+1,b.a==='r'?'赤軍':'青軍',q(b.name),q(b.kbn),q(b.kmn),q(b.player),b.pin,q(join)].join(','));
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob(['\ufeffNo,軍,武将,兜(前立),家紋,担当者,暗証番号,参戦URL\n'+rows.join('\n')],{type:'text/csv;charset=utf-8'}));
  a.download='busho36_cards.csv'; a.click();
};

/* ── 承認キュー ── */
function dist(s,c){ const cp=s.cps[c.cell]; return cp?haversine(c.lat,c.lng,cp.lat,cp.lng):9999; }
function renderClaims(s){
  const pend=(s.claims||[]).filter(c=>c.status==='pending');
  $('qChip').textContent='保留 '+pend.length+'件';
  $('qBadge').textContent=pend.length?'('+pend.length+')':'';
  if(!pend.length){ $('claims').innerHTML='<p class="side-note">保留中の申請はありません。</p>'; return; }
  $('claims').innerHTML=pend.map(c=>{
    const d=dist(s,c), inR=d<=(s.cfg.radius||80);
    const cp=s.cps[c.cell]||{name:'?'};
    const b=s.busho[c.bi]||{name:'?'};
    return '<div class="claim '+c.army+'">'
      +'<div class="hd"><span class="who">'+esc(b.name)+(b.player?'（'+esc(b.player)+'）':'')+'</span>'
      +'<span class="dt">'+new Date(c.ts).toLocaleTimeString('ja-JP')+'</span></div>'
      +'<div style="font-size:12px;margin-top:2px">陣所 '+(c.cell+1)+'：'+esc(cp.name)
      +' ／ 距離 <b class="'+(inR?'near':'far')+'">'+d+'m</b>'+(inR?' ✅圏内':' ⚠圏外')+'</div>'
      +(c.answer?'<div class="ans">回答：'+esc(c.answer)+'</div>':'')
      +(c.photo?'<img src="'+c.photo+'" alt="現地写真">':'')
      +'<div class="acts"><button class="mini-btn ok" data-ok="'+c.id+'">承認して占領</button>'
      +'<button class="mini-btn ng" data-ng="'+c.id+'">却下</button>'
      +'<a class="mini-btn" href="https://www.google.com/maps/search/?api=1&query='+c.lat+','+c.lng+'" target="_blank" rel="noopener">申請地点を地図で</a></div></div>';
  }).join('');
  $('claims').querySelectorAll('[data-ok]').forEach(b=>b.onclick=()=>approve(b.dataset.ok,true));
  $('claims').querySelectorAll('[data-ng]').forEach(b=>b.onclick=()=>approve(b.dataset.ng,false));
}
async function approve(id, ok){
  await Sync.commit(s=>{
    const c=(s.claims||[]).find(x=>String(x.id)===String(id));
    if(!c||c.status!=='pending') return;
    c.status = ok?'ok':'ng';
    c.photo = null; // 承認後は写真を破棄（同期データを軽く保つ）
    const b=s.busho[c.bi]||{name:'?'};
    if(ok) Sync.applyClaim(s, c.cell, c.army, b.name+(b.player?'／'+b.player:''));
    else Sync.log(s,'✖ 却下：'+b.name+' の 陣所'+(c.cell+1)+' 申請');
    s.claims = s.claims.filter(x=>x.status==='pending');
  });
}
$('allOk').onclick=async()=>{
  const s=Sync.state;
  const ids=(s.claims||[]).filter(c=>c.status==='pending' && dist(s,c)<=(s.cfg.radius||80)).map(c=>c.id);
  for(const id of ids) await approve(id,true);
};

/* ── 武将割当 ── */
function renderCast(s){
  $('castBody').innerHTML=s.busho.map((b,i)=>'<tr>'
    +'<td class="n">'+(i+1)+'</td>'
    +'<td>'+(b.img?'<img class="thumb" src="./'+b.img+'" alt="" loading="lazy">':'')+'</td>'
    +'<td style="color:'+(b.a==='r'?'#e04a5f':'#4a90d9')+'">'+(b.a==='r'?'赤':'青')+'</td>'
    +'<td>'+esc(b.name)+'</td><td>'+esc(b.kbn)+'</td><td>'+esc(b.kmn)+'</td>'
    +'<td><input value="'+esc(b.player)+'" data-i="'+i+'" data-k="player" placeholder="担当者名"></td>'
    +'<td><input value="'+esc(b.pin)+'" data-i="'+i+'" data-k="pin" style="width:52px"></td></tr>').join('');
  $('castBody').querySelectorAll('input').forEach(inp=>inp.onchange=()=>
    Sync.commit(st=>{ st.busho[+inp.dataset.i][inp.dataset.k]=inp.value.trim(); }));
}

/* ── 盤 ── */
function renderBoard(s){
  $('board').innerHTML=Array.from({length:25},(_,i)=>{
    const cp=s.cps[i]||{name:'—'};
    const own=s.owner[i]==='r'?'red':s.owner[i]==='b'?'blue':'';
    const lock=(s.lockUntil&&s.lockUntil[i]>Date.now())?' lock':'';
    return '<div class="cell '+own+lock+'" data-i="'+i+'"><span class="no">'+(i+1)+'</span>'
      +'<span class="ic">'+svgKamon(PANEL_KAMON[i])+'</span><span class="nm">'+esc(cp.name)+'</span></div>';
  }).join('');
  $('board').querySelectorAll('.cell').forEach(el=>el.onclick=async()=>{
    const i=+el.dataset.i, st=Sync.state;
    const team = st.cfg.turnMode==='alternate' ? st.turn : (prompt('r＝赤 ／ b＝青','r')||'').trim();
    if(team!=='r'&&team!=='b') return;
    await Sync.commit(x=>Sync.applyClaim(x,i,team,'GM手動'));
  });
  const sc=Sync.score(s);
  $('n-r').textContent=sc.r; $('n-b').textContent=sc.b;
  $('sc-r').classList.toggle('turn',s.turn==='r');
  $('sc-b').classList.toggle('turn',s.turn==='b');
  $('log').innerHTML=(s.log||[]).slice(0,40).map(l=>'<div class="logline">'
    +new Date(l.ts).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})+' <b>'+esc(l.t)+'</b></div>').join('');
}
$('t-r').onclick=()=>Sync.commit(s=>{s.turn='r';});
$('t-b').onclick=()=>Sync.commit(s=>{s.turn='b';});

/* ── 全体描画 ── */
function renderAll(s){
  $('turnMode').value=s.cfg.turnMode; $('judge').value=s.cfg.judge;
  $('radius').value=s.cfg.radius; $('cooldown').value=s.cfg.cooldown;
  $('openChip').textContent = s.cfg.open ? '受付：開戦中 ⚔' : '受付：停止中';
  $('openChip').className = 'chip ' + (s.cfg.open?'live':'off');
  const be=Sync.cfg.backend;
  $('connChip').textContent = be==='local'?'ローカル（GM1台）':(be==='gas'?'LIVE：スプレッドシート':'LIVE：Firebase')+' ／ '+s.room;
  $('connChip').className='chip '+(be==='local'?'off':'live');
  renderClaims(s); renderCast(s); renderBoard(s);
}
(async()=>{
  let saved=null; try{ saved=JSON.parse(localStorage.getItem('rv-conn')); }catch(e){}
  try{ await Sync.init(saved||{backend:'local',room:'RV827'}); }
  catch(e){ await Sync.init({backend:'local',room:'RV827'}); }
  if(saved){ $('backend').value=saved.backend; $('backend').onchange({target:$('backend')});
             if(saved.gasUrl) $('gasUrl').value=saved.gasUrl;
             if(saved.firebase) $('fbCfg').value=JSON.stringify(saved.firebase);
             $('room').value=saved.room||'RV827'; }
  Sync.subscribe(renderAll);
})();
</script>
</body>
</html>
