# 01 ファイル一覧と役割

## リポジトリ構成（GitHub Pages / レンタルサーバー共通）

```
RVcamp2026/
├── index.html               ← 設営・検証HUB（このリポジトリの起点）
├── Kunitori.html            ← 公開観戦HUB（参加者・見学者向け）
├── rv_kunitori_board25.html ← 合戦盤 × リアル地図（参加者が見る中心画面）
├── rv_player_app.html       ← 武将画面（各自スマホ。GPS占領・写真提出）
├── rv_gm_dashboard.html     ← GM本陣（運営専用。承認・設定・割当）
├── rv_config.js             ← ★設定ファイル。地図・トークン・軍名はここ
├── rv_data.js               ← ★陣所25件・三十六将・家紋SVG
├── rv_sync.js               ← 同期エンジン（local / GAS / Firebase を切替）
├── rv_gmap.js               ← 地図層（OSM/Google切替・自動フォールバック）
├── rv_board_core.js         ← 合戦盤の本体ロジック
├── rv_style.css             ← 共通スタイル（墨×朱×藍×金の戦国テーマ）
├── rv_gas_backend.gs        ← GASコード（スプレッドシートバックエンド）
├── rv_line_bot.gs           ← LINE Bot受け皿（GASに追加するファイル）
├── CNAME                    ← realvalue.art-crea.jp（GitHub Pages カスタムドメイン）
├── portraits/               ← 36将の写実肖像 01_r.jpg〜36_b.jpg
└── docs/                    ← このドキュメント群
```

## 各ファイルが「誰のために」「何を」するか

| ファイル | 誰が使う | 何をする |
|---|---|---|
| `index.html` | 運営 | 設営確認・セルフ検証・各画面への導線 |
| `Kunitori.html` | 全員（観戦） | 戦況バー・36将・気象・タイムライン |
| `rv_kunitori_board25.html` | 全員 | 地図+盤面。観戦は誰でも／占領操作は運営or武将画面から |
| `rv_player_app.html` | 参加者（個人スマホ） | GPS占領申請・写真提出・疾風の采配 |
| `rv_gm_dashboard.html` | 運営のみ | ルール・承認キュー・武将割当・同期接続 |
| `rv_config.js` | 運営が編集 | 地図・admin token・軍名・同期先 |
| `rv_data.js` | 運営が編集 | **陣所座標・得点・ヒント・36将名前** |
| `rv_sync.js` | 自動 | local / GAS / Firebase の切替ロジック |
| `rv_gmap.js` | 自動 | OSM/Google 切替・8秒無応答→OSMフォールバック |
| `rv_board_core.js` | 自動 | 盤の描画・占領・反転・手番管理 |
| `rv_style.css` | 自動 | 全画面の共通デザイン |
| `rv_gas_backend.gs` | 運営がGASに貼る | スプレッドシートへの状態保存・LOG |
| `rv_line_bot.gs` | 運営がGASに追加 | LINE Webhook受信・戦況返信・写真保存 |

## GitHubには上げないもの

- `portraits/*.jpg` は上げてOK（820KB程度・合計36枚）
- `rv_gas_backend.gs` / `rv_line_bot.gs` は参考として置いてよいが、**実際に動くのはGASプロジェクト側**
- LINE アクセストークン・Googleマップキーは **絶対にコードに直書きしない**
