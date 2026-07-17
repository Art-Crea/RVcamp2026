# 04 LINE公式アカウント連携 設定手順

## 全体像

```
参加者のLINEアプリ
  ↓「戦況」「登録 武将名」「写真」「位置情報」を送信
LINE公式アカウント（Messaging API）
  ↓ Webhook POST
GAS（rv_line_bot.gs）
  ↓ 返信 / スプレッドシートへ記録 / GMへPush通知
Googleスプレッドシート（STATEシート = rv_gas_backend.gs と共用）
```

---

## STEP 1: LINE Developers でチャネル作成（運営が行う・約10分）

1. [LINE Developers](https://developers.line.biz/) にログイン
2. 「プロバイダー」→「作成」（例：REAL VALUE 合宿）
3. 「Messaging API」チャネルを新規作成
   - チャネル名：別府國盗リ合戦
   - 業種：エンターテインメント
4. 「Messaging API設定」タブ → 「チャネルアクセストークン（長期）」→「発行」してコピー

---

## STEP 2: GAS にスクリプトプロパティを設定

Apps Script エディタの「プロジェクトの設定（歯車）」→「スクリプト プロパティ」：

| キー | 値 |
|---|---|
| `LINE_ACCESS_TOKEN` | 発行した長期アクセストークン |
| `LINE_WEBHOOK_KEY` | 自分で決める合言葉（例：`rv827line`） |
| `BOARD_URL` | `https://realvalue.art-crea.jp/` |
| `ADMIN_LINE_IDS` | 緊急通知を受け取る LINE ユーザーID（後述） |

**⚠ トークンはコードに直書きしないこと。** プロパティに置けばGitHubにコードを上げてもトークンは漏れません。

---

## STEP 3: GASのデプロイ

1. rv_gas_backend.gs のプロジェクト（既デプロイ済みのもの）を開く
2. 「ファイルを追加」→ 新しいスクリプトファイル → 名前：`rv_line_bot`
3. rv_line_bot.gs の中身を貼り付けて保存
4. 「デプロイ」→「新しいデプロイ」（または既存のデプロイに追記可）
   - 種類：ウェブアプリ
   - 実行：自分 ／ アクセス：全員

---

## STEP 4: Webhook URL の設定

発行された URL に合言葉を付けたものを LINE Developers に貼る：

```
https://script.google.com/macros/s/XXXX/exec?key=rv827line
```

LINE Developers「Messaging API設定」→ Webhook URL に貼る →「検証」ボタン → 200 OK が返ればOK

---

## STEP 5: 動作確認

1. LINE公式アカウントを友だち追加（QRコードはLINE Developersに表示されています）
2. 「ヘルプ」と送信 → コマンド一覧が返ってきたら成功

---

## 使えるコマンド（参加者向け）

| コマンド | 動作 |
|---|---|
| `ヘルプ` | コマンド一覧を返す |
| `戦況` | 赤軍/青軍の陣所数 + 盤面URL |
| `ランキング` | 得点合計（pt加重） |
| `陣所` | 25陣所の状態一覧（🔴🔵⚪） |
| `登録 武将名` | LINEユーザーIDと武将を紐付け |
| `緊急` | ADMIN_LINE_IDS の宛先にPush通知 |
| 写真を送る | Google Driveに保存→承認キューへ |
| 位置情報を送る | LOGシートにチェックイン記録 |

---

## 管理者（自分）の LINE ユーザーID の取得方法

1. GASをデプロイ後、公式アカウントに何かメッセージを送る
2. スプレッドシートの「LINE_LOG」シートに `doPost` が実行された記録が出る
3. または：「Apps Script」→「実行数」→ 実行ログ（`userId` が出る）
4. 取得した `U…` を `ADMIN_LINE_IDS` プロパティに設定

---

## 既知の制限事項

- GASのdoPostは `X-Line-Signature` ヘッダーを読めない（GASの仕様）。  
  代わりに `?key=…` の合言葉で認証しています（当日運用には十分）。
- 写真AIによる自動判定は未実装。GM本陣の目視承認キューで代替します。
- GASの無料枠 URL Fetch 20,000回/日 を超えると LINE返信が止まります  
  （36人・1日の国盗りでは到達しない）。
