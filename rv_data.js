/* =========================================================
   rv_data.js — 別府國盗リ合戦 チェックポイント 単一の正
   ---------------------------------------------------------
   すべての画面(盤・武将画面・絵図・GM)はここからだけ地点を読む。
   優先順位: ①絵図で編集した内容(localStorage) → ②rv_checkpoints.json
             → ③このファイル内の埋め込み(オフライン/file://用)
   ========================================================= */
(function(global){
  const LS = 'rv_cp25_v2';           // 絵図(rv_kunitori_map25.html)の保存キー
  const EMBED = {
 "version": "2026-07-13",
 "event": "別府國盗リ合戦",
 "checkpoints": [
  {
   "no": 1,
   "id": "cp01",
   "name": "十文字原",
   "spot": "十文字原展望台",
   "lat": 33.3297195,
   "lng": 131.4602103,
   "radius": 120,
   "pt": 80,
   "status": "ok",
   "sensor": "GPS+写真",
   "hint": "日本夜景遺産。別府湾と国東半島を一望",
   "mission": "展望台から別府湾を望む一枚を提出",
   "memo": "駐車8台程度。道が狭い",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 2,
   "id": "cp02",
   "name": "柴石",
   "spot": "柴石温泉(市営)",
   "lat": 33.3257541,
   "lng": 131.4730186,
   "radius": 80,
   "pt": 70,
   "status": "ok",
   "sensor": "NFC",
   "hint": "渓谷沿いの湯。醍醐天皇の伝承が残る",
   "mission": "渓谷沿いの湯屋の外観を一枚",
   "memo": "水曜休",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 3,
   "id": "cp03",
   "name": "血の池地獄",
   "spot": "血の池地獄",
   "lat": 33.3271734,
   "lng": 131.4781731,
   "radius": 120,
   "pt": 120,
   "status": "ok",
   "sensor": "GPS+写真AI",
   "hint": "日本最古の赤い熱泥地獄",
   "mission": "赤い熱泥と湯けむりを収めた一枚",
   "memo": "",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 4,
   "id": "cp04",
   "name": "龍巻地獄",
   "spot": "龍巻地獄",
   "lat": 33.3271408,
   "lng": 131.4794006,
   "radius": 100,
   "pt": 90,
   "status": "ok",
   "sensor": "GPS+写真AI",
   "hint": "30〜40分に一度の間欠泉。噴出待ちも作戦のうち",
   "mission": "間欠泉の噴出を動画または写真で",
   "memo": "",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 5,
   "id": "cp05",
   "name": "亀川",
   "spot": "ドローンサッカーアリーナ大分",
   "lat": 33.331379,
   "lng": 131.4902243,
   "radius": 120,
   "pt": 110,
   "status": "ok",
   "sensor": "GPS",
   "hint": "北の玄関口・亀川の確定地点",
   "mission": "アリーナ前で隊員全員の集合写真",
   "memo": "Slack確定地",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 6,
   "id": "cp06",
   "name": "明礬",
   "spot": "明礬 湯の里(湯の花小屋)",
   "lat": 33.3200867,
   "lng": 131.4527838,
   "radius": 120,
   "pt": 100,
   "status": "ok",
   "sensor": "音響",
   "hint": "藁葺きの湯の花小屋が並ぶ山手の湯里",
   "mission": "藁葺きの湯の花小屋を背景に一枚",
   "memo": "",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 7,
   "id": "cp07",
   "name": "上人ヶ浜",
   "spot": "上人ヶ浜公園",
   "lat": 33.3225,
   "lng": 131.4966,
   "radius": 80,
   "pt": 50,
   "status": "cand",
   "sensor": "GPS",
   "hint": "一遍上人が上陸したと伝わる浜",
   "mission": "浜辺で軍旗を掲げた一枚",
   "memo": "座標は概算。現地で要確認",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 8,
   "id": "cp08",
   "name": "かまど地獄",
   "spot": "かまど地獄",
   "lat": 33.3163879,
   "lng": 131.4723906,
   "radius": 80,
   "pt": 100,
   "status": "ok",
   "sensor": "GPS+写真AI",
   "hint": "一丁目から六丁目まで続く地獄",
   "mission": "六丁目までの地獄を一枚に",
   "memo": "",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 9,
   "id": "cp09",
   "name": "鉄輪むし湯",
   "spot": "鉄輪むし湯",
   "lat": 33.3163444,
   "lng": 131.4780083,
   "radius": 80,
   "pt": 80,
   "status": "ok",
   "sensor": "NFC",
   "hint": "石菖を敷いた蒸し風呂。鎌倉期の一遍上人が開いたと伝わる",
   "mission": "むし湯の外観と隊名を記した札",
   "memo": "",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 10,
   "id": "cp10",
   "name": "湯けむり",
   "spot": "湯けむり展望台",
   "lat": 33.3156683,
   "lng": 131.4853258,
   "radius": 100,
   "pt": 70,
   "status": "ok",
   "sensor": "GPS+写真",
   "hint": "鉄輪の湯けむりと鶴見岳。24時間・無料",
   "mission": "湯けむりと鶴見岳を同じ画角で",
   "memo": "夜景も可",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 11,
   "id": "cp11",
   "name": "永福寺",
   "spot": "永福寺(一遍上人ゆかり)",
   "lat": 33.316057,
   "lng": 131.4771659,
   "radius": 80,
   "pt": 100,
   "status": "ok",
   "sensor": "GPS+写真",
   "hint": "一遍上人ゆかりの寺。参拝ボーナス+40pt",
   "mission": "山門で参拝の一枚(参拝ボーナス+40pt)",
   "memo": "採否を委員会で確認",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 12,
   "id": "cp12",
   "name": "地獄蒸し",
   "spot": "地獄蒸し工房 鉄輪",
   "lat": 33.3154852,
   "lng": 131.4762201,
   "radius": 120,
   "pt": 100,
   "status": "ok",
   "sensor": "GPS+写真AI",
   "hint": "噴気で蒸す鉄輪名物。行列必至、時間読みが勝負",
   "mission": "蒸し上がった食材を掲げて一枚",
   "memo": "待ち15分〜",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 13,
   "id": "cp13",
   "name": "鉄輪",
   "spot": "縁間(えんま)",
   "lat": 33.3147301,
   "lng": 131.4773158,
   "radius": 80,
   "pt": 110,
   "status": "ok",
   "sensor": "NFC",
   "hint": "【天下の要】鉄輪の湯けむり通り。制圧軍に要害ボーナス",
   "mission": "縁間の看板と隊員全員【天下の要】",
   "memo": "Slack確定地・盤の中心",
   "kaname": true,
   "flag": ""
  },
  {
   "no": 14,
   "id": "cp14",
   "name": "海地獄",
   "spot": "地獄温泉ミュージアム",
   "lat": 33.3156603,
   "lng": 131.4740591,
   "radius": 120,
   "pt": 120,
   "status": "ok",
   "sensor": "ビーコン",
   "hint": "コバルトブルーの海地獄に隣接する確定地点",
   "mission": "コバルトブルーの海地獄を一枚",
   "memo": "Slack確定地",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 15,
   "id": "cp15",
   "name": "白池地獄",
   "spot": "白池地獄",
   "lat": 33.3152711,
   "lng": 131.4741269,
   "radius": 80,
   "pt": 90,
   "status": "ok",
   "sensor": "GPS+写真AI",
   "hint": "冷えると青白く濁る国指定名勝",
   "mission": "白濁した池を一枚",
   "memo": "",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 16,
   "id": "cp16",
   "name": "坊主地獄",
   "spot": "鬼石坊主地獄",
   "lat": 33.3152885,
   "lng": 131.4696131,
   "radius": 80,
   "pt": 90,
   "status": "ok",
   "sensor": "GPS+写真AI",
   "hint": "灰色の熱泥が坊主頭のように沸く",
   "mission": "坊主頭の熱泥を接写で一枚",
   "memo": "",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 17,
   "id": "cp17",
   "name": "実相寺",
   "spot": "胡月(別府冷麺)",
   "lat": 33.302379,
   "lng": 131.499291,
   "radius": 80,
   "pt": 80,
   "status": "ok",
   "sensor": "GPS+写真",
   "hint": "別府名物・冷麺の確定地点",
   "mission": "冷麺の器を掲げて一枚",
   "memo": "Slack確定地",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 18,
   "id": "cp18",
   "name": "堀田",
   "spot": "堀田温泉(市営)",
   "lat": 33.2902,
   "lng": 131.456,
   "radius": 80,
   "pt": 70,
   "status": "cand",
   "sensor": "NFC",
   "hint": "山手の関門にあたる市営温泉",
   "mission": "市営温泉の入口で一枚",
   "memo": "座標は概算。要確認",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 19,
   "id": "cp19",
   "name": "別府公園",
   "spot": "別府公園",
   "lat": 33.2853,
   "lng": 131.4884,
   "radius": 200,
   "pt": 50,
   "status": "cand",
   "sensor": "GPS",
   "hint": "市中央の大緑地。黒松700本",
   "mission": "黒松並木を背景に一枚",
   "memo": "座標は概算",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 20,
   "id": "cp20",
   "name": "観海寺",
   "spot": "グローバルタワー(ビーコンプラザ)",
   "lat": 33.2831944,
   "lng": 131.4861111,
   "radius": 120,
   "pt": 90,
   "status": "ok",
   "sensor": "GPS+写真",
   "hint": "高さ100mの展望デッキ。別府湾を見下ろす",
   "mission": "展望デッキから市街を見下ろす一枚",
   "memo": "観海寺エリアの代表として設定",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 21,
   "id": "cp21",
   "name": "北浜",
   "spot": "別府タワー",
   "lat": 33.2817713,
   "lng": 131.5059174,
   "radius": 80,
   "pt": 60,
   "status": "ok",
   "sensor": "GPS",
   "hint": "1957年建設・海辺のランドマーク",
   "mission": "タワーを見上げる構図で一枚",
   "memo": "",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 22,
   "id": "cp22",
   "name": "鶴見岳",
   "spot": "別府ロープウェイ(鶴見岳)",
   "lat": 33.2779012,
   "lng": 131.4487593,
   "radius": 300,
   "pt": 200,
   "status": "ok",
   "sensor": "GPS+写真",
   "hint": "標高1,375m。最高難度・最高報酬。運行時間に注意",
   "mission": "山頂(または山麓駅)で軍旗を掲げよ",
   "memo": "9:00-17:00",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 23,
   "id": "cp23",
   "name": "ラクテンチ",
   "spot": "別府ラクテンチ",
   "lat": 33.274941,
   "lng": 131.4855361,
   "radius": 200,
   "pt": 80,
   "status": "ok",
   "sensor": "GPS",
   "hint": "ケーブルカーで上る昭和の遊園地",
   "mission": "ケーブルカーと隊員を同じ画角で",
   "memo": "火・水休のことあり",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 24,
   "id": "cp24",
   "name": "竹瓦",
   "spot": "竹瓦温泉",
   "lat": 33.2774556,
   "lng": 131.5059894,
   "radius": 80,
   "pt": 80,
   "status": "ok",
   "sensor": "NFC",
   "hint": "明治12年創業・砂湯の殿堂",
   "mission": "竹瓦の唐破風を背景に一枚",
   "memo": "水曜休",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 25,
   "id": "cp25",
   "name": "浜脇",
   "spot": "八幡朝見神社",
   "lat": 33.2716217,
   "lng": 131.4951489,
   "radius": 80,
   "pt": 70,
   "status": "ok",
   "sensor": "GPS+写真",
   "hint": "別府の総鎮守。勝利祈願の写真ミッション",
   "mission": "社殿の前で勝利祈願の一枚",
   "memo": "",
   "kaname": false,
   "flag": ""
  },
  {
   "no": 26,
   "id": "cp26",
   "name": "【盤外】遠国",
   "spot": "羯諦寺(日出町)",
   "lat": 33.3684862,
   "lng": 131.5034878,
   "radius": 150,
   "pt": 200,
   "status": "far",
   "sensor": "GPS+写真",
   "hint": "日出町への遠征。往復の時間コストと200ptを天秤に",
   "mission": "【遠征】山門で軍旗を掲げた一枚",
   "memo": "Slack記載「祇園寺」は誤記→羯諦寺が正",
   "kaname": false,
   "flag": ""
  }
 ]
};

  function fromLS(){
    try{
      const s = localStorage.getItem(LS);
      if(!s) return null;
      const a = JSON.parse(s);
      return Array.isArray(a) && a.length ? a : null;
    }catch(e){ return null; }
  }

  function normalize(list){
    return list.map((c,i)=>Object.assign({
      no:i+1, id:'cp'+String(i+1).padStart(2,'0'), radius:80,
      status:'cand', sensor:'GPS', hint:'', mission:'', memo:'', kaname:false, flag:''
    }, c));
  }

  /* 地点の読み込み(必ずこれを使う) */
  async function load(){
    const ls = fromLS();
    if(ls) return { source:'絵図(この端末の編集)', checkpoints: normalize(ls) };
    try{
      const r = await fetch('rv_checkpoints.json', {cache:'no-store'});
      if(r.ok){
        const j = await r.json();
        return { source:'rv_checkpoints.json', checkpoints: normalize(j.checkpoints||j) };
      }
    }catch(e){}
    return { source:'埋め込み(オフライン)', checkpoints: normalize(EMBED.checkpoints) };
  }

  /* 盤に出す25枚(遠国は除く) */
  const board = cps => cps.filter(c=>c.status!=='far').slice(0,25);

  /* 2点間の距離(m) — Haversine */
  function distance(lat1,lng1,lat2,lng2){
    const R=6371000, t=Math.PI/180;
    const a=Math.sin((lat2-lat1)*t/2)**2 +
            Math.cos(lat1*t)*Math.cos(lat2*t)*Math.sin((lng2-lng1)*t/2)**2;
    return Math.round(2*R*Math.asin(Math.sqrt(a)));
  }

  /* 半径の中にいるか(GPS判定・iOSのジオフェンスと同じ考え方) */
  function inside(cp, lat, lng){
    const d = distance(cp.lat, cp.lng, lat, lng);
    return { ok: d <= (cp.radius||80), meters: d };
  }

  /* 現在地から近い順 */
  function nearest(cps, lat, lng){
    return cps.map(c=>Object.assign({}, c, {meters: distance(c.lat,c.lng,lat,lng)}))
              .sort((a,b)=>a.meters-b.meters);
  }

  global.RV = { load, board, distance, inside, nearest, EMBED, LS_KEY: LS };
})(window);
