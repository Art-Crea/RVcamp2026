/* =========================================================
   rv_sync.js — 別府國盗リ合戦 同期層
   3バックエンドを同一APIで切替：
     local     … GM1台モード。端末内のみ（ネット不要）
     gas       … Googleスプレッドシート + Apps Script（3秒ポーリング）
     firebase  … Firebase Realtime Database（即時）
   ---------------------------------------------------------
   使い方：
     await Sync.init({backend:'gas', gasUrl:'https://script.google.com/.../exec', room:'RV827'})
     Sync.subscribe(state => render(state))
     await Sync.commit(st => { st.owner[3]='r'; })   // 楽観ロック（rev）で自動リトライ
   ========================================================= */
const Sync = (() => {
  let cfg = { backend:'local', room:'RV827', gasUrl:'', firebase:null };
  let state = null;
  let subs = [];
  let fbRef = null;
  let poll = null;
  let pushing = false;

  /* ---------- 初期状態 ---------- */
  function freshState(){
    return {
      rev: 1,
      room: cfg.room,
      updated: Date.now(),
      cfg: {
        turnMode: 'alternate',   // 'alternate'(GM交互手番) | 'free'(36人早取り)
        judge:    'gps_quiz',    // 'gps' | 'gps_quiz' | 'photo'
        radius:   80,            // GPS圏内 m
        cooldown: 180,           // 同一陣所の再占領クールダウン 秒
        open:     false          // 参加者の申請受付
      },
      turn: 'r',
      owner: Array(25).fill(null),
      lockUntil: Array(25).fill(0),
      cps: JSON.parse(JSON.stringify(DEFAULT_CP)),
      busho: BUSHO.map((b,i)=>({ i, name:b.name, a:b.a, kb:b.kb, kbn:b.kbn, km:b.km, kmn:b.kmn,
                                 player:'', pin:String(1000+i*7%9000).padStart(4,'0') })),
      claims: [],   // {id, ts, bi, army, cell, dist, answer, photo, status}
      log: []       // {ts, t}
    };
  }

  /* ---------- ローカル保存（どのバックエンドでもキャッシュ） ---------- */
  const LS = 'rv-kunitori-' + (location.pathname.split('/').pop()||'x');
  function cache(s){ try{ localStorage.setItem(LS+':'+cfg.room, JSON.stringify(s)); }catch(e){} }
  function uncache(){ try{ const v=localStorage.getItem(LS+':'+cfg.room); return v?JSON.parse(v):null; }catch(e){ return null; } }

  function emit(){ subs.forEach(f=>{ try{ f(state); }catch(e){ console.error(e); } }); }

  /* ---------- GAS ---------- */
  async function gasGet(){
    const u = cfg.gasUrl + '?action=get&room=' + encodeURIComponent(cfg.room) + '&t=' + Date.now();
    const r = await fetch(u);
    const j = await r.json();
    return j.state || null;
  }
  async function gasPut(s){
    // Content-Type を text/plain にして CORS プリフライトを回避（fetch の文字列body既定）
    const r = await fetch(cfg.gasUrl, {
      method:'POST',
      body: JSON.stringify({ action:'set', room:cfg.room, rev:s.rev, state:s })
    });
    return r.json(); // {ok:true, state} | {ok:false, conflict:true, state}
  }

  /* ---------- Firebase ---------- */
  async function fbLoad(){
    if (window.firebase && firebase.apps && firebase.apps.length) return;
    await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js');
    firebase.initializeApp(cfg.firebase);
  }
  function loadScript(src){
    return new Promise((ok,ng)=>{ const s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=ng; document.head.appendChild(s); });
  }

  /* ---------- public ---------- */
  const api = {
    get cfg(){ return cfg; },
    get state(){ return state; },

    async init(o){
      cfg = Object.assign(cfg, o||{});
      state = uncache() || freshState();
      state.room = cfg.room;

      if (cfg.backend === 'firebase' && cfg.firebase){
        await fbLoad();
        fbRef = firebase.database().ref('rooms/' + cfg.room);
        const snap = await fbRef.get();
        if (snap.exists()) state = normalize(snap.val());
        else await fbRef.set(state);
        fbRef.on('value', s => {
          if (pushing) return;
          const v = s.val(); if(!v) return;
          state = normalize(v); cache(state); emit();
        });
      }
      else if (cfg.backend === 'gas' && cfg.gasUrl){
        const s = await gasGet();
        if (s) state = normalize(s); else await gasPut(state);
        poll = setInterval(async () => {
          if (pushing) return;
          try{
            const s = await gasGet();
            if (s && s.rev !== state.rev){ state = normalize(s); cache(state); emit(); }
          }catch(e){}
        }, 3000);
      }
      cache(state); emit();
      return state;
    },

    subscribe(f){ subs.push(f); if(state) f(state); return ()=>{ subs=subs.filter(x=>x!==f); }; },

    /* 楽観ロック付きコミット。mutate(state) を渡す */
    async commit(mutate){
      for (let attempt=0; attempt<4; attempt++){
        const draft = JSON.parse(JSON.stringify(state));
        mutate(draft);
        draft.rev = (state.rev||1) + 1;
        draft.updated = Date.now();

        if (cfg.backend === 'local'){
          state = draft; cache(state); emit(); return state;
        }
        pushing = true;
        try{
          if (cfg.backend === 'firebase'){
            const res = await fbRef.transaction(cur => {
              if (cur && cur.rev >= draft.rev) return; // abort → 再試行
              return draft;
            });
            if (res.committed){ state = normalize(res.snapshot.val()); cache(state); emit(); return state; }
            const snap = await fbRef.get(); state = normalize(snap.val());
          } else {
            const r = await gasPut(draft);
            if (r && r.ok){ state = normalize(r.state); cache(state); emit(); return state; }
            if (r && r.state) state = normalize(r.state);
          }
        } catch(e){ console.error('commit失敗', e); }
        finally { pushing = false; }
        await new Promise(r=>setTimeout(r, 150 + Math.random()*250));
      }
      throw new Error('同期に失敗しました（通信状況を確認してください）');
    },

    async reset(){ return api.commit(s => { const f=freshState(); Object.keys(f).forEach(k=>{ if(k!=='rev') s[k]=f[k]; }); }); },

    log(s, t){ s.log = s.log||[]; s.log.unshift({ts:Date.now(), t}); s.log = s.log.slice(0,120); },

    /* ---- ゲームルール（全アプリ共通） ---- */
    DIRS: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
    flipsFor(s, i, team){
      const r=Math.floor(i/5), c=i%5, out=[];
      for (const [dr,dc] of api.DIRS){
        const line=[]; let rr=r+dr, cc=c+dc;
        while (rr>=0&&rr<5&&cc>=0&&cc<5){
          const o = s.owner[rr*5+cc];
          if (o===null||o===undefined) break;
          if (o===team){ out.push(...line); break; }
          line.push(rr*5+cc); rr+=dr; cc+=dc;
        }
      }
      return out;
    },
    /* 占領を state に適用（承認済み前提）。戻り値：反転数 */
    applyClaim(s, i, team, who){
      const f = api.flipsFor(s, i, team);
      s.owner[i] = team;
      f.forEach(k => s.owner[k] = team);
      s.lockUntil = s.lockUntil || Array(25).fill(0);
      s.lockUntil[i] = Date.now() + (s.cfg.cooldown||180)*1000;
      if (s.cfg.turnMode === 'alternate') s.turn = (team === 'r' ? 'b' : 'r');
      const nm = (s.cps[i]&&s.cps[i].name)||('陣所'+(i+1));
      const flipTxt = f.length ? ('（' + f.length + '陣を反転）') : '';
      api.log(s, (team==='r'?'🔴赤':'🔵青') + ' が【' + nm + '】を占領' + flipTxt + (who ? ' — ' + who : ''));
      return f.length;
    },
    score(s){ return { r: s.owner.filter(v=>v==='r').length, b: s.owner.filter(v=>v==='b').length }; }
  };

  function normalize(s){
    if (!s) return freshState();
    const f = freshState();
    s.cfg   = Object.assign({}, f.cfg, s.cfg||{});
    s.owner = (s.owner && s.owner.length===25) ? s.owner.map(v=>v||null) : f.owner;
    s.lockUntil = (s.lockUntil && s.lockUntil.length===25) ? s.lockUntil : f.lockUntil;
    s.cps   = s.cps && s.cps.length ? s.cps : f.cps;
    s.busho = s.busho && s.busho.length ? s.busho : f.busho;
    s.claims= s.claims || [];
    s.log   = s.log || [];
    s.rev   = s.rev || 1;
    s.turn  = s.turn || 'r';
    return s;
  }

  return api;
})();
