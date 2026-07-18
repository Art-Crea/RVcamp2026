/* =====================================================================
   rv_geo.js — 測位・判定・自動チェックイン・安全装置  v2.2
   ---------------------------------------------------------------------
   役割は4つです。

     1. 測位の入口を1つにまとめる（browser / gmaps の差を吸収）
     2. 測位誤差を踏まえて「圏内・たぶん圏内・圏外」を判定する
     3. 陣所ごとの方式（自動／接近／写真／全員写真／クイズ／手動／承認）
        にしたがって占領を成立させる
     4. 走行中は操作を止める。緊急停止がかかれば全判定を止める

   ★ 安全に関わる部分（走行中ロック・緊急停止）は、運営卓からも
     「切る」ことができません。切れるのは判定方式だけです。

   読み込み順： rv_config.js → rv_data.js → rv_geo.js → 各画面
   ===================================================================== */
(function (global) {
  'use strict';

  var C = global.RV_CONFIG || {};
  var G = C.GPS || {}, J = C.JUDGE || {}, F = C.FEATURES || {},
      S = C.SAFETY || {}, E = C.EVENT || {};

  /* ── 距離（Haversine）。戻り値はメートル ───────────────────── */
  function haversine(lat1, lng1, lat2, lng2) {
    var R = 6371000, t = function (x) { return x * Math.PI / 180; };
    var dLat = t(lat2 - lat1), dLng = t(lng2 - lng1);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(t(lat1)) * Math.cos(t(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
  }

  function nowHM(d) {
    d = d || new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }
  function isOpen(cp, at) {
    if (!cp.open_from || !cp.open_to) return true;
    var t = at || nowHM();
    if (cp.open_to === '24:00') return t >= cp.open_from;
    return t >= cp.open_from && t <= cp.open_to;
  }

  /* ── その陣所の判定方式を決める ─────────────────────────────
     優先順位：運営卓の個別指定 ＞ 運営卓の一括指定 ＞ 陣所の既定 */
  function modeOf(cp) {
    var per = RVGeo.perCheckpointMode[cp.id];
    if (per) return per;
    if (J.override) return J.override;
    return cp.mode || J.defaultMode || 'photo';
  }

  /* ── 圏内判定（誤差を三段階で扱う）───────────────────────── */
  function judge(cp, pos) {
    var radius = Math.round((cp.radius || J.defaultRadius || 100) * (J.radiusScale || 1));

    if (!pos) {
      return { state: 'unknown', reason: '位置情報をまだ取得できていません',
               dist: null, acc: null, radius: radius };
    }
    var acc = Math.round(pos.acc == null ? 0 : pos.acc);
    var dist = haversine(pos.lat, pos.lng, cp.lat, cp.lng);

    if (J.useAccuracy !== false && acc > (J.accuracyLimit || 120)) {
      return { state: 'unknown',
               reason: '測位の誤差が大きすぎます（約' + acc + 'm）。空の見える場所へ',
               dist: dist, acc: acc, radius: radius };
    }
    var m = (J.useAccuracy === false) ? 0 : acc;

    if (dist + m <= radius)
      return { state: 'in', reason: '圏内（' + dist + 'm ／ 誤差' + acc + 'm）',
               dist: dist, acc: acc, radius: radius };
    if (dist - m <= radius)
      return { state: 'maybe',
               reason: '圏内の可能性あり（' + dist + 'm ／ 誤差' + acc + 'm）。判定を保留します',
               dist: dist, acc: acc, radius: radius };
    return { state: 'out', reason: 'あと約' + (dist - radius) + 'm（判定半径 ' + radius + 'm）',
             dist: dist, acc: acc, radius: radius };
  }

  /* ── 測位を担う端末かどうか ─────────────────────────────── */
  function shouldTrack(me) {
    me = me || {};
    switch (G.scope) {
      case 'off':    return false;
      case 'admin':  return !!me.isAdmin;
      case 'leader': return !!me.isLeader || !!me.isAdmin;
      case 'all':    return true;
      default:       return !!me.isLeader;
    }
  }
  function scopeLabel() {
    return { off: 'GPSを使わない運用',
             admin: '運営端末のみ測位',
             leader: '各組の隊長のみ測位（' + (G.teams || 6) + '組）',
             all: '参加者全員が測位' }[G.scope] || '';
  }

  /* ═══════════════════════════════════════════════════════════════ */
  var RVGeo = {
    pos: null,                 // {lat,lng,acc,at,speedKmh}
    prev: null,
    tracking: false,
    driving: false,            // 走行中ロックの状態
    me: {},
    cps: [],
    perCheckpointMode: {},     // 運営卓の個別指定 {cp01:'gm', ...}
    _watchId: null,
    _dwell: {},
    _taken: {},
    _noticed: {},
    _stoppedAt: 0,
    _lastRun: 0,
    _cb: {},
    _hydrationTimer: null,

    /* 初期化 ------------------------------------------------------ */
    init: function (opts) {
      opts = opts || {};
      this.me = opts.me || {};
      this.cps = opts.checkpoints || [];
      this._cb = opts;
      var s = opts.onStatus || function () {};

      if (S.emergencyStop) { s(S.emergencyMessage, 'stop'); return this; }

      if (!shouldTrack(this.me)) {
        s('この端末では測位しません（' + scopeLabel() + '）', 'info');
        this._emit();
        return this;
      }
      if (!navigator.geolocation) { s('この端末は位置情報に対応していません', 'error'); return this; }

      /* 助手席で扱う旨を毎回出す（安全上、消せない表示） */
      if (S.navigatorSeatOnly && this._cb.onSafety) {
        this._cb.onSafety('この端末は助手席で扱ってください。運転者は操作しないこと。', 'seat');
      }
      this._startHydration();
      this.start();
      return this;
    },

    start: function () {
      var self = this, s = this._cb.onStatus || function () {};
      if (this.tracking) return;
      this.tracking = true;
      s('測位を開始しました（' + scopeLabel() + '）', 'info');

      this._watchId = navigator.geolocation.watchPosition(function (p) {
        var np = { lat: p.coords.latitude, lng: p.coords.longitude,
                   acc: p.coords.accuracy, at: Date.now(), speedKmh: null };

        /* 速度。端末が返さない場合は前回位置から推定します。
           ここで求めた速度は「走行中かどうか」の判定にしか使いません。
           得点には一切influenceしません（SAFETY.speedNeverScores）。 */
        if (p.coords.speed != null && !isNaN(p.coords.speed)) {
          np.speedKmh = Math.max(0, p.coords.speed * 3.6);
        } else if (self.pos) {
          var dt = (np.at - self.pos.at) / 1000;
          if (dt > 0.5) {
            var d = haversine(self.pos.lat, self.pos.lng, np.lat, np.lng);
            np.speedKmh = (d / dt) * 3.6;
          }
        }
        self.prev = self.pos;
        self.pos = np;
        self._updateDrivingLock(np);

        if (self._cb.onPosition) self._cb.onPosition(np);

        var now = Date.now();
        if (now - self._lastRun < (G.minIntervalMs || 3000)) return;
        self._lastRun = now;
        self._tick();
      }, function (err) {
        self.tracking = false;
        s('位置情報が取得できません（' + err.message + '）', 'error');
      }, { enableHighAccuracy: G.highAccuracy !== false,
           timeout: G.timeout || 15000, maximumAge: G.maximumAge || 5000 });
    },

    stop: function () {
      if (this._watchId != null) navigator.geolocation.clearWatch(this._watchId);
      this._watchId = null; this.tracking = false; this._dwell = {};
      if (this._hydrationTimer) clearInterval(this._hydrationTimer);
    },

    /* ── 走行中ロック ────────────────────────────────────────
       設計上いちばん大事な部分です。
       速度がしきい値を超えたら、画面の操作を止めます。
       これは「速く走ると損をする」仕組みではなく、
       「走っている間はスマホを見る意味がない」状態を作るためのものです。
       停止してから unlockDelaySec 秒待って解除します。          */
    _updateDrivingLock: function (np) {
      if (S.drivingLock !== true) return;
      var v = np.speedKmh;
      if (v == null) return;

      if (v > (S.lockSpeedKmh || 15)) {
        this._stoppedAt = 0;
        if (!this.driving) {
          this.driving = true;
          if (this._cb.onDriving) this._cb.onDriving(true, Math.round(v));
        }
      } else {
        if (!this._stoppedAt) this._stoppedAt = Date.now();
        var held = (Date.now() - this._stoppedAt) / 1000;
        if (this.driving && held >= (S.unlockDelaySec || 5)) {
          this.driving = false;
          if (this._cb.onDriving) this._cb.onDriving(false, Math.round(v));
        }
      }
    },

    /* ── 熱中症の休憩案内 ─────────────────────────────────── */
    _startHydration: function () {
      var self = this, min = S.hydrationReminderMin || 0;
      if (!min) return;
      this._hydrationTimer = setInterval(function () {
        if (self._cb.onSafety)
          self._cb.onSafety('水分をとってください。日陰で休むのも作戦のうちです。', 'hydration');
      }, min * 60000);
    },

    /* ── 毎回の判定 ──────────────────────────────────────── */
    _tick: function () {
      var self = this;
      if (S.emergencyStop) return;
      var list = this._emit();

      /* 走行中は自動占領も止めます。停まらなければ取れません。 */
      if (this.driving) return;
      if (!F.auto_checkin) return;

      list.forEach(function (row) {
        var cp = row.cp, r = row.judge, id = cp.id, mode = row.mode;

        if (self._taken[id] && !J.autoRepeat) { delete self._dwell[id]; return; }
        if (!row.open) { delete self._dwell[id]; return; }

        /* 接近通知：80m手前で一度だけ知らせる（自動占領はしない） */
        if (F.near_notice && r.dist != null &&
            r.dist <= (J.nearNoticeM || 80) && !self._noticed[id]) {
          self._noticed[id] = true;
          if (self._cb.onNear) self._cb.onNear(cp, r, mode);
        }

        /* 自動占領は mode:'auto' の陣所だけ。
           写真・クイズ・手動・承認の陣所は、人の操作を必ず挟みます。 */
        if (mode !== 'auto') { delete self._dwell[id]; return; }

        if (r.state === 'in') {
          /* 圏内に入った瞬間ではなく dwellSec 秒とどまってから確定。
             車で通り過ぎただけでは取れません。                  */
          if (!self._dwell[id]) self._dwell[id] = Date.now();
          var held = (Date.now() - self._dwell[id]) / 1000;
          if (held >= (J.dwellSec || 20)) {
            self._taken[id] = Date.now();
            delete self._dwell[id];
            if (self._cb.onCheckin) self._cb.onCheckin(cp, r, 'auto');
          } else if (self._cb.onStatus) {
            self._cb.onStatus(cp.name + '：占領まであと ' +
              Math.ceil((J.dwellSec || 20) - held) + ' 秒', 'ok');
          }
        } else {
          delete self._dwell[id];
          if (r.state === 'maybe' && J.holdToGM && self._cb.onHold) self._cb.onHold(cp, r);
        }
      });
    },

    _emit: function () {
      var self = this, t = nowHM();
      var list = this.cps.map(function (cp) {
        return { cp: cp, mode: modeOf(cp), judge: judge(cp, self.pos),
                 open: isOpen(cp, t), taken: !!self._taken[cp.id],
                 dwellLeft: self._dwell[cp.id]
                   ? Math.max(0, Math.ceil((J.dwellSec || 20) -
                       (Date.now() - self._dwell[cp.id]) / 1000)) : null };
      });
      list.sort(function (a, b) {
        var da = a.judge.dist == null ? 1e9 : a.judge.dist;
        var db = b.judge.dist == null ? 1e9 : b.judge.dist;
        return da - db;
      });
      if (this._cb.onJudge) this._cb.onJudge(list);
      return list;
    },

    /* ── 人が操作して占領する ────────────────────────────────
       写真・全員写真・クイズ・接近・手動 の陣所はここを通ります。
       proof = { photo:true, people:6, answer:'…' } の形で渡します。 */
    claim: function (cpId, proof) {
      proof = proof || {};
      if (S.emergencyStop) return { ok: false, msg: S.emergencyMessage };
      if (this.driving) return { ok: false, msg: '走行中は操作できません。停車してから行ってください' };

      var cp = this.cps.filter(function (c) { return c.id === cpId; })[0];
      if (!cp) return { ok: false, msg: '陣所が見つかりません' };
      if (!isOpen(cp)) return { ok: false, msg: cp.name + ' は閉門しています' };
      if (this._taken[cpId] && !J.autoRepeat) return { ok: false, msg: 'すでに占領済みです' };

      var mode = modeOf(cp), r = judge(cp, this.pos);

      /* 位置の確認。manual だけは GPS を問いません。 */
      if (mode !== 'manual') {
        if (r.state === 'out')     return { ok: false, msg: r.reason };
        if (r.state === 'unknown') return { ok: false, msg: r.reason };
        if (r.state === 'maybe' && J.holdToGM)
          return { ok: false, pending: true, msg: '判定を保留し、本陣の承認に回しました', judge: r };
      }

      /* 提出物の確認 */
      if (mode === 'photo' || mode === 'manual') {
        if (!proof.photo) return { ok: false, msg: '写真の提出が必要です' };
      }
      if (mode === 'photo_group') {
        if (!proof.photo) return { ok: false, msg: '写真の提出が必要です' };
        var need = (this.me.partySize || S.minPartySize || 2);
        if (!(proof.people >= need))
          return { ok: false, msg: '組の全員（' + need + '名）が写った写真が必要です' };
      }
      if (mode === 'quiz') {
        if (!proof.answer) return { ok: false, msg: '答えの入力が必要です' };
      }
      if (mode === 'gm') {
        return { ok: false, pending: true, msg: '本陣の承認をお待ちください', judge: r };
      }

      this._taken[cpId] = Date.now();
      if (this._cb.onCheckin) this._cb.onCheckin(cp, r, mode);
      return { ok: true, msg: cp.name + ' を占領しました（+' + (cp.pt || 0) + '点）', judge: r };
    },

    /* ── 運営卓から呼ぶもの ─────────────────────────────── */
    setScope: function (v) { G.scope = v; this.stop(); this.init(this._cb); },
    setModeAll: function (v) { J.override = (v === 'default' ? null : v); this.perCheckpointMode = {}; this._emit(); },
    setMode: function (cpId, v) { if (v === 'default') delete this.perCheckpointMode[cpId];
                                  else this.perCheckpointMode[cpId] = v; this._emit(); },
    setRadiusScale: function (n) { J.radiusScale = n; this._emit(); },
    setDwell: function (n) { J.dwellSec = n; },
    emergency: function (on) {
      S.emergencyStop = !!on;
      if (on) { this._dwell = {}; if (this._cb.onSafety) this._cb.onSafety(S.emergencyMessage, 'stop'); }
      this._emit();
    },
    approve: function (cpId) {
      var cp = this.cps.filter(function (c) { return c.id === cpId; })[0];
      if (!cp) return false;
      this._taken[cpId] = Date.now();
      if (this._cb.onCheckin) this._cb.onCheckin(cp, { state: 'gm' }, 'gm');
      return true;
    },
    release: function (cpId) { delete this._taken[cpId]; this._emit(); },
    reset: function () { this._taken = {}; this._dwell = {}; this._noticed = {}; this._emit(); },

    /* 小道具 */
    judge: judge, haversine: haversine, isOpen: isOpen,
    modeOf: modeOf, shouldTrack: shouldTrack, scopeLabel: scopeLabel,
    minutesToClose: function (cp) {
      if (!cp.open_to || cp.open_to === '24:00') return null;
      var p = cp.open_to.split(':'), d = new Date(), c = new Date(d);
      c.setHours(+p[0], +p[1], 0, 0);
      return Math.round((c - d) / 60000);
    },
    score: function () {
      var self = this, s = 0;
      this.cps.forEach(function (cp) { if (self._taken[cp.id]) s += (cp.pt || 0); });
      return s;
    },

    /* 現在の設定を rv_config.js に貼れる形で書き出す */
    exportConfig: function () {
      return JSON.stringify({
        GPS: { provider: G.provider, scope: G.scope, teams: G.teams },
        JUDGE: { override: J.override, dwellSec: J.dwellSec,
                 radiusScale: J.radiusScale, nearNoticeM: J.nearNoticeM },
        perCheckpointMode: this.perCheckpointMode
      }, null, 2);
    }
  };

  global.RVGeo = RVGeo;
  global.haversine = global.haversine || haversine;
})(window);
