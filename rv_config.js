/* =====================================================================
   rv_config.js — 別府國盗リ合戦 設定  v2.2 / 2026-08-27 本番
   ---------------------------------------------------------------------
   ★ ここは「初期値」です。当日の変更は運営卓（rv_gm_panel.html）から
     ボタン1つで行えます。このファイルを開く必要はありません。
   ★ 運営卓で決めた設定は「書き出し」ボタンで文字列になります。
     それをこのファイルに貼れば、次回からその設定が初期値になります。
   ===================================================================== */
window.RV_CONFIG = {

  BUILD: 'v2.2 / 2026-08-27',

  /* ═══════════════════════════════════════════════════════════════
     1. 安全 ─ 他のすべてより優先されます
     ═══════════════════════════════════════════════════════════════
     この合戦は車で移動します。得点より安全が上位です。
     ここは運営卓からも「切れないように」してあります。            */
  SAFETY: {

    /* 走行中は画面を操作できなくする。
       時速 lockSpeedKmh を超えると全ボタンが無効になり、
       「走行中は操作できません」の一枚板が画面を覆います。
       ★これを false にしないでください（起動時に強制で戻します）  */
    drivingLock: true,
    lockSpeedKmh: 15,        // これを超えたら走行中とみなす
    unlockDelaySec: 5,       // 停止後、何秒で操作を戻すか

    /* 運転者は端末を持たない。隊長端末は助手席で扱う前提です。   */
    navigatorSeatOnly: true,

    /* 速度・到着の速さは一切得点にならない（設計上の宣言）       */
    speedNeverScores: true,

    /* 熱中症対策。8月末の別府は夕方でも30度前後です。            */
    hydrationReminderMin: 30,

    /* 単独行動の禁止。組の人数が下回ったら警告                   */
    minPartySize: 2,

    /* 駐車台数の少ない陣所は満車警告を出す                       */
    warnSmallParking: true,

    /* 緊急停止。true で全端末が判定を止め、集合指示だけを出す。
       運営卓の赤いボタンから切り替えます。                       */
    emergencyStop: false,
    emergencyMessage: '合戦を一時中断します。安全な場所に停車し、本陣の指示を待ってください。'
  },

  /* ═══════════════════════════════════════════════════════════════
     2. GPS ─ 誰の端末で測位するか
     ═══════════════════════════════════════════════════════════════ */
  GPS: {
    /* 'browser' … 端末標準GPS＋OpenStreetMap。課金なし ★本番既定
       'gmaps'   … Google Maps。精度は上だが従量課金             */
    provider: 'browser',
    GMAP_KEY: '',            // 空なら gmaps 指定でも browser に落ちます

    /* 'off' 誰も測位しない ／ 'admin' 運営1名のみ
       'leader' 各組の隊長のみ ★本番既定 ／ 'all' 全36名         */
    scope: 'leader',
    teams: 6,                // 6組＝隊長6台

    highAccuracy: true,
    timeout: 15000,
    maximumAge: 5000,
    minIntervalMs: 3000
  },

  /* ═══════════════════════════════════════════════════════════════
     3. 判定 ─ 全体の既定値
     ═══════════════════════════════════════════════════════════════
     陣所ごとの方式は rv_checkpoints.json の "mode" が優先されます。
     運営卓から一括変更・個別変更のどちらもできます。

       auto        圏内に dwellSec 秒とどまれば自動占領
       near        接近すると通知。ボタンを押して確定
       manual      GPSを使わず写真のみ（アーケード内など）
       photo       圏内＋写真の提出
       photo_group 圏内＋組の全員が写った写真（食事・着城）
       quiz        圏内＋クイズの正解
       gm          必ず運営が承認する
     ═══════════════════════════════════════════════════════════════ */
  JUDGE: {
    defaultMode: 'photo',    // 陣所に mode が無いときの既定
    override: null,          // 運営卓で一括変更するとここに入る（例 'gm'）

    dwellSec: 20,            // auto：圏内に何秒とどまれば確定か
    nearNoticeM: 80,         // near：何m手前で通知を出すか
    autoRepeat: false,

    /* 測位誤差の扱い
         距離＋誤差 ≦ 半径 → 圏内
         距離−誤差 ≦ 半径 → たぶん圏内（運営承認へ）
         誤差 > accuracyLimit → 判定不能                         */
    useAccuracy: true,
    accuracyLimit: 120,
    holdToGM: true,

    defaultRadius: 100,
    radiusScale: 1.0,        // 運営卓のスライダーで半径を一括調整
    cooldownSec: 300
  },

  /* ═══════════════════════════════════════════════════════════════
     4. 機能スイッチ
     ═══════════════════════════════════════════════════════════════ */
  FEATURES: {
    auto_checkin: true,
    near_notice: true,
    photo_mission: true,
    group_photo: true,       // 全員写真（食事・着城）
    quiz_mission: true,
    manual_checkin: true,
    ranking_team: true,
    ranking_individual: true,

    /* ── 以下は未実装。8/27では使いません ── */
    ar_battle: false,
    calorie_ai: false,
    points_wallet: false,
    driving_score: false,
    external_partners: false
  },

  /* ═══════════════════════════════════════════════════════════════
     5. 開催情報
     ═══════════════════════════════════════════════════════════════ */
  EVENT: {
    name: '別府國盗リ合戦',
    date: '2026-08-27',
    start: '13:30',          // 大分空港 出陣
    end: '17:30',            // グランヴェルデリゾート 着城
    mealFrom: '16:00',
    mealTo: '17:00',
    gateClose: '17:00',      // 地獄群 閉門
    goal: 'グランヴェルデリゾート',
    armyR: '堀江軍',
    armyB: '溝口軍'
  },

  MAP: {
    center: { lat: 33.370, lng: 131.570 },
    zoom: 10,
    lockToConfig: true,
    mymapUrl: ''
  },
  ADMIN_TOKEN: 'RV2026camp',
  COMPARE_VIEW: 'admin',

  SYNC: {
    backend: 'local',        // 'local' | 'gas' | 'php'
    room: 'RV827',
    endpoint: '',            // php のとき例: '/api/'
    pollSec: 10
  }
};

/* ─────────────────────────────────────────────────────────────────
   事故防止の自動補正。触らないでください。
   ───────────────────────────────────────────────────────────────── */
(function (C) {
  if (C.GPS.provider === 'gmaps' && !C.GPS.GMAP_KEY) {
    console.warn('[RV] GMAP_KEY が空のため provider を browser に切り替えました');
    C.GPS.provider = 'browser';
  }
  if (['off', 'admin', 'leader', 'all'].indexOf(C.GPS.scope) < 0) {
    console.warn('[RV] GPS.scope が不正です。leader を使用します');
    C.GPS.scope = 'leader';
  }
  /* 安全機能は設定ミスで切れないよう、ここで強制的に戻します */
  if (C.SAFETY.drivingLock !== true) {
    console.warn('[RV] 走行中ロックは無効化できません。true に戻しました');
    C.SAFETY.drivingLock = true;
  }
  if (!(C.SAFETY.lockSpeedKmh > 0) || C.SAFETY.lockSpeedKmh > 30) {
    C.SAFETY.lockSpeedKmh = 15;
  }
  if (C.ADMIN_TOKEN === 'CHANGE-ME-BEFORE-PUBLISH') {
    console.warn('[RV] ADMIN_TOKEN が初期値のままです。公開前に変更してください');
  }
})(window.RV_CONFIG);
