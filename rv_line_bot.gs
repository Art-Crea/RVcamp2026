/**
 * rv_line_bot.gs — 別府國盗リ合戦 LINE公式アカウント連携（v2）
 * =====================================================================
 * ⚠ 正直な前提：このスクリプトは Claude の環境では「実行検証」できません。
 *   LINE Developers の実チャネルの秘密情報が無いと動作確認ができないためです。
 *   LINE公式の Messaging API 仕様に忠実に書いてあります。初回だけご自身で
 *   「友だち追加 → メッセージ送信」までテストしてください（5分）。
 *
 * ── v2 での改善点 ──────────────────────────────────────────
 *  1. 秘密情報を「スクリプトプロパティ」に置く方式に変更（コードに直書きしない）
 *     → 万一このコードをGitHub等に上げても、トークンは漏れません。
 *  2. GASのdoPostは仕様上 X-Line-Signature ヘッダーを読めません（技術的事実）。
 *     そこで Webhook URL の末尾に ?key=あなたの合言葉 を付け、その一致で
 *     「なりすましPOST」を弾く簡易認証を追加しました（当日運用には十分）。
 *  3. コマンドを拡充：ヘルプ / 戦況 / ランキング / 陣所 / 登録 / 緊急
 *  4. 「戦況」に陣所名つきの内訳を追加。盤面URLもプロパティで差し替え可能に。
 * =====================================================================
 *
 * 【御社側で必要な準備（Claudeは代行できません）】
 *  1. LINE Developers (https://developers.line.biz/) でプロバイダー作成
 *  2. 「Messaging API」チャネルを新規作成（LINE公式アカウントが同時に作られます）
 *  3. チャネルアクセストークン（長期）を発行してコピー
 *
 * 【設営手順（このスクリプト側・5分）】
 *  1. rv_gas_backend.gs と同じ Apps Script プロジェクトに、このファイルを
 *     新しいスクリプトファイル（rv_line_bot.gs）として追加
 *  2. Apps Scriptエディタ左の「プロジェクトの設定（歯車）」→「スクリプト プロパティ」で
 *     次を登録（キー＝値）：
 *        LINE_ACCESS_TOKEN = 発行した長期アクセストークン
 *        LINE_WEBHOOK_KEY  = あなたが決める合言葉（例：rv827secret）
 *        BOARD_URL         = https://realvalue.art-crea.jp/  （任意・戦況返信に載る）
 *        ADMIN_LINE_IDS    = U... ,U...   （緊急通知の宛先。カンマ区切り・後から設定でOK）
 *  3. デプロイ →「新しいデプロイ」→ 種類：ウェブアプリ
 *        次のユーザーとして実行：自分 ／ アクセス：全員
 *  4. 発行された /exec URL の末尾に ?key=あなたの合言葉 を付けたものを、
 *     LINE Developers「Messaging API設定」→ Webhook URL に貼り、Webhook利用をON
 *        例：https://script.google.com/macros/s/XXXX/exec?key=rv827secret
 *  5. LINE公式アカウントを友だち追加し、「ヘルプ」と送って動作確認
 * =====================================================================
 */

/* ── 設定の読み込み（スクリプトプロパティ優先） ───────────────── */
function CFG_() {
  var p = PropertiesService.getScriptProperties();
  return {
    token:   p.getProperty('LINE_ACCESS_TOKEN') || '',
    hookKey: p.getProperty('LINE_WEBHOOK_KEY')   || '',   // 空なら認証チェックしない
    board:   p.getProperty('BOARD_URL')          || 'https://realvalue.art-crea.jp/',
    admins:  (p.getProperty('ADMIN_LINE_IDS') || '').split(',').map(function (s) { return s.trim(); }).filter(String),
    room:    p.getProperty('ROOM') || 'RV827'
  };
}

var SHEET_PLAYERS = 'PLAYERS';
var SHEET_PENDING = 'PENDING';
var DRIVE_FOLDER_NAME = 'RV國盗リ_写真提出';

/* ── LINE Webhook 受信 ───────────────────────────────────── */
function doPost(e) {
  try {
    var cfg = CFG_();

    // 簡易認証：Webhook URLに ?key=... を付けている場合、一致しないPOSTは無視
    if (cfg.hookKey) {
      var got = e && e.parameter && e.parameter.key;
      if (got !== cfg.hookKey) {
        return ContentService.createTextOutput('forbidden');
      }
    }

    var json = JSON.parse(e.postData.contents);
    (json.events || []).forEach(function (ev) { handleEvent_(ev, cfg); });
    return ContentService.createTextOutput('ok');
  } catch (err) {
    logToSheet_('doPost error: ' + err);
    return ContentService.createTextOutput('error');
  }
}

