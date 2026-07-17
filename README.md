# 別府國盗リ合戦 RVcamp2026

> REAL VALUE 会員合宿 2026.8.27（別府）｜ GPS陣取り × リアル地図 × LINE連携

## クイックスタート

1. `rv_config.js` の `ADMIN_TOKEN` を変更
2. GAS に `rv_gas_backend.gs` を貼ってデプロイ
3. GitHub Pages を有効化（`main` ブランチ、ルート）
4. `index.html` を開いてセルフ検証を確認

## 主要ファイル

| ファイル | 役割 | 誰が使う |
|---|---|---|
| `index.html` | 設営・検証HUB | 運営 |
| `Kunitori.html` | 観戦HUB（戦況・気象・36将） | 全員 |
| `rv_kunitori_board25.html` | 合戦盤 × リアル地図 | 全員 |
| `rv_player_app.html` | 武将画面（GPS占領・写真） | 参加者各自 |
| `rv_gm_dashboard.html` | GM本陣（承認・設定） | 運営のみ |
| `rv_config.js` | ★地図・得点・トークンの設定 | 運営が編集 |
| `rv_data.js` | ★25陣所・36将データ | 運営が編集 |

詳しくは [`docs/`](./docs/) フォルダを参照してください。

## ライセンス

Art-Crea / REAL VALUE 合宿専用。無断転載・商用利用禁止。
