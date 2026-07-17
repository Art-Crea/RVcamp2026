/**
 * rv_gas_backend.gs — 別府國盗リ合戦 スプレッドシート・バックエンド
 * =====================================================================
 * 【設営手順（5分）】
 *  1. Googleスプレッドシートを新規作成（名前：例「RV國盗リ合戦2026」）
 *  2. 拡張機能 → Apps Script を開く
 *  3. コード.gs の中身を全部消して、このファイルの中身を貼り付けて保存
 *  4. 右上「デプロイ」→「新しいデプロイ」→ 種類の選択：ウェブアプリ
 *       説明：kunitori
 *       次のユーザーとして実行：自分
 *       アクセスできるユーザー：★全員（Anyone）★  ← ここ重要
 *  5. デプロイ → 表示された「ウェブアプリURL」（.../exec で終わる）をコピー
 *  6. GM本陣（rv_gm_dashboard.html）の「接続」に貼って接続
 *
 * 【できること】
 *  - シート「STATE」に合戦の全状態がJSONで入ります（A2セル）
 *  - シート「LOG」に占領・承認の履歴が1行ずつ追記されます（当日の記録・表彰用）
 *  - 運営はスプレッドシートを見るだけで戦況が分かります
 *
 * 【注意】
 *  - アクセス「全員」＝URLを知っていれば誰でも読み書きできます。
 *    当日限りの運用にし、終わったらデプロイを「無効化」してください。
 *  - 遅延は約3秒（クライアント側ポーリング間隔）です。
 * =====================================================================
 */

const SHEET_STATE = 'STATE';
const SHEET_LOG   = 'LOG';

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function sheet_(name, headers) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers) sh.appendRow(headers);
  }
  return sh;
}

function readState_(room) {
  const sh = sheet_(SHEET_STATE, ['room', 'state_json', 'rev', 'updated']);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(room)) {
      try { return { row: i + 1, state: JSON.parse(rows[i][1]) }; }
      catch (e) { return { row: i + 1, state: null }; }
    }
  }
  return { row: 0, state: null };
}

function writeState_(room, state) {
  const sh = sheet_(SHEET_STATE, ['room', 'state_json', 'rev', 'updated']);
  const found = readState_(room);
  const row = [room, JSON.stringify(state), state.rev, new Date()];
  if (found.row) sh.getRange(found.row, 1, 1, 4).setValues([row]);
  else sh.appendRow(row);
}

/** 新しいログ行だけを LOG シートに追記（重複回避のため timestamp で判定） */
function appendLogs_(room, state) {
  const sh = sheet_(SHEET_LOG, ['時刻', 'ルーム', '内容', '赤', '青']);
  const last = Number(PropertiesService.getScriptProperties().getProperty('lastlog_' + room) || 0);
  const logs = (state.log || []).filter(function (l) { return l.ts > last; })
                                .sort(function (a, b) { return a.ts - b.ts; });
  if (!logs.length) return;
  const r = (state.owner || []).filter(function (v) { return v === 'r'; }).length;
  const b = (state.owner || []).filter(function (v) { return v === 'b'; }).length;
  logs.forEach(function (l) {
    sh.appendRow([new Date(l.ts), room, l.t, r, b]);
  });
  PropertiesService.getScriptProperties()
    .setProperty('lastlog_' + room, String(logs[logs.length - 1].ts));
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

/** GET: ?action=get&room=RV827 */
function doGet(e) {
  const room = (e && e.parameter && e.parameter.room) || 'RV827';
  const found = readState_(room);
  return json_({ ok: true, state: found.state });
}

/** POST: {action:'set', room, rev, state}  — rev で楽観ロック */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, error: 'busy' });
  }
  try {
    const body = JSON.parse(e.postData.contents);
    const room = body.room || 'RV827';
    const incoming = body.state;
    if (!incoming) return json_({ ok: false, error: 'no state' });

    const cur = readState_(room);

    // 楽観ロック：現在の rev 以下なら競合
    if (cur.state && Number(incoming.rev) <= Number(cur.state.rev)) {
      return json_({ ok: false, conflict: true, state: cur.state });
    }

    writeState_(room, incoming);
    appendLogs_(room, incoming);
    return json_({ ok: true, state: incoming });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** 手動リセット用（Apps Scriptエディタから実行） */
function resetRoom() {
  const room = 'RV827';
  const sh = sheet_(SHEET_STATE);
  const found = readState_(room);
  if (found.row) sh.deleteRow(found.row);
  PropertiesService.getScriptProperties().deleteProperty('lastlog_' + room);
  SpreadsheetApp.getUi().alert('ルーム ' + room + ' を削除しました');
}