/* GASのdoPostは実行ログが残らないため、確認用にシートへ書く */
function logToSheet_(text) {
  try {
    var sh = sheet_('LINE_LOG', ['時刻', '内容']);
    sh.appendRow([new Date(), String(text)]);
  } catch (e) {}
}

function handleEvent_(ev, cfg) {
  var userId = ev.source && ev.source.userId;
  var replyToken = ev.replyToken;

  if (ev.type === 'follow') {
    reply_(cfg, replyToken,
      'はじめまして。別府國盗リ合戦の公式アカウントです。\n'
      + '「ヘルプ」で使い方、「戦況」で現在のスコア、「登録 武将名」で参戦登録ができます。');
    return;
  }

  if (ev.type !== 'message') return;
  var msg = ev.message;

  if (msg.type === 'text') {
    var text = (msg.text || '').trim();

    if (text === 'ヘルプ' || text === 'help' || text === '？' || text === '?') {
      reply_(cfg, replyToken,
        '【使えるコマンド】\n'
        + '・戦況 … 今の赤/青のスコア\n'
        + '・ランキング … 陣所の得点内訳\n'
        + '・陣所 … 25陣所の一覧\n'
        + '・登録 武将名 … 参戦登録（例：登録 武田信玄）\n'
        + '・緊急 … 本陣へ緊急連絡\n'
        + '写真・位置情報もそのまま送れます。');
      return;
    }
    if (text === '戦況') { reply_(cfg, replyToken, buildStatusText_(cfg)); return; }
    if (text === 'ランキング' || text === 'スコア') { reply_(cfg, replyToken, buildRankingText_(cfg)); return; }
    if (text === '陣所' || text === '陣所一覧') { reply_(cfg, replyToken, buildCpListText_(cfg)); return; }

    if (text.indexOf('登録') === 0) {
      var name = text.replace('登録', '').trim();
      if (!name) { reply_(cfg, replyToken, '「登録 武将名」の形で送ってください。例：登録 武田信玄'); return; }
      registerPlayer_(userId, name);
      reply_(cfg, replyToken, name + ' として登録しました。写真提出・位置情報の送信もこのトークでできます。');
      return;
    }
    if (text === '緊急' || text === 'SOS') {
      notifyAdmins_(cfg, '🚨緊急コール\n送信者: ' + (getPlayerName_(userId) || userId) + '\n至急、本人に連絡してください。');
      reply_(cfg, replyToken, '本陣へ緊急連絡を送信しました。安全を最優先にしてください。');
      return;
    }
    reply_(cfg, replyToken, '受け付けたコマンドがありません。「ヘルプ」と送ると使い方が出ます。');
    return;
  }

  if (msg.type === 'image') {
    var url = saveImageToDrive_(cfg, msg.id, userId);
    appendPending_(userId, url);
    reply_(cfg, replyToken, '写真を受け付けました。GM本陣の承認キューに入りました。判定をお待ちください。');
    return;
  }

  if (msg.type === 'location') {
    appendLog_(userId, msg.title || '', msg.latitude, msg.longitude);
    reply_(cfg, replyToken, '位置情報を記録しました：' + (msg.title || '(地点名なし)'));
    return;
  }
}

/* ── STATEシート（rv_gas_backend.gs と共有）からスコアを要約 ── */
function readSharedState_(cfg) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('STATE');
  if (!sh) return null;
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(cfg.room)) {
      try { return JSON.parse(rows[i][1]); } catch (e) { return null; }
    }
  }
  try { return JSON.parse(sh.getRange('A2').getValue()); } catch (e) { return null; }
}

function buildStatusText_(cfg) {
  try {
    var st = readSharedState_(cfg);
    if (!st) return '戦況の取得に失敗しました（盤面がまだ初期化されていない可能性があります）。';
    var owner = st.owner || [];
    var r = owner.filter(function (o) { return o === 'r'; }).length;
    var b = owner.filter(function (o) { return o === 'b'; }).length;
    var free = owner.length - r - b;
    var lead = r === b ? '互角' : (r > b ? '堀江軍(赤)リード' : '溝口軍(青)リード');
    return '【現在の戦況】' + lead + '\n'
      + '堀江軍（赤）: ' + r + ' 陣所\n'
      + '溝口軍（青）: ' + b + ' 陣所\n'
      + '未制圧: ' + free + '\n\n盤面: ' + cfg.board;
  } catch (err) {
    return '戦況の取得に失敗しました。';
  }
}

/* 得点（cps[].pt）で重み付けした陣取りランキング */
function buildRankingText_(cfg) {
  try {
    var st = readSharedState_(cfg);
    if (!st) return 'ランキングを取得できません（盤面が未初期化の可能性）。';
    var owner = st.owner || [];
    var cps = st.cps || [];
    var rPt = 0, bPt = 0;
    for (var i = 0; i < owner.length; i++) {
      var pt = (cps[i] && cps[i].pt) ? cps[i].pt : 40;
      if (owner[i] === 'r') rPt += pt;
      else if (owner[i] === 'b') bPt += pt;
    }
    var lead = rPt === bPt ? '互角' : (rPt > bPt ? '堀江軍(赤)リード' : '溝口軍(青)リード');
    return '【得点ランキング】' + lead + '\n'
      + '堀江軍（赤）: ' + rPt + ' pt\n'
      + '溝口軍（青）: ' + bPt + ' pt\n'
      + '※各陣所の得点は rv_data.js の pt で決まります。';
  } catch (err) {
    return 'ランキングを取得できません。';
  }
}

function buildCpListText_(cfg) {
  try {
    var st = readSharedState_(cfg);
    var cps = (st && st.cps) || [];
    var owner = (st && st.owner) || [];
    if (!cps.length) return '陣所一覧を取得できません。';
    var mark = { r: '🔴', b: '🔵' };
    var lines = cps.slice(0, 25).map(function (c, i) {
      return (i + 1) + '. ' + (mark[owner[i]] || '⚪') + ' ' + c.name + (c.pt ? '（' + c.pt + 'pt）' : '');
    });
    return '【25陣所】\n' + lines.join('\n');
  } catch (err) {
    return '陣所一覧を取得できません。';
  }
}

/* ── プレイヤー登録 ── */
function registerPlayer_(userId, name) {
  var sh = sheet_(SHEET_PLAYERS, ['userId', '武将名', '登録日時']);
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === userId) { sh.getRange(i + 1, 2).setValue(name); return; }
  }
  sh.appendRow([userId, name, new Date()]);
}
function getPlayerName_(userId) {
  var sh = sheet_(SHEET_PLAYERS, ['userId', '武将名', '登録日時']);
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) if (data[i][0] === userId) return data[i][1];
  return null;
}

/* ── 写真の保存＆承認キュー追加 ── */
function saveImageToDrive_(cfg, messageId, userId) {
  var res = UrlFetchApp.fetch('https://api-data.line.me/v2/bot/message/' + messageId + '/content', {
    headers: { Authorization: 'Bearer ' + cfg.token }
  });
  var folder = getOrCreateFolder_(DRIVE_FOLDER_NAME);
  var file = folder.createFile(res.getBlob().setName(messageId + '.jpg'));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}
function getOrCreateFolder_(name) {
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}
function appendPending_(userId, photoUrl) {
  var sh = sheet_(SHEET_PENDING, ['日時', 'userId', '武将名', '写真URL', 'ステータス']);
  sh.appendRow([new Date(), userId, getPlayerName_(userId) || '(未登録)', photoUrl, '承認待ち']);
}

/* ── 位置情報ログ（rv_gas_backend.gs の LOG シートに合流） ── */
function appendLog_(userId, title, lat, lng) {
  var sh = sheet_('LOG', ['時刻', 'ルーム', '内容', '赤', '青']);
  var name = getPlayerName_(userId) || userId;
  sh.appendRow([new Date(), '', 'LINEチェックイン: ' + name + ' が ' + title + '（' + lat + ',' + lng + '）から報告', '', '']);
}

/* ── 管理者へのPush通知（緊急コール） ── */
function notifyAdmins_(cfg, text) {
  cfg.admins.forEach(function (uid) { if (uid) push_(cfg, uid, text); });
}

/* ── LINE API 呼び出し ── */
function reply_(cfg, replyToken, text) {
  if (!cfg.token) { logToSheet_('LINE_ACCESS_TOKEN 未設定。返信できません'); return; }
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + cfg.token },
    muteHttpExceptions: true,
    payload: JSON.stringify({ replyToken: replyToken, messages: [{ type: 'text', text: text }] })
  });
}
function push_(cfg, userId, text) {
  if (!cfg.token) return;
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + cfg.token },
    muteHttpExceptions: true,
    payload: JSON.stringify({ to: userId, messages: [{ type: 'text', text: text }] })
  });
}

/* ── 全登録プレイヤーへの一斉配信（ミッション告知用・手動実行） ──
   スクリプトプロパティ BROADCAST_TEXT に本文を入れてから、
   Apps Scriptエディタで broadcastPlayers を選び「実行」します。 */
function broadcastPlayers() {
  var cfg = CFG_();
  var text = PropertiesService.getScriptProperties().getProperty('BROADCAST_TEXT') || '（本文未設定）';
  var sh = sheet_(SHEET_PLAYERS, ['userId', '武将名', '登録日時']);
  var data = sh.getDataRange().getValues();
  var n = 0;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) { push_(cfg, data[i][0], text); n++; }
  }
  logToSheet_('broadcast sent to ' + n + ' players');
}

function sheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); if (headers) sh.appendRow(headers); }
  return sh;
}
